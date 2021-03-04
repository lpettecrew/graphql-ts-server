import fetch from "node-fetch";

test("Sends invalid back if bad ID sent", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/123451245`);
  const text = await response.text();
  expect(text).toEqual("invalid");
});
