import { TicketUpdatedEvent } from "@hmdrza/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

let setup = async () => {
  let listener = new TicketUpdatedListener(natsWrapper.client);

  let ticketId = new mongoose.Types.ObjectId().toHexString();

  let ticket = Ticket.build({ title: "concert", price: 120, id: ticketId });
  await ticket.save();

  let data: TicketUpdatedEvent["data"] = {
    id: ticketId,
    price: 130,
    title: "another concert",
    userId: "asdf",
    version: 1, //updated version
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("finds and updates the ticket", async () => {
  let { data, msg, listener, ticket } = await setup();

  await listener.onMessage(data, msg);

  let updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
});

it("acks the message", async () => {
  let { data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("not going to ack if the event is out of version", async () => {
  let { data, msg, listener, ticket } = await setup();
  data.version = 2;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    expect(msg.ack).not.toHaveBeenCalled();
    return;
  }
});
