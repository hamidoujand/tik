import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

it("it has a route handler for /api/tickets for POST", async () => {
  let response = await request(app).post("/api/tickets").send({});

  expect(response.statusCode).not.toEqual(400);
});

it("can only be accessed if user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns other than 401 if user is authenticated", async () => {
  let cookie = signin();
  let response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns a 400 if invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "", price: 120 })
    .expect(400);
});

it("returns a 400 if invalid price provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "concert", price: -120 })
    .expect(400);
});

it("creates a ticket when valid inputs", async () => {
  let response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(201);

  expect(response.body.title).toEqual("concert");
  expect(response.body.price).toEqual(120);
});

it("publishes the even", async () => {
  let response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "concert", price: 120 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
