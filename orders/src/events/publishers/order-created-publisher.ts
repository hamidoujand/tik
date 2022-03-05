import { Publisher, OrderCreatedEvent, Subjects } from "@hmdrza/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
