import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validate, { validateParams } from "../../middlewares/validate.middleware.js";
import { createOrderSchema, orderIdParams, orderStatusSchema } from "./order.validator.js";
import {
  cancelOrderController,
  createOrderController,
  getOrderController,
  getOrdersController,
  updateOrderStatusController,
} from "./order.controller.js";

const router = Router();

router.use(authMiddleware);
router.post("/", roleMiddleware("customer"), validate(createOrderSchema), createOrderController);
router.get("/", roleMiddleware("customer", "admin"), getOrdersController);
router.get(
  "/:orderId",
  roleMiddleware("customer", "admin"),
  validateParams(orderIdParams),
  getOrderController,
);
router.post(
  "/:orderId/cancel",
  roleMiddleware("customer", "admin"),
  validateParams(orderIdParams),
  cancelOrderController,
);
router.patch(
  "/:orderId/status",
  roleMiddleware("admin"),
  validateParams(orderIdParams),
  validate(orderStatusSchema),
  updateOrderStatusController,
);

export default router;
