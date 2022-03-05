import {
  Listener,
  OrderStatus,
  PaymentCreated,
  Subjects,
} from "@hmdrza/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { queueGroupName } from "../queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreated> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: PaymentCreated["data"], msg: Message) {
    let order = await Order.findById(data.orderId);
    if (!order) throw new Error("order not found");

    order.set({ status: OrderStatus.Completed });
    await order.save();

    msg.ack();
  }
}
