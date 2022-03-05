import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";

import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

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

    new OrderCancelledListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();

    process.on("SIGTERM", () => natsWrapper.client.close());
    process.on("SIGINT", () => natsWrapper.client.close());

    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Tickets listening on 3000!!!");
  });
};

start();
