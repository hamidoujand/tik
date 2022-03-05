import { Listener, Subjects, TicketCreatedEvent } from "@hmdrza/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "../queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    let { title, price, id } = data;

    let ticket = Ticket.build({ title, price, id });
    await ticket.save();

    msg.ack();
  }
}
