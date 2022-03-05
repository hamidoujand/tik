import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

declare global {
  var signin: () => Promise<string[]>;
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongo = await MongoMemoryServer.create();
  let mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

beforeEach(async () => {
  let collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  let email = "asdf@asdf.com";
  let password = "asdf";

  let response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  let cookie = response.get("Set-Cookie");

  return cookie;
};
