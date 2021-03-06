import { Resolver } from "../../types/graphql-utils";

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // middleware
  // console.log("Middleware args: ", args);
  const result = await resolver(parent, args, context, info);

  // afterware
  // console.log("Afterware result: ", result);
  return result;
};
