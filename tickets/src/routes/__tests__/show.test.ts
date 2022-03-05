import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

it("returns a 404 when ticket not found ", async () => {
  let ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${ticketId}`).send().expect(404);
});

it("returns a ticket if id exists", async () => {
  let { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(201);

  let { body: fetchedTicket } = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .send()
    .expect(200);

  expect(fetchedTicket.title).toEqual("concert");
});
