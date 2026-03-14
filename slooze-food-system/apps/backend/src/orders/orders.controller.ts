import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  regionId: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── Shared Region Cart ──────────────────────────────────────────────

  /** GET /orders/cart?restaurantId=xxx */
  @Get('cart')
  getRegionCart(@Query('restaurantId') restaurantId: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.getRegionCart(user.regionId, restaurantId);
  }

  /** POST /orders/cart */
  @Post('cart')
  upsertRegionCart(
    @Body() body: { restaurantId: string; items: { menuItemId: string; quantity: number }[] },
    @CurrentUser() user: RequestUser,
  ) {
    return this.ordersService.upsertRegionCart(user, body.restaurantId, body.items);
  }

  /** GET /orders/cart/join/:cartId — join a shared cart via link */
  @Get('cart/join/:cartId')
  joinCart(@Param('cartId') cartId: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.joinCart(user, cartId);
  }

  /** DELETE /orders/cart/:cartId/item/:menuItemId */
  @Delete('cart/:cartId/item/:menuItemId')
  removeItemFromCart(
    @Param('cartId') cartId: string,
    @Param('menuItemId') menuItemId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ordersService.removeItemFromCart(user, cartId, menuItemId);
  }

  /** DELETE /orders/cart/clear */
  @Delete('cart/clear')
  clearRegionCart(@CurrentUser() user: RequestUser) {
    return this.ordersService.clearRegionCart(user);
  }

  /** DELETE /orders/cart/:cartId */
  @Delete('cart/:cartId')
  clearCart(@Param('cartId') cartId: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.clearCart(user, cartId);
  }

  // ─── Standard CRUD ───────────────────────────────────────────────────

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: RequestUser) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.findOne(id, user);
  }

  @Post(':id/checkout')
  @Roles(Role.ADMIN, Role.MANAGER)
  checkout(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.checkout(id, user);
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.MANAGER)
  cancel(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.cancel(id, user);
  }
}
