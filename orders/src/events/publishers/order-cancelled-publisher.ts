import { Publisher, OrderCancelledEvent, Subjects } from "@hmdrza/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
