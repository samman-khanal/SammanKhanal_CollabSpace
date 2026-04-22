import { Router } from "express";
import * as khaltiController from "../controllers/khalti.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/prices", khaltiController.getKhaltiPrices);
router.use(authMiddleware);
router.post("/initiate", khaltiController.initiateKhaltiPayment);
router.post("/verify", khaltiController.verifyKhaltiPayment);
router.get("/callback", khaltiController.handleKhaltiCallback);
router.get("/payments", khaltiController.getKhaltiPaymentHistory);

export default router;
