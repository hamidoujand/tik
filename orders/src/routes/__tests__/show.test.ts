import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
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

  let { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.ticket.title).toEqual(ticket.title);
});
