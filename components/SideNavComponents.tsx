"use client";

import { Button } from "./ui/Button";

export function PubChatList({ chatList }: { chatList: ChatList }) {
  return (
    <div className="text-white flex-col">
      {/* <p className="text-white">{JSON.stringify(chatList)}</p> */}
      <span className="mx-3 px-5 flex text-sm justify-between items-center font-bold mb-3">
        <p>CHANNELS</p>
        <Button variant={"ghost"} className="py-[0.125rem] px-2 m-0">
          +
        </Button>
      </span>
      <div className="flex-col gap-1">
        {chatList.map((chat) => {
          return (
            <a
              key={chat.chatId}
              href={`/chat/${chat.chatId}`}
              className="flex gap-3 text-sm text-neutral-400 hover:bg-neutral-700 duration-100 cursor-pointer rounded-md px-5 py-[.25rem] my-1 mx-3"
            >
              <p>#</p>
              {chat.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}
