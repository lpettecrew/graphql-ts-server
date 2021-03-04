import { request } from "graphql-request";

const email = "bob@bob.com";
const password = "bob";

const loginMutation = (em: string, pass: string) => `
    mutation {
        login(email: "${em}", password: "${pass}") {
            path
            message
        }
    }
`;

describe("login", () => {
  test("test mutation functionality", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );
    expect(response).toBeNull();
  });

  test("test if user exists", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, "123")
    );
    expect(response).toEqual({
      login: [
        {
          path: "email",
          message: "Incorrect email/password",
        },
      ],
    });
  });
});
