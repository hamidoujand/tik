import express, { Request, Response } from "express";

let router = express.Router();

router.get("/api/users/signout", (req: Request, res: Response) => {
  req.session = null;
  res.send({});
});

export { router as signoutRouter };
