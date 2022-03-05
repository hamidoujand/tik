import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";

let router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  let tickets = await Ticket.find({ orderId: undefined });

  res.send(tickets);
});

export { router as ticketsIndexRouter };
