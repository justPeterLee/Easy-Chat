import { z } from "zod";

// Chatroom
export const createChatValidator = z
  .object({
    title: z.string(),
    description: z.string(),
    privacy: z.boolean(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.title.replace(/\s/g, "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "invalid title",
      });
    }

    if (data.privacy && (!data.password || !data.password.replace(/\s/g, ""))) {
      ctx.addIssue({
        code: "custom",
        message: "invalid password",
        path: ["password"],
      });
    }
    return z.NEVER;
  });

export type CreateChat = z.infer<typeof createChatValidator>;

// User
export const createUserValidator = z
  .object({
    username: z.string(),
  })
  .superRefine(({ username }, ctx) => {
    if (!username.replace(/\s/g, "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["username"],
        message: "invalid username",
      });
    }
  });
export type CreateUser = z.infer<typeof createUserValidator>;

// Messages
export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  message: z.string(),
  timestamp: z.number(),
});

export const messageArrayValidator = z.array(messageValidator);

export type Message = z.infer<typeof messageValidator>;
