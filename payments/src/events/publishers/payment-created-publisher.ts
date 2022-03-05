import { PaymentCreated, Publisher, Subjects } from "@hmdrza/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreated> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
