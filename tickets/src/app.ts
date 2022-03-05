import "express-async-errors";
import express from "express";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@hmdrza/common";

import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { updateTicketRouter } from "./routes/update";
import { ticketsIndexRouter } from "./routes/index";

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);
app.use(ticketsIndexRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
