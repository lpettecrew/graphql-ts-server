import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedisStore from "connect-redis";

import { createTypeormConn } from "./utils/createTypeormConn";
import { redis } from "./startRedis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";

const SESSION_SECRET = "fjgsdfgsdflg;sdjfgsdfg";

const redisStore = connectRedisStore(session);

const schema: any = genSchema();

export const startServer = async () => {
  const server = new GraphQLServer({
    schema,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
    }),
  });

  server.express.use(
    session({
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new redisStore({
        client: redis as any,
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  const cors = {
    credentials: true,
    origin: "http://localhost:3000",
  };

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConn();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log("Server is running on localhost:4000");

  return app;
};
