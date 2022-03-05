import request from "supertest";
import { app } from "../../app";

it("remove the cookie from the header", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "asdf@asdf.com", password: "asdf" })
    .expect(201);

  let response = await request(app).get("/api/users/signout").expect(200);

  expect(response.get("Set-Cookie")[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
