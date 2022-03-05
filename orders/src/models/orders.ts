import mongoose from "mongoose";
import { OrderStatus } from "@hmdrza/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { TicketDoc } from "./ticket";

interface OrderAttrs {
  userId: string;
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

let orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    ticket: { type: mongoose.Types.ObjectId, ref: "Ticket", required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: mongoose.Schema.Types.Date, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

let Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
