import { Redis } from "ioredis";
import { Request } from "express";

export interface Session {
  userId?: string;
  req: Request;
}

export type Resolver = (
  parent: any,
  args: any,
  context: { redis: Redis; url: string; session: Session },
  info: any
) => any;

export type GraphLQMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: { redis: Redis; url: string; session: Session },
  info: any
) => any;

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
