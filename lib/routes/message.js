import express from 'express';
const router = express.Router();

import {
  receiveMessage,
  sendMessage,
  acknowledgeCompletion
} from '../controllers/messageController';

router.get('/topics/:topicId/receiveMessage', receiveMessage);
router.post('/topics/:topicId/sendMessage', sendMessage);
router.delete('/topics/:topicId/:messageId', acknowledgeCompletion);

export default router;
