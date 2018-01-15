import express from 'express';
const router = express.Router();

import {
  showEveryStatus
} from '../controllers/monitorController';

router.get('/monitor', showEveryStatus);

export default router;
