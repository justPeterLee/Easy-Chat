"use client";

import Link from "next/link";
import { Button } from "../ui/Button";
import Image from "next/image";
import { GCModal } from "../modal/chatModal/GCModal";
import { Fragment, useRef, useState } from "react";
import { DeleteUserModal, ViewUserModal } from "../modal/userModal/UserModal";
import { cn } from "@/lib/utils";
import { Modal } from "../modal/Backdrop";
import { useSession } from "next-auth/react";
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

export function UserTab() {
  const { data } = useSession();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  if (!data) return <p className="text-white">loading</p>;

  return (
    <>
      <div
        ref={parentRef}
        className={cn(
          "w-[16rem] flex gap-3 text-neutral-300 hover:bg-neutral-700 duration-100 cursor-pointer px-3 py-2 my-1 fixed bottom-0 bg-[#191919]",
          { "bg-neutral-700": showUserModal }
        )}
        onClick={() => {
          setShowUserModal(true);
        }}
      >
        <div className="flex justify-center items-center">
          <Image
            src={data.user.image}
            alt={"pfp"}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col justify-center text-sm">
          <p>{data.user.name}</p>
          <p className="text-xs">status</p>
        </div>
      </div>

      {showUserModal && parentRef.current && (
        <ViewUserModal
          onClose={() => {
            setShowUserModal(false);
          }}
          showWarningModal={() => {
            setShowWarningModal(true);
          }}
          parentRef={parentRef.current}
        />
      )}

      {showWarningModal && (
        <DeleteUserModal
          onClose={() => {
            setShowWarningModal(false);
          }}
        />
      )}
    </>
  );
}
