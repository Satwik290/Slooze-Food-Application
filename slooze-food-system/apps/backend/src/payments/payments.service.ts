import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async updateMethod(updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId: updatePaymentDto.orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found for the specified order');
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { method: updatePaymentDto.method },
    });
  }
}
