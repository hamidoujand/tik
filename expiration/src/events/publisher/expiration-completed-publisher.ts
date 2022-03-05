import { Publisher, ExpirationCompleteEvent, Subjects } from "@hmdrza/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
