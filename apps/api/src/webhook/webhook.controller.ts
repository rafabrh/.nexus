import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('evolution')
  @HttpCode(200)
  async handleEvolution(
    @Body() body: any,
    @Headers('x-instance-name') instanceName: string,
  ) {
    await this.webhookService.processEvent(instanceName, body);
    return { ok: true };
  }

  @Post('mercadopago')
  @HttpCode(200)
  async handleMercadoPago(
    @Body() body: any,
    @Headers('x-signature') signature: string,
  ) {
    await this.webhookService.processPayment(body, signature);
    return { ok: true };
  }
}
