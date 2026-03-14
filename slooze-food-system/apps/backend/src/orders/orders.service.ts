import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';

// ── Gateway interface ────────────────────────────────────────────────────
// Defined here so orders.service.ts has zero dependency on the gateway file.
// CartGateway implements this interface — TypeScript is satisfied without
// needing to resolve the import when the module path is broken.
export const CART_GATEWAY = 'CART_GATEWAY';

export interface ICartGateway {
  emitCartUpdate(regionId: string, cart: unknown): void;
  emitCartCleared(regionId: string): void;
  emitUserJoined(regionId: string, userName: string): void;
}

interface RequestUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  regionId: string;
}

// Prisma result types for strong typing — eliminates all unsafe-member errors
type OrderItemWithRelations = Prisma.OrderItemGetPayload<{
  include: { menuItem: true; restaurant: true };
}>;

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    orderItems: { include: { menuItem: true; restaurant: true } };
    restaurant: true;
  };
}>;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(CART_GATEWAY) private cartGateway: ICartGateway,
  ) {}

  // ─── Shared Region Cart ───────────────────────────────────────────────

  async getRegionCart(regionId: string, _restaurantId: string) {
    return this.prisma.order.findFirst({
      where: { regionId, status: OrderStatus.CART },
      include: {
        orderItems: { include: { menuItem: true, restaurant: true } },
        restaurant: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async upsertRegionCart(
    user: RequestUser,
    restaurantId: string,
    items: { menuItemId: string; quantity: number }[],
  ) {
    // ── Region access guard ──────────────────────────────────────────
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (user.role !== 'ADMIN' && restaurant.regionId !== user.regionId) {
      throw new ForbiddenException(
        'You cannot add to a cart for a restaurant outside your region',
      );
    }

    const regionId = user.regionId;

    // ── Validate all menu items ──────────────────────────────────────
    for (const item of items) {
      const dbItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!dbItem || !dbItem.isAvailable || dbItem.restaurantId !== restaurantId) {
        throw new BadRequestException(`Invalid menu item: ${item.menuItemId}`);
      }
    }

    // ── Find ANY existing cart for this region ───────────────────────
    const existingCart = await this.prisma.order.findFirst({
      where: { regionId, status: OrderStatus.CART },
      include: { orderItems: { include: { menuItem: true, restaurant: true } } },
    });

    let updatedCart: OrderWithRelations;

    if (existingCart) {
      for (const item of items) {
        const dbItem = await this.prisma.menuItem.findUniqueOrThrow({
          where: { id: item.menuItemId },
        });

        const existing: OrderItemWithRelations | undefined = existingCart.orderItems.find(
          (o: OrderItemWithRelations) => o.menuItemId === item.menuItemId,
        );

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
              restaurantId,
            },
          });
        }
      }

      const updatedItems = await this.prisma.orderItem.findMany({
        where: { orderId: existingCart.id },
        include: { menuItem: true, restaurant: true },
      });
      const totalPrice = updatedItems.reduce(
        (sum: number, i: OrderItemWithRelations) => sum + i.price * i.quantity,
        0,
      );

      updatedCart = await this.prisma.order.update({
        where: { id: existingCart.id },
        data: { totalPrice },
        include: {
          orderItems: { include: { menuItem: true, restaurant: true } },
          restaurant: true,
        },
      });
    } else {
      let totalPrice = 0;
      const orderItemsData: {
        menuItemId: string;
        quantity: number;
        price: number;
        restaurantId: string;
      }[] = [];

      for (const item of items) {
        const dbItem = await this.prisma.menuItem.findUniqueOrThrow({
          where: { id: item.menuItemId },
        });
        totalPrice += dbItem.price * item.quantity;
        orderItemsData.push({
          menuItemId: dbItem.id,
          quantity: item.quantity,
          price: dbItem.price,
          restaurantId,
        });
      }

      updatedCart = await this.prisma.order.create({
        data: {
          userId: user.id,
          restaurantId: null,
          regionId,
          totalPrice,
          status: OrderStatus.CART,
          orderItems: { create: orderItemsData },
        },
        include: {
          orderItems: { include: { menuItem: true, restaurant: true } },
          restaurant: true,
        },
      });
    }

    this.cartGateway.emitCartUpdate(regionId, updatedCart);
    return updatedCart;
  }

  async removeItemFromCart(user: RequestUser, cartId: string, menuItemId: string) {
    const cart = await this.prisma.order.findUnique({
      where: { id: cartId },
      include: { orderItems: { include: { menuItem: true, restaurant: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.regionId !== user.regionId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Cannot modify a cart outside your region');
    }

    await this.prisma.orderItem.deleteMany({ where: { orderId: cartId, menuItemId } });

    const remaining = await this.prisma.orderItem.findMany({ where: { orderId: cartId } });
    const totalPrice = remaining.reduce(
      (s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity,
      0,
    );

    const updatedCart = await this.prisma.order.update({
      where: { id: cartId },
      data: { totalPrice },
      include: {
        orderItems: { include: { menuItem: true, restaurant: true } },
        restaurant: true,
      },
    });

    if (cart.regionId) {
      this.cartGateway.emitCartUpdate(cart.regionId, updatedCart);
    }

    return updatedCart;
  }

  async clearRegionCart(user: RequestUser) {
    const cart = await this.prisma.order.findFirst({
      where: { regionId: user.regionId, status: OrderStatus.CART },
    });
    if (!cart) return null;

    await this.prisma.order.delete({ where: { id: cart.id } });
    this.cartGateway.emitCartCleared(user.regionId);
    return null;
  }

  async clearCart(user: RequestUser, cartId: string) {
    const cart = await this.prisma.order.findUnique({ where: { id: cartId } });
    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.regionId !== user.regionId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Cannot clear a cart outside your region');
    }

    await this.prisma.order.delete({ where: { id: cartId } });

    if (cart.regionId) {
      this.cartGateway.emitCartCleared(cart.regionId);
    }
    return null;
  }

  async joinCart(user: RequestUser, cartId: string) {
    const cart = await this.prisma.order.findUnique({
      where: { id: cartId },
      include: {
        orderItems: { include: { menuItem: true, restaurant: true } },
        restaurant: true,
        region: true,
      },
    });

    if (!cart) throw new NotFoundException('Cart not found or already checked out');
    if (cart.status !== OrderStatus.CART) {
      throw new BadRequestException('This cart is no longer active');
    }
    if (user.role !== 'ADMIN' && cart.regionId !== user.regionId) {
      throw new ForbiddenException('You cannot join a cart outside your region');
    }

    if (cart.regionId) {
      this.cartGateway.emitUserJoined(cart.regionId, user.name ?? user.email);
    }

    return cart;
  }

  // ─── Standard CRUD ────────────────────────────────────────────────────

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
    const orderItemsData: {
      menuItemId: string;
      quantity: number;
      price: number;
      restaurantId: string;
    }[] = [];

    for (const item of items) {
      const dbItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!dbItem || !dbItem.isAvailable || dbItem.restaurantId !== restaurantId) {
        throw new BadRequestException(`Invalid menu item ID: ${item.menuItemId}`);
      }
      totalPrice += dbItem.price * item.quantity;
      orderItemsData.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: dbItem.price,
        restaurantId,
      });
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        totalPrice,
        status: OrderStatus.CART,
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { menuItem: true, restaurant: true } },
      },
    });
  }

  async findAll(user: RequestUser) {
    if (user.role === 'ADMIN') {
      return this.prisma.order.findMany({
        include: {
          restaurant: true,
          user: true,
          orderItems: { include: { menuItem: true, restaurant: true } },
        },
      });
    }
    if (user.role === 'MANAGER') {
      return this.prisma.order.findMany({
        where: { regionId: user.regionId },
        include: {
          restaurant: true,
          user: true,
          orderItems: { include: { menuItem: true, restaurant: true } },
        },
      });
    }
    return this.prisma.order.findMany({
      where: {
        OR: [{ userId: user.id }, { regionId: user.regionId, status: OrderStatus.CART }],
      },
      include: {
        restaurant: true,
        orderItems: { include: { menuItem: true, restaurant: true } },
      },
    });
  }

  async findOne(id: string, user: RequestUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: true, restaurant: true } },
        restaurant: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (user.role === 'MEMBER' && order.userId !== user.id && order.regionId !== user.regionId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    if (user.role === 'MANAGER' && order.regionId !== user.regionId) {
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
      include: {
        orderItems: { include: { menuItem: true, restaurant: true } },
        restaurant: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (user.role === 'MANAGER' && order.regionId !== user.regionId) {
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

    if (order.regionId) {
      this.cartGateway.emitCartCleared(order.regionId);
    }

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

    const cancelled = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    if (order.status === OrderStatus.CART && order.regionId) {
      this.cartGateway.emitCartCleared(order.regionId);
    }

    return cancelled;
  }
}