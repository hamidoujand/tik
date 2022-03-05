import express, { Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@hmdrza/common";
import { Order } from "../models/orders";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

let router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    //find the order
    let order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) throw new NotFoundError();
    //check if order belong to current user
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    //update its status to cancelled
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    //publish OrderCancelledEvent
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: { id: order.ticket.id },
      version: order.version,
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
