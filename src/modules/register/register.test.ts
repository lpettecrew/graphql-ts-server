import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { User } from "../../entity/User";

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address();
  getHost = () => `http://127.0.0.1:${port}`;
});

const firstName = "bob";
const lastName = "junior";
const email = "bob@bob.com";
const password = "123";

const mutation = (em: string, pass: string) => `
mutation {
  register(firstName: "${firstName}", lastName: "${lastName}", email: "${em}", password: "${pass}") {
    path
    message
  }
}
`;

describe("Register user", async () => {
  test("Initial test", async () => {
    // register user test
    const response = await request(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Check for duplicate emails test", async () => {
    // check for duplicate emails
    const response2: any = await request(getHost(), mutation(email, password));
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0].path).toEqual("email");
  });

  test("Email too short & email not valid test", async () => {
    // email too short & email not valid
    const response3 = await request(getHost(), mutation("h", password));
    expect(response3.register).toHaveLength(2);
    expect(response3.register[0].path).toEqual("email");
    expect(response3.register[0].message).toEqual(
      "email must be at least 3 characters"
    );

    expect(response3.register[1].path).toEqual("email");
    expect(response3.register[1].message).toEqual(
      "email must be a valid email"
    );
  });
});
