import { Subjects, TicketUpdatedEvent, Publisher } from "@hmdrza/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
