import { Router } from "express";
import * as subscriptionController from "../controllers/subscriptionController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", subscriptionController.createSubscription);
router.get("/", subscriptionController.listSubscriptions);
router.put("/:id", subscriptionController.updateSubscription);
router.delete("/:id", subscriptionController.deleteSubscription);

export { router as subscriptionRoutes };
