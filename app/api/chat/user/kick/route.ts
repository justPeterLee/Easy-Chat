import { NextRequest } from "next/server";

export const POST = (req: NextRequest) => {
  try {
  } catch (err) {
    return new Response("unable to kick user", { status: 500 });
  }
};
