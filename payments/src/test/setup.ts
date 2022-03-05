import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../nats-wrapper.ts");

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
  jest.clearAllMocks();

  let collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // build a JWT payload {id,email}
  let payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "asdf@asf.com",
  };
  //create JWT
  let token = jwt.sign(payload, process.env.JWT_KEY!);
  // build session obj
  let session = { jwt: token };
  //turn it into json
  let sessionJSON = JSON.stringify(session);
  //encode it as Base64
  let base64 = Buffer.from(sessionJSON).toString("base64");
  //return a string as the cookie template
  return [`session=${base64}`];
};
