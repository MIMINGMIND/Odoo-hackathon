// routes/AuthRoutes.ts
import { Router } from 'express';
import {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword,
} from '../controllers/UserController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
