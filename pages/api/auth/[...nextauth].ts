import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/lib/redis";

import NextAuth from "next-auth/next";

const authOption: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "coolGuy123",
        },
        session: { label: "session", type: "text" },
      },
      async authorize(credentials, req) {
        console.log(credentials);
        return null;
      },
    }),
  ],
};

export default NextAuth(authOption);
