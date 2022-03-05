import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Order } from "../../models/orders";
import { OrderStatus } from "@hmdrza/common";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if ticket does not exists", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: new mongoose.Types.ObjectId().toHexString() })
    .expect(404);
});

it("returns a 400 if ticket already reserved", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  let order = Order.build({
    ticket,
    expiresAt: new Date(),
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves the ticket", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  let { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(order.ticket.id).toEqual(ticket.id);
});

it("emits an order created event", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
