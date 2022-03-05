import { TicketCreatedEvent } from "@hmdrza/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";

let setup = async () => {
  //create an instance of listener
  let listener = new TicketCreatedListener(natsWrapper.client);

  let data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 120,
    title: "concert",
    userId: "asdf",
    version: 0, //because just created
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

it("creates and saves a ticket", async () => {
  let { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  let ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  let { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
