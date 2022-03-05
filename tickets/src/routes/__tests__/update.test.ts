import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if ticket not exist", async () => {
  let ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(404);
});

it("returns a 401 if user is not authenticated", async () => {
  let ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${ticketId}`)

    .send({ title: "concert", price: 120 })
    .expect(401);
});

it("returns a 401 if user does not own the ticket", async () => {
  let { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(401);
});

it("returns a 400 if user pass invalid price and title", async () => {
  let { body: ticket } = await request(app)
    .post("/api/tickets/")
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", signin())
    .send({ title: "", price: 10 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", signin())
    .send({ title: "concert", price: -10 })
    .expect(400);
});

it("will update the ticket if valid inputs provided", async () => {
  let cookie = signin();
  let { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "concert", price: 120 })
    .expect(201);

  let { body: updatedTicket } = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "Big concert", price: 110 })
    .expect(200);

  expect(updatedTicket.title).toEqual("Big concert");
  expect(updatedTicket.price).toEqual(110);
});

it("publishes the event", async () => {
  let cookie = signin();
  let { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "concert", price: 120 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "Big concert", price: 110 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("returns a 400 if user tries to update a reserved ticket", async () => {
  let cookie = signin();
  let { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "concert", price: 120 })
    .expect(201);

  let ticketToReserve = await Ticket.findById(ticket.id);

  ticketToReserve!.set({
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticketToReserve!.save();

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "Big concert", price: 110 })
    .expect(400);
});
