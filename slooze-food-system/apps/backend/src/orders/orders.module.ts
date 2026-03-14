import { Module } from '@nestjs/common';
import { OrdersService, CART_GATEWAY } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CartGateway } from './cart.gateway';

@Module({
  imports: [PrismaModule],
  providers: [
    // CartGateway registered as itself AND as the CART_GATEWAY token.
    // useClass creates a single shared instance for both — no duplicate.
    CartGateway,
    {
      provide: CART_GATEWAY,
      useClass: CartGateway,
    },
    OrdersService,
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
