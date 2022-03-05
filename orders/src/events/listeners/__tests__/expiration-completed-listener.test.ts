import { ExpirationCompleteEvent, OrderStatus } from "@hmdrza/common";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/orders";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompletedListener } from "../expiration-completed-listener";

let setup = async () => {
  let listener = new ExpirationCompletedListener(natsWrapper.client);

  let ticket = Ticket.build({
    title: "concert",
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  let order = Order.build({
    userId: "asdf",
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  });
  await order.save();

  let data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  let { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  let updatedOrder = await Order.findById(data.orderId);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits order cancelled event as well", async () => {
  let { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("acks the message", async () => {
  let { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
