import { OrderStatus } from "@hmdrza/common";
import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Order } from "../../models/orders";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("marks an order as cancelled", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  let user = signin();
  let { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  let cancelledOrder = await Order.findById(order.id);

  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("publishes an order cancelled event", async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  let user = signin();
  let { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
