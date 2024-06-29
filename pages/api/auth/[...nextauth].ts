import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/redis";

import NextAuth from "next-auth/next";

export const authOption: NextAuthOptions = {
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
        image: {},
      },
      async authorize(credentials, req) {
        console.log("credentials");
        if (!credentials) {
          return null;
        }
        const { id, username, session, image } = credentials;

        const user = { id: id, name: username, image: image };

        return user;
      },
    }),
  ],
  callbacks: {
    // async jwt({ token, user }) {
    //   return token;
    // },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export default NextAuth(authOption);
