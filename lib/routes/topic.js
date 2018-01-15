import express from 'express';
const router = express.Router();

import { list, create, getStatus } from '../controllers/topicController';

router.get('/topics', list);
router.post('/topics', create);
router.get('/topics/:id', getStatus);

export default router;
