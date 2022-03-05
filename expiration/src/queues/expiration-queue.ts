import Queue from "bull";
import { ExpirationCompletedPublisher } from "../events/publisher/expiration-completed-publisher";
import { natsWrapper } from "../nats-wrapper";

interface QueueData {
  orderId: string;
}

let expirationQueue = new Queue<QueueData>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

//this code is for the that the time is up and bull need to do some processing
expirationQueue.process((job) => {
  console.log(
    "Bull: event with subject of 'expiration:complete' for orderId: ",
    job.data.orderId
  );

  new ExpirationCompletedPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
