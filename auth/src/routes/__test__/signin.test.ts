import request from "supertest";
import { app } from "../../app";

it("fails when an email that does not exist is supplied", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(400);
});

it("fails when incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  return request(app)
    .post("/api/users/signin")
    .send({ email: "asdf@asdf.com", password: "fdsa" })
    .expect(400);
});

it("sets the cookie when correct email and password is provided", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  let response = await request(app)
    .post("/api/users/signin")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
