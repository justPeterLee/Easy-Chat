import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const db = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type Command =
  | "zrange"
  | "sismember"
  | "get"
  | "smembers"
  | "hmget"
  | "hgetall";

export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandURL = `${
    process.env.UPSTASH_REDIS_REST_URL
  }/${command}/${args.join("/")}`;
  const response = await fetch(commandURL, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}
