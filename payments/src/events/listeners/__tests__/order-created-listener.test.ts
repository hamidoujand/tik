import { OrderCreatedEvent, OrderStatus } from "@hmdrza/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

let setup = async () => {
  let listener = new OrderCreatedListener(natsWrapper.client);

  let data: OrderCreatedEvent["data"] = {
    expiresAt: "asdf",
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 120,
    },
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  //@ts-ignore
  let msg: Message = { ack: jest.fn() };

  return {
    listener,
    msg,
    data,
  };
};

it("saves the order into db", async () => {
  let { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  let order = await Order.findById(data.id);
  expect(order).toBeDefined();
});

it("acks the message", async () => {
  let { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
