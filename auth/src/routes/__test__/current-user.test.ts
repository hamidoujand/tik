import request from "supertest";
import { app } from "../../app";

it("returns current user if you're signed in ", async () => {
  let cookie = await signin();
  let response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(400);

  expect(response.body.currentUser.email).toEqual("asdf@asdf.com");
});

it("returns null as currentUser is you are not signed in", async () => {
  let response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toBeNull();
});
