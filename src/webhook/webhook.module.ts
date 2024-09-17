import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
