import "express-async-errors";
import express from "express";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@hmdrza/common";

import { createPaymentRouter } from "./routes/new";

let app = express();

app.set("trust proxy", true);

app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);

app.use(createPaymentRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
