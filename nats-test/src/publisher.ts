import nats, { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

console.clear();

let stan = nats.connect("ticketing", "asdf", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to the Nats");

  let data = {
    id: "123",
    title: "Hot mom check",
    price: 3000,
  };

  new TicketCreatedPublisher(stan).publish(data);
});

interface Event {
  subject: Subjects;
  data: any;
}

abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];

  constructor(protected client: Stan) {}

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) return reject(err);

        console.log(`Event published to channel: ${this.subject}`);
        resolve();
      });
    });
  }
}

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects = Subjects.TicketCreated;
}
