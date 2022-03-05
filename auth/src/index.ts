import mongoose from "mongoose";

import { app } from "./app";

let start = async () => {
  console.log("Starting Auth...!!!!");
  if (!process.env.JWT_KEY)
    throw new Error("JWT_KEY environment variable is required");

  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI environment variable is required");

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Auth listening on 3000!!!");
  });
};

start();
