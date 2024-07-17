import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log(body);
    return new Response("OK");
  } catch (err) {
    return new Response("unable to create account", { status: 500 });
  }
};
