import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

console.clear();

interface Event {
  subject: Subjects;
  data: any;
}

let stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener is connected to NATS");

  stan.on("close", () => {
    console.log("NATS client is closed");
    process.exit(0);
  });

  new TicketCreatedListener(stan).listen();
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());

abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void | Promise<void>;

  protected client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    let subscription = this.client.subscribe(
      this.subject,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(
        `Event Received from channel "${this.subject}" and station of "${this.queueGroupName}"`
      );

      let data: T["data"] = this.parseMessage(msg);

      this.onMessage(data, msg);
    });
  }

  parseMessage(msg: Message) {
    let data = msg.getData();

    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf-8"));
  }
}

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: TicketCreatedEvent["subject"] = Subjects.TicketCreated;
  queueGroupName: string = "tickets-queue-group-name";

  onMessage(data: any, msg: nats.Message): void | Promise<void> {
    console.log("WOW data received");
    console.log(data);
    msg.ack();
  }
}
