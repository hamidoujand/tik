import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@hmdrza/common";
import { body } from "express-validator";

import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

let router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").notEmpty().withMessage("token is required"),
    body("orderId").notEmpty().withMessage("orderId is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { orderId, token } = req.body;

    let order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("order is cancelled");

    //create a charge
    let charge = await stripe.charges.create({
      source: token,
      currency: "usd",
      amount: order.price * 100,
    });

    let payment = Payment.build({ orderId: order.id, stripeId: charge.id });
    await payment.save();

    //publish the event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: order.id,
      stripeId: charge.id,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createPaymentRouter };
