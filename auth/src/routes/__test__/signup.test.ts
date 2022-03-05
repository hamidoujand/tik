import request from "supertest";
import { app } from "../../app";

it("returns a 201 with successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);
});

it("returns a 400 with invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "asdf.com", password: "asdf" })
    .expect(400);
});

it("returns a 400 with invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asd" })
    .expect(400);
});

it("returns a 400 with missing email or password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ password: "asdf" })
    .expect(400);
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com" })
    .expect(400);
});

it("disallow duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(400);
});

it("sets the cookie on the response header", async () => {
  let response = await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
