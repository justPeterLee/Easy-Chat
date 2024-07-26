"use client";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Fragment, useRef, useState } from "react";
import { GCModal } from "../modal/chatModal/GCModal";
import { cn } from "@/lib/utils";
import { RxDotsVertical } from "react-icons/rx";
import { LeaveChat } from "../modal/chatAction/ChatAction";
import { MenuModal } from "../modal/MenuModal";

export function DBTitle() {
  const [modalState, setModalState] = useState(false);
  return (
    <>
      {modalState && <GCModal onClose={() => setModalState(false)} />}
      <div className="flex justify-between items-center h-10 w-auto ">
        <p className="text-xl text-white">Dashboard</p>
        <div>
          <Button
            onClick={() => setModalState(true)}
            className="bg-neutral-950 p-2 rounded"
          >
            <div className="flex justify-center items-center gap-2 text-sm">
              <p>Add Chat</p>
            </div>
          </Button>
        </div>
      </div>
    </>
  );
}

export function DBChatlist({
  chatlist,
  userId,
}: {
  chatlist: AllChatInfo[];
  userId: string | undefined;
}) {
  return (
    <>
      {chatlist.map((chatInfo) => {
        if (chatInfo.chatInfo === null)
          return <Fragment key={Math.random()}></Fragment>;

        return (
          <GCCard
            key={chatInfo.chatInfo.code}
            chatInfo={chatInfo}
            userId={userId}
          />
        );
      })}
    </>
  );
}

export function GCCard({
  chatInfo,
  userId,
}: {
  chatInfo: AllChatInfo;
  userId: string | undefined;
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [modalState, setModalState] = useState(false);

  return (
    <>
      <div className="h-40 w-auto bg-neutral-600  rounded-lg relative ">
        {/* ========== body (click anywhere on modal to go to chat) ========== */}
        <Link
          href={`/chat/${chatInfo.id}`}
          className="h-40 w-full flex flex-col hover:brightness-[.8] duration-75"
        >
          <div className="flex items-center justify-between gap-4 p-3 bg-neutral-900 rounded-t-lg">
            <img
              className="bg-neutral-500 h-10 w-10 rounded-full"
              src={chatInfo.chatInfo!.image}
            />
            <div className="flex flex-grow flex-col">
              <p className="text-neutral-300">{chatInfo.chatInfo!.title}</p>
              <span className="flex text-xs text-neutral-500 gap-2">
                <p>privacy: {chatInfo.chatInfo!.privacy ? "true" : "false"}</p>
                <p>memebers: {chatInfo.members}</p>
                <p>code: {chatInfo.chatInfo!.code}</p>
              </span>
            </div>
          </div>
        </Link>

        {/* ========== options button (open options menu) ========== */}
        <div
          ref={buttonRef}
          className="text-sm text-neutral-400 absolute top-5 right-3"
        >
          <Button
            onClick={() => {
              setModalState(true);
            }}
            className={cn({ "bg-neutral-700": modalState })}
            variant={"ghost"}
          >
            <RxDotsVertical color="#909090" />
          </Button>
        </div>
      </div>

      {/* ========== options menu ========== */}

      {modalState && buttonRef.current && (
        <MenuModal
          onClose={() => {
            setModalState(false);
          }}
          parentRef={buttonRef.current}
        >
          <LeaveChat
            onClose={() => {
              setModalState(false);
            }}
            chatInfo={chatInfo}
            userId={userId!}
          />
        </MenuModal>
      )}
    </>
  );
}
