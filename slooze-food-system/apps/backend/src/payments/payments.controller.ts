import { Controller, Patch, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Patch('update-method')
  @Roles(Role.ADMIN)
  updateMethod(@Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.updateMethod(updatePaymentDto);
  }
}
