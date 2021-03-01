import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
import { createTypeormConn } from "./utils/createTypeormConn";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import * as Redis from "ioredis";
import { User } from "./entity/User";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const schema: any = mergeSchemas({ schemas });

  const redis = new Redis();

  const server = new GraphQLServer({
    schema,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
    }),
  });

  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId: string = (await redis.get(id)) || "";
    if (userId) {
      User.update({ id: userId }, { confirmed: true });
      res.send("ok"); // on success, we should redirect user to front end site.
    } else {
      res.send("invalid");
    }
  });

  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log("server running on http://localhost:4000");

  return app;
};
