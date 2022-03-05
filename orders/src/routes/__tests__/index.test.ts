import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

let buildTicket = async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  return await ticket.save();
};

it("fetches all the orders for a particular user", async () => {
  let ticketOne = await buildTicket();
  let ticketTwo = await buildTicket();

  let userOne = signin();
  let userTwo = signin();

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id });

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketTwo.id });

  let { body: userOneOrders } = await request(app)
    .get("/api/orders")
    .set("Cookie", userOne)
    .expect(200);

  let { body: userTwoOrders } = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  expect(userOneOrders.length).toEqual(2);
  expect(userTwoOrders.length).toEqual(0);
});
