import express, { Request, Response } from "express";
import { requireAuth } from "@hmdrza/common";
import { Order } from "../models/orders";

let router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  let orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket"
  );
  res.send(orders);
});

export { router as indexOrderRouter };
