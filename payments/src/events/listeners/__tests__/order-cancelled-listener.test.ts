import { OrderCancelledEvent, OrderStatus } from "@hmdrza/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

let setup = async () => {
  let listener = new OrderCancelledListener(natsWrapper.client);

  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 120,
    status: OrderStatus.Created,
    userId: "asdf",
    version: 0,
  });

  await order.save();

  let data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: {
      id: "asdf",
    },
    version: 1,
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    msg,
  };
};

it("sets the status of an order to cancelled", async () => {
  let { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  let updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  let { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
