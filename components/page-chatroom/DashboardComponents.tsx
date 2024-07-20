"use client";
import Link from "next/link";
import { Button } from "../ui/Button";
import { useState } from "react";
import { GCModal } from "../modal/GCModal";

export function DBChatlist({ chatlist }: { chatlist: allChatInfo[] }) {
  return (
    <>
      {chatlist.map((chatInfo) => {
        return <GCCard key={chatInfo.chatInfo.code} chatInfo={chatInfo} />;
      })}
    </>
  );
}

export function GCCard({ chatInfo }: { chatInfo: allChatInfo }) {
  return (
    <div className="h-40 w-auto bg-neutral-700  rounded-lg relative ">
      <Link
        href={`/chat/${chatInfo.id}`}
        className="h-40 w-full flex flex-col hover:brightness-[.8] duration-75"
      >
        <div className="flex items-center justify-between gap-4 p-3 bg-neutral-900 rounded-t-lg">
          <img
            className="bg-neutral-500 h-10 w-10 rounded-full"
            src={chatInfo.chatInfo.image}
          />
          <div className="flex flex-grow flex-col">
            <p className="text-neutral-300">{chatInfo.chatInfo.title}</p>
            <span className="flex text-xs text-neutral-500 gap-2">
              <p>privacy: {chatInfo.chatInfo.privacy ? "true" : "false"}</p>
              <p>memebers: {chatInfo.members}</p>
              <p>code: {chatInfo.chatInfo.code}</p>
            </span>
          </div>
        </div>
      </Link>
      <div className="text-sm text-neutral-400 absolute top-5 right-3">
        <Button variant={"ghost"}>:</Button>
      </div>
    </div>
  );
}

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
              {/* <p className="text-yellow-400">+</p> */}
            </div>
          </Button>
        </div>
      </div>
    </>
  );
}
