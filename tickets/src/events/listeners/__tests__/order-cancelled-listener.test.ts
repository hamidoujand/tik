import { OrderCancelledEvent } from "@hmdrza/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

let setup = async () => {
  let listener = new OrderCancelledListener(natsWrapper.client);

  let ticket = Ticket.build({ title: "concert", price: 123, userId: "asdf" });
  ticket.orderId = new mongoose.Types.ObjectId().toHexString();
  await ticket.save();

  let data: OrderCancelledEvent["data"] = {
    id: ticket.orderId,
    ticket: {
      id: ticket.id,
    },
    version: 1,
  };

  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("removes the orderId from ticket when order was cancelled", async () => {
  let { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  let updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
