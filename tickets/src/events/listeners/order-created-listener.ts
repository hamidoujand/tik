import { OrderCreatedEvent, Subjects, Listener } from "@hmdrza/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    let ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) throw new Error("ticket not found");

    //update it
    ticket.set({
      orderId: data.id,
    });
    await ticket.save();

    //publish event ticketUpdated
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });

    msg.ack();
  }
}
