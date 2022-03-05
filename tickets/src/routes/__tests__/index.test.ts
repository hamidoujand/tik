import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

let buildTicket = async () => {
  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();
};

it("returns a list of all tickets", async () => {
  await buildTicket();
  await buildTicket();
  await buildTicket();

  let { body: tickets } = await request(app)
    .get("/api/tickets")
    .send()
    .expect(200);

  expect(tickets.length).toEqual(3);
});
