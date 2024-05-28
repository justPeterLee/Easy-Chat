import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/redis";

import NextAuth from "next-auth/next";

const authOption: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        id: { label: "User Id", type: "number" },
        username: {
          label: "Username",
          type: "text",
          placeholder: "coolGuy123",
        },
        session: { label: "session", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("credentials");
        if (!credentials) {
          return null;
        }
        const { id, username, session } = credentials;

        const user = { id: id, name: username };

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log(token);
      token.picture = "tesst";
      return token;
    },
    async session({ token, session }) {
      if (token && session.user) {
        session.user.image = token.picture;
      }
      return session;
    },
  },
};

export default NextAuth(authOption);
