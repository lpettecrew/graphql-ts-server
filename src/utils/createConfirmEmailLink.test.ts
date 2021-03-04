import { User } from "../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConn } from "./createTypeormConn";
import * as Redis from "ioredis";
import fetch from "node-fetch";

let userId = "";
const redis = new Redis();

beforeAll(async () => {
  await createTypeormConn();
  const user = await User.create({
    firstName: "bob",
    lastName: "bob",
    email: "bob@bob.com",
    password: "bob",
  }).save();

  userId = user.id;
});

describe("test createConfirmEmailLink", () => {
  test("Confirms user and clears key in redis", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId,
      new Redis()
    );

    const response = await fetch(await url);
    const text = await response.text();
    expect(text).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).confirmed).toBeTruthy();

    const chunks = url.split("/"); // splits url into chunks e.g. [confirm, id, userId]
    const key = chunks[chunks.length - 1]; // gets the final element (id)
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
});
