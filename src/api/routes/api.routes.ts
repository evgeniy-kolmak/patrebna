import { Router } from 'express';
import { parseAdHandler } from 'api/controllers/ad.controller';
import { parseAdsHandler } from 'api/controllers/ads.controller';
import { bepaidHandler } from 'api/controllers/bepaid.controller';

const router = Router();

router.get('/ad', parseAdHandler);
router.get('/ads', parseAdsHandler);
router.post('/bepaid', bepaidHandler);

export default router;
