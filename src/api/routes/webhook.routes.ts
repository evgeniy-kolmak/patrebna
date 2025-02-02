import { Router } from 'express';
import { bepaidWebhookHandler } from 'api/controllers/webhook.controller';

const router = Router();

router.post('/bepaid', bepaidWebhookHandler);

export default router;
