import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from "@hmdrza/common";
import { body } from "express-validator";

import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";

let router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").notEmpty().withMessage("title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let { title, price } = req.body;

    let ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    //publish the event
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
