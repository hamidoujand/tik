import "express-async-errors";
import express from "express";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@hmdrza/common";

import { newOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes/index";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";

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

app.use(newOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
