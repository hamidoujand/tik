import { OrderCreatedEvent, OrderStatus } from "@hmdrza/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

let setup = async () => {
  let listener = new OrderCreatedListener(natsWrapper.client);

  let ticket = Ticket.build({ title: "Concert", price: 120, userId: "asdf" });
  await ticket.save();

  let orderId = new mongoose.Types.ObjectId().toHexString();
  let data: OrderCreatedEvent["data"] = {
    expiresAt: "asdf",
    id: orderId,
    status: OrderStatus.Created,
    ticket: { id: ticket.id, price: ticket.price },
    userId: "asdf",
    version: 0,
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

it("sets orderId property of a ticket", async () => {
  let { listener, data, msg, orderId, ticket } = await setup();

  await listener.onMessage(data, msg);

  let updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(orderId);
});

it("acks the message", async () => {
  let { listener, data, msg, orderId, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticketUpdatedEvent", async () => {
  let { listener, data, msg, orderId, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  let ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.title).toEqual(ticket.title);
});
