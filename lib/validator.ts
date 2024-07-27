import { title } from "process";
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

export const updateChatValidator = z
  .object({
    title: z.string(),
    description: z.string(),
    privacy: z.boolean(),
    password: z.boolean(),
    oldpassword: z.string().optional(),
    newpassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.title.replace(/\s/g, "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "invalid title",
      });
    }

    if (
      data.privacy &&
      data.password &&
      data.newpassword &&
      (!data.oldpassword || !data.oldpassword.replace(/\s/g, ""))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "invalid password",
        path: ["oldpassword"],
      });
    }

    if (!data.newpassword?.replace(/\s/g, "") && data.oldpassword) {
      ctx.addIssue({
        code: "custom",
        message: "invalid password",
        path: ["newpassword"],
      });
    }

    if (
      data.privacy &&
      !data.password &&
      (!data.newpassword || !data.newpassword.replace(/\s/g, ""))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "invalid password",
        path: ["newpassword"],
      });
    }
    return z.NEVER;
  });

export type UpdateChat = z.infer<typeof updateChatValidator>;

export const generatedChatDataValidator = z.object({
  code: z.string(),
  image: z.string(),
});
export type GenChatData = z.infer<typeof createChatValidator>;

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

// Join Chat
export const joinChatValidator = z
  .object({
    code: z.string(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.code.replace(/\s/g, "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["code"],
        message: "invalid code",
      });
    }

    return z.NEVER;
  });

export type JoinChat = z.infer<typeof joinChatValidator>;

// User Action
export const userActionValidator = z.object({
  userId: z.number(),
  chatId: z.number(),
});

// delete chat
export const memberSchema = z.object({
  id: z.string(),
  username: z.string(),
  image: z.string(),
  isBan: z.boolean(),
  isMute: z.boolean(),
  role: z.enum(["owner", "admin", "member"]),
  joined: z.number(),
});

export const deleteChatValidator = z.object({
  chatId: z.number(),
  chatCode: z.string(),
  forceDelete: z.boolean(),
  newOwner: memberSchema.nullable(),
});

export type deleteChat = z.infer<typeof deleteChatValidator>;
