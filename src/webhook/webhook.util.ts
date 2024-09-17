import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

export interface AlchemyRequest extends Request {
  alchemy: {
    rawBody: string;
    signature: string;
  };
}

export function isValidSignatureForAlchemyRequest(
  request: AlchemyRequest,
  signingKey: string,
): boolean {
  if (!request.alchemy) {
    console.log(
      'isValidSignatureForAlchemyRequest: request.alchemy does not exist!',
    );
    return false;
  }
  return isValidSignatureForStringBody(
    request.alchemy.rawBody,
    request.alchemy.signature,
    signingKey,
  );
}

export function isValidSignatureForStringBody(
  body: string,
  signature: string,
  signingKey: string,
): boolean {
  const hmac = crypto.createHmac('sha256', signingKey);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  console.log(`signature check: ${signature === digest}`);
  return signature === digest;
}

export function addAlchemyContextToRequest(
  req: IncomingMessage,
  _res: ServerResponse,
  buf: Buffer,
  encoding: BufferEncoding,
): void {
  const signature = req.headers['x-alchemy-signature'];
  const body = buf.toString(encoding || 'utf8');
  (req as AlchemyRequest).alchemy = {
    rawBody: body,
    signature: signature as string,
  };
}

export function validateAlchemySignature(signingKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`validateAlchemySignature: signingKey: ${signingKey}`);
    if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKey)) {
      const errMessage = 'Signature validation failed, unauthorized!';
      res.status(403).send(errMessage);
      throw new Error(errMessage);
    } else {
      next();
      return true;
    }
  };
}

export interface AlchemyWebhookEvent {
  webhookId: string;
  id: string;
  createdAt: Date;
  type: AlchemyWebhookType;
  event: Record<any, any>;
}

export type AlchemyWebhookType =
  | 'MINED_TRANSACTION'
  | 'DROPPED_TRANSACTION'
  | 'ADDRESS_ACTIVITY';
