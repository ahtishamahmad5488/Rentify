import express from 'express';
import { listProperties, getProperty } from '../controllers/propertyPublicController.js';
import { incrementPropertyViews } from '../controllers/propertyController.js';

const router = express.Router();

router.get('/', listProperties);
router.get('/:id', getProperty);
router.patch('/:id/view', incrementPropertyViews);

export default router;
