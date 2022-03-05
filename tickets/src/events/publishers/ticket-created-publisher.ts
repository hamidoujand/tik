import { Publisher, TicketCreatedEvent, Subjects } from "@hmdrza/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
