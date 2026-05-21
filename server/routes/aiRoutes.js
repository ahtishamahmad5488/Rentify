import express from 'express';
import { recommend } from '../controllers/aiController.js';

const router = express.Router();

router.post('/recommend', recommend);

export default router;
