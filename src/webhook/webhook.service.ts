import { Injectable, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  type AlchemyWebhookEvent,
  addAlchemyContextToRequest,
  validateAlchemySignature,
} from './webhook.util';

@Injectable()
export class WebhookService {
  constructor() {}

  async handleTransferWebhook(
    req: Request,
    res: Response,
    webhookEvent: AlchemyWebhookEvent,
    signingKey: string,
  ) {
    const isValid = await this._validateSignature({
      req,
      res,
      webhookEvent,
      signingKey,
    });
    console.log('handleTransferWebhook isValid', isValid);

    // invalid signature
    if (!isValid) return res.status(HttpStatus.FORBIDDEN).send('Unauthorized');

    return res.status(200).send({ message: 'ok' });
  }

  private async _validateSignature({
    req,
    res,
    webhookEvent,
    signingKey,
  }: {
    req: Request;
    res: Response;
    webhookEvent: AlchemyWebhookEvent;
    signingKey: string;
  }): Promise<boolean> {
    addAlchemyContextToRequest(
      req,
      res,
      Buffer.from(JSON.stringify(req.body)),
      'utf8',
    );
    const isValidSignature = validateAlchemySignature(signingKey)(
      req,
      res,
      () => {},
    );
    if (!isValidSignature) {
      return false;
    }

    console.log(`Processing webhook event id: ${webhookEvent.id}`);

    return true;
  }
}
