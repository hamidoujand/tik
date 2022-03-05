import Stripe from "stripe";

export let stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2020-08-27",
});
