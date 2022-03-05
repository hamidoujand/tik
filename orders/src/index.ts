import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompletedListener } from "./events/listeners/expiration-completed-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

let start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error("JWT_KEY environment variable is required");

  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI environment variable is required");

  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL environment variable is required");
  }
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error("NATS_CLUSTER_ID environment variable is required");
  if (!process.env.NATS_CLIENT_ID)
    throw new Error("NATS_CLIENT_ID environment variable is required");

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("NATS connection is closed");
      process.exit();
    });

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompletedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    process.on("SIGTERM", () => natsWrapper.client.close());
    process.on("SIGINT", () => natsWrapper.client.close());

    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Orders listening on 3000!!!");
  });
};

start();
