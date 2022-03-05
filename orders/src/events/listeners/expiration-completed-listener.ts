import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  OrderStatus,
} from "@hmdrza/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "../queue-group-name";

export class ExpirationCompletedListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName: string = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    let order = await Order.findById(data.orderId).populate("ticket");
    if (!order) throw new Error("order");

    if (order.status === OrderStatus.Completed) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
      version: order.version,
    });

    msg.ack();
  }
}
