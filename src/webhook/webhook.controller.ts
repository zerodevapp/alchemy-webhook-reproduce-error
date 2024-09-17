import { Controller, Post, Req, Res, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request, Response } from 'express';
import { AlchemyWebhookEvent } from './webhook.util';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('transfer')
  async handleTransferWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Body() webhookEvent: AlchemyWebhookEvent,
  ) {
    console.log('receive webhookEvent event on:', webhookEvent.event.network);

    await this.webhookService.handleTransferWebhook(
      req,
      res,
      webhookEvent,
      process.env.SEPOLIA_WEBHOOK_SIGNING_KEY,
    );
  }
}
