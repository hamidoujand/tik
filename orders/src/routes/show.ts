import express, { Request, Response } from "express";
import { NotAuthorizedError, NotFoundError, requireAuth } from "@hmdrza/common";
import { Order } from "../models/orders";

let router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    let order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    res.send(order);
  }
);

export { router as showOrderRouter };
