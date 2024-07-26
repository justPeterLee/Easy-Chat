"use client";

import Link from "next/link";
import { Button } from "../ui/Button";
import Image from "next/image";
import { GCModal } from "../modal/chatModal/GCModal";
import { Fragment, useState } from "react";
export function PubChatList({
  chatList,
}: {
  chatList: PublicChatList | null[];
}) {
  const [modalState, setModalState] = useState(false);

  return (
    <>
      {modalState && (
        <GCModal
          onClose={() => {
            setModalState(false);
          }}
        />
      )}
      <div className="text-white flex-col">
        <span className="mx-3 px-5 flex text-sm justify-between items-center font-bold mb-3">
          <p>CHANNELS</p>
          <Button
            onClick={() => {
              setModalState(true);
            }}
            variant={"ghost"}
            className="py-[0.125rem] px-2 m-0"
          >
            +
          </Button>
        </span>
        <div className="flex-col gap-1">
          {chatList.map((chat) => {
            if (chat === null) return <Fragment key={Math.random()}></Fragment>;
            return (
              <Link
                key={chat.chatId}
                href={`/chat/${chat.chatId}`}
                className="flex gap-3 text-sm text-neutral-400 hover:bg-neutral-700 duration-100 cursor-pointer rounded-md px-5 py-[.25rem] my-1 mx-3"
              >
                <p>#</p>
                {chat.title}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function UserTab({
  session,
}: {
  session: { user: { name: string; image: string } };
}) {
  return (
    <Link href={"/"} className="flex justify-center  w-full">
      <div className=" flex-1  flex justify-center items-center">
        <Image
          src={session.user.image}
          alt={"pfp"}
          width={60}
          height={60}
          className="rounded-full"
        />
      </div>
      <div className=" w-[60%]  flex  items-center">
        <p>{session.user.name}</p>
      </div>
    </Link>
  );
}
