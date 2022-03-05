import express, { Request, Response } from "express";
import mongoose from "mongoose";

import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@hmdrza/common";
import { body } from "express-validator";

import { Order } from "../models/orders";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

let EXPIRATION_WINDOW_SECONDS = 1 * 60;

let router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty()
      .withMessage("ticketId is required")
      .custom((ticketId: string) => {
        return mongoose.isValidObjectId(ticketId);
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // find the ticket that user tries to order
    let ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) throw new NotFoundError();
    // make sure that ticket is not already reserved
    let existingOrder = await Order.findOne({
      ticket,
      status: {
        $in: [
          OrderStatus.AwaitingPayment,
          OrderStatus.Created,
          OrderStatus.Completed,
        ],
      },
    });

    if (existingOrder) throw new BadRequestError("ticket already reserver");
    //calculate the expiration date for this order
    let expirationDate = new Date();
    expirationDate.setSeconds(
      expirationDate.getSeconds() + EXPIRATION_WINDOW_SECONDS
    );

    // build the order and save it to DB
    let order = Order.build({
      expiresAt: expirationDate,
      status: OrderStatus.Created,
      ticket,
      userId: req.currentUser!.id,
    });

    await order.save();

    //publish the corresponding event

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      expiresAt: order.expiresAt.toLocaleDateString(),
      status: order.status,
      ticket: { id: ticket.id, price: ticket.price },
      version: order.version,
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
