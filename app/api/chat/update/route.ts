import { db, fetchRedis } from "@/lib/redis";
import { decrypt, encrypt } from "@/lib/utils";
import { updateChatValidator } from "@/lib/validator";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOption);
    if (!session) return new Response("unauthorized", { status: 401 });

    const body = await req.json();
    const validatedBody = updateChatValidator.parse(body.data);

    // verify owner
    const owner = await fetchRedis("hmget", `chat:${body.id}`, "owner");

    if (!owner.length) return new Response("invalid chat", { status: 500 });
    if (owner[0] === null) return new Response("invalid chat", { status: 500 });

    if (owner[0] !== session.user.id)
      return new Response("unauthorized", { status: 401 });

    // changing password
    let passCheck = false;
    if (
      validatedBody.password &&
      validatedBody.privacy &&
      validatedBody.newpassword &&
      validatedBody.oldpassword
    ) {
      // password check
      const password = await fetchRedis("hmget", `chat:${body.id}`, "password");
      if (!password[0]) return new Response("invalid chat", { status: 500 });

      if (!decrypt(validatedBody.oldpassword, password[0]))
        return new Response("incorrect password", { status: 401 });
      passCheck = true;
    }

    if (validatedBody.privacy) {
      if (validatedBody.password && passCheck && validatedBody.newpassword) {
        await db.hset(`chat:${body.id}`, {
          password: encrypt(validatedBody.newpassword),
        });
      }
      if (!validatedBody.password && validatedBody.newpassword) {
        await db.hset(`chat:${body.id}`, {
          password: encrypt(validatedBody.newpassword),
        });
      }
    } else {
      await db.hset(`chat:${body.id}`, {
        title: validatedBody.title,
        description: validatedBody.description,
        privacy: validatedBody.privacy,
        password: "",
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("unable to update Chat", { status: 500 });
  }
};
