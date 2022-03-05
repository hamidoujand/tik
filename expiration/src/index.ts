import { natsWrapper } from "./nats-wrapper";

import { OrderCreatedListener } from "./events/listeners/order-created-listener";

let start = async () => {
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

    new OrderCreatedListener(natsWrapper.client).listen();

    natsWrapper.client.on("close", () => {
      console.log("NATS connection is closed");
      process.exit();
    });

    process.on("SIGTERM", () => natsWrapper.client.close());
    process.on("SIGINT", () => natsWrapper.client.close());

    console.log("Expiration service is up");
  } catch (err) {
    console.error(err);
  }
};

start();
