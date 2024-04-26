import express from 'express';
import { verifyToken } from '../middleware/auth';
import { getDashboardData } from '../controllers/dashboardController';

const router = express.Router();

router.get('/', verifyToken, getDashboardData);


export default router;
