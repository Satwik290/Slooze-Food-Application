import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  method!: string;
}
