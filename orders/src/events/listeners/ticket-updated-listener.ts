import { Listener, Subjects, TicketUpdatedEvent } from "@hmdrza/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "../queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    let ticket = await Ticket.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!ticket) throw new Error("ticket not found");

    //update it

    ticket.set({
      title: data.title,
      price: data.price,
    });
    await ticket.save();

    msg.ack();
  }
}
