import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  role: string;
  regionId: string;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ─── Shared Region Cart ───────────────────────────────────────────────

  /** Return the shared CART-status order for a region+restaurant, or null. */
  async getRegionCart(regionId: string, restaurantId: string) {
    return this.prisma.order.findFirst({
      where: {
        regionId,
        restaurantId,
        status: OrderStatus.CART,
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /** Add / update items in the shared region cart. Creates the cart if it doesn't exist. */
  async upsertRegionCart(
    user: RequestUser,
    restaurantId: string,
    items: { menuItemId: string; quantity: number }[],
  ) {
    // Validate region access
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (user.role !== 'ADMIN' && restaurant.regionId !== user.regionId) {
      throw new ForbiddenException('You cannot add to a cart for a restaurant outside your region');
    }

    const regionId = user.regionId;

    // Validate all menu items
    for (const item of items) {
      const dbItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!dbItem || !dbItem.isAvailable || dbItem.restaurantId !== restaurantId) {
        throw new BadRequestException(`Invalid menu item: ${item.menuItemId}`);
      }
    }

    // Check if ANY shared cart exists for this region
    const anyExistingCart = await this.prisma.order.findFirst({
      where: { regionId, status: OrderStatus.CART },
      include: { restaurant: true },
    });

    if (anyExistingCart && anyExistingCart.restaurantId !== restaurantId) {
      throw new ConflictException(
        `Your region already has an active cart with ${anyExistingCart.restaurant.name}. Please clear it first.`,
      );
    }

    const existingCart =
      anyExistingCart && anyExistingCart.restaurantId === restaurantId
        ? await this.prisma.order.findUnique({
            where: { id: anyExistingCart.id },
            include: { orderItems: { include: { menuItem: true } } },
          })
        : null;

    if (existingCart) {
      // Merge incoming items into existing cart
      for (const item of items) {
        const dbItem = await this.prisma.menuItem.findUniqueOrThrow({
          where: { id: item.menuItemId },
        });
        const existing = existingCart.orderItems.find((o) => o.menuItemId === item.menuItemId);
        if (existing) {
          await this.prisma.orderItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          await this.prisma.orderItem.create({
            data: {
              orderId: existingCart.id,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: dbItem.price,
            },
          });
        }
      }
      // Recalculate total
      const updatedItems = await this.prisma.orderItem.findMany({
        where: { orderId: existingCart.id },
        include: { menuItem: true },
      });
      const totalPrice = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return this.prisma.order.update({
        where: { id: existingCart.id },
        data: { totalPrice },
        include: {
          orderItems: { include: { menuItem: true } },
          restaurant: true,
        },
      });
    }

    // Create a new shared cart
    let totalPrice = 0;
    const orderItemsData: { menuItemId: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      const dbItem = await this.prisma.menuItem.findUniqueOrThrow({
        where: { id: item.menuItemId },
      });
      totalPrice += dbItem.price * item.quantity;
      orderItemsData.push({ menuItemId: dbItem.id, quantity: item.quantity, price: dbItem.price });
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        regionId,
        totalPrice,
        status: OrderStatus.CART,
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
      },
    });
  }

  /** Remove a single item from the shared cart. */
  async removeItemFromCart(user: RequestUser, cartId: string, menuItemId: string) {
    const cart = await this.prisma.order.findUnique({
      where: { id: cartId },
      include: { orderItems: { include: { menuItem: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.regionId !== user.regionId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Cannot modify a cart outside your region');
    }
    await this.prisma.orderItem.deleteMany({
      where: { orderId: cartId, menuItemId },
    });
    const remaining = await this.prisma.orderItem.findMany({
      where: { orderId: cartId },
    });
    const totalPrice = remaining.reduce((s, i) => s + i.price * i.quantity, 0);
    return this.prisma.order.update({
      where: { id: cartId },
      data: { totalPrice },
      include: { orderItems: { include: { menuItem: true } }, restaurant: true },
    });
  }

  /** Clear the shared cart for the user's region. */
  async clearRegionCart(user: RequestUser) {
    const regionId = user.regionId;
    const cart = await this.prisma.order.findFirst({
      where: { regionId, status: OrderStatus.CART },
    });
    if (!cart) return null; // No cart to clear
    await this.prisma.orderItem.deleteMany({ where: { orderId: cart.id } });
    return this.prisma.order.update({
      where: { id: cart.id },
      data: { totalPrice: 0 },
      include: { orderItems: { include: { menuItem: true } }, restaurant: true },
    });
  }

  /** Clear all items from the shared cart by ID. */
  async clearCart(user: RequestUser, cartId: string) {
    const cart = await this.prisma.order.findUnique({ where: { id: cartId } });
    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.regionId !== user.regionId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Cannot clear a cart outside your region');
    }
    await this.prisma.orderItem.deleteMany({ where: { orderId: cartId } });
    return this.prisma.order.update({
      where: { id: cartId },
      data: { totalPrice: 0 },
      include: { orderItems: { include: { menuItem: true } }, restaurant: true },
    });
  }

  // ─── Standard CRUD (unchanged) ────────────────────────────────────────

  async create(createOrderDto: CreateOrderDto, user: RequestUser) {
    const { restaurantId, items } = createOrderDto;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (user.role !== 'ADMIN' && restaurant.regionId !== user.regionId) {
      throw new ForbiddenException('You cannot order from a restaurant outside your region');
    }

    let totalPrice = 0;
    const orderItemsData: { menuItemId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const dbItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!dbItem || !dbItem.isAvailable || dbItem.restaurantId !== restaurantId) {
        throw new BadRequestException(`Invalid menu item ID: ${item.menuItemId}`);
      }
      totalPrice += dbItem.price * item.quantity;
      orderItemsData.push({ menuItemId: dbItem.id, quantity: item.quantity, price: dbItem.price });
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        totalPrice,
        status: OrderStatus.CART,
        orderItems: { create: orderItemsData },
      },
      include: { orderItems: true },
    });
  }

  async findAll(user: RequestUser) {
    if (user.role === 'ADMIN') {
      return this.prisma.order.findMany({
        include: { restaurant: true, user: true, orderItems: true },
      });
    }
    if (user.role === 'MANAGER') {
      return this.prisma.order.findMany({
        where: { restaurant: { regionId: user.regionId } },
        include: { restaurant: true, user: true, orderItems: true },
      });
    }
    // MEMBER: see own orders OR any shared cart in their region
    return this.prisma.order.findMany({
      where: {
        OR: [{ userId: user.id }, { regionId: user.regionId, status: OrderStatus.CART }],
      },
      include: { restaurant: true, orderItems: true },
    });
  }

  async findOne(id: string, user: RequestUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (user.role === 'MEMBER' && order.userId !== user.id && order.regionId !== user.regionId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    if (user.role === 'MANAGER' && order.restaurant.regionId !== user.regionId) {
      throw new ForbiddenException('Cannot view order outside your region');
    }

    return order;
  }

  async checkout(id: string, user: RequestUser) {
    if (user.role === 'MEMBER') {
      throw new ForbiddenException('Only managers or admins can checkout orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { restaurant: true, orderItems: { include: { menuItem: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Manager must be in the same region as the restaurant / cart
    if (user.role === 'MANAGER' && order.restaurant.regionId !== user.regionId) {
      throw new ForbiddenException('Cannot checkout an order outside your region');
    }

    if (order.status !== OrderStatus.CART) {
      throw new BadRequestException('Order is not in CART state');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CONFIRMED },
    });

    await this.prisma.payment.create({
      data: {
        method: 'CREDIT_CARD',
        amount: updatedOrder.totalPrice,
        paymentStatus: 'COMPLETED',
        orderId: updatedOrder.id,
      },
    });

    return updatedOrder;
  }

  async cancel(id: string, user: RequestUser) {
    if (user.role === 'MEMBER') {
      throw new ForbiddenException('Only managers or admins can cancel orders');
    }

    const order = await this.findOne(id, user);

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order cannot be cancelled in its current state');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });
  }
}
