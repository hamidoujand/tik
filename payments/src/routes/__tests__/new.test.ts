import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Order } from "../../models/order";
import { OrderStatus } from "@hmdrza/common";
import { Payment } from "../../models/payment";

jest.mock("../../stripe.ts");

it("will return a 404 if you try to purchase an order that not exists", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "asdf",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("will return a 400 if you try to purchase a cancelled order", async () => {
  let userId = new mongoose.Types.ObjectId().toHexString();

  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 120,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 1,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "asdf",
      orderId: order.id,
    })
    .expect(400);
});

it("creates a charge when inputs are valid", async () => {
  let userId = new mongoose.Types.ObjectId().toHexString();

  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 120,
    status: OrderStatus.Created,
    userId: userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);
});

it("creates a payment object into our db after successful charge", async () => {
  let userId = new mongoose.Types.ObjectId().toHexString();

  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 120,
    status: OrderStatus.Created,
    userId: userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  let payment = await Payment.findOne({ stripeId: "asdf" });

  expect(payment).toBeDefined();
});
