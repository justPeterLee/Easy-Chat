"use client";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Fragment, useEffect, useRef, useState } from "react";
import { GCModal } from "../modal/GCModal";
import { Modal } from "../modal/Backdrop";
import { cn } from "@/lib/utils";
import axios from "axios";
import { IoMdArrowDropdown } from "react-icons/io";
import { deleteChatValidator } from "@/lib/validator";

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
  const [warningModalState, setWarningModalState] = useState(false);

  const handleClose = () => {
    setModalState(false);
    setWarningModalState(false);
  };

  const handleLeave = async (
    forceDelete: boolean = false,
    newOwner: ChatMember | null = null,
    isOwner: boolean = false
  ) => {
    try {
      handleClose();

      const data = {
        chatId: chatInfo.id,
        chatCode: chatInfo.chatInfo!.code,
        forceDelete,
        newOwner,
      };

      const validChat = deleteChatValidator.parse(data);

      if (forceDelete || (newOwner === null && isOwner)) {
        await axios
          .post("/api/chat/delete", { chatId: validChat.chatId })
          .then(() => {
            axios.post("/api/chat/leave", validChat);
          });
      } else {
        await axios.post("/api/chat/leave", validChat);
      }
    } catch (err) {
      handleClose();
      console.log(err);
    }
  };
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
            :
          </Button>
        </div>
      </div>

      {/* ========== options menu ========== */}

      {modalState && buttonRef.current && (
        <Modal
          onClose={() => {
            handleClose();
          }}
          invisBack={true}
          modalCustomCords={{
            state: true,
            style: {
              top: `${buttonRef.current.getBoundingClientRect().bottom + 5}px`,
              right: `${
                innerWidth - buttonRef.current.getBoundingClientRect().right
              }px`,
            },
          }}
          modalClassName={` p-0 bg-neutral-700`}
        >
          {/* ---- leave button ---- */}
          <Button
            onClick={() => {
              setWarningModalState(true);
            }}
            className="bg-neutral-800 hover:brightness-90 text-red-600"
          >
            leave
          </Button>
        </Modal>
      )}

      {/* ========== warning modal (confirmation check) ========== */}
      {warningModalState && (
        <Modal
          onClose={() => {
            handleClose();
          }}
        >
          {/* ---- owner or member confirmation ---- */}
          {chatInfo.chatInfo!.owner.toString() == userId! ? (
            <DBLeaveChatOwner
              chatId={chatInfo.id}
              handleLeave={(forceDelete = false, newOwner = null) => {
                handleLeave(forceDelete, newOwner, true);
              }}
            />
          ) : (
            <div className="flex flex-col gap-3 justify-center items-center">
              <p>Are you sure you want to leave?</p>
              <Button
                onClick={() => {
                  handleLeave();
                }}
                className="bg-red-700 hover:bg-red-700"
              >
                Yes, leave Chat
              </Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export function DBLeaveChatOwner({
  chatId,
  handleLeave,
}: {
  chatId: number;
  handleLeave: (forceDelete: boolean, newOwner: ChatMember | null) => void;
}) {
  const [loading, setLodaing] = useState(true);
  const [memberList, setMemberList] = useState<ChatMember[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<ChatMember | null>(null);
  const [forceDelete, setForceDelete] = useState(false);

  const selectedRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    axios
      .get(`/api/chat/members/${chatId}`)
      .then((response) => {
        const memberObj = response.data as {
          [key: string]: ChatMember;
        };

        const memberArr = Object.keys(memberObj).map((key) => {
          return memberObj[key];
        });

        setMemberList(memberArr);
        setLodaing(false);
      })
      .catch((err) => {
        console.log(err);
        setLodaing(false);
      });
  }, [chatId]);

  if (loading) return <>loading</>;
  return (
    <div className="flex flex-col justify-center items-center w-[20rem] gap-5">
      <p className="p-5">
        Give ownership to another member or delete chat. (if no other members,
        chat will be deleted)
      </p>
      <div className="flex flex-col justify-center gap-1">
        <label className="text-sm text-neutral-500">select new owner :</label>

        <div className="flex flex-col justify-center">
          <div
            ref={selectedRef}
            className={
              " rounded  flex items-center relative p-1 border-2 border-neutral-500 gap-1 hover:cursor-default"
            }
            onClick={() => {
              setShowMenu(true);
            }}
          >
            {selectedOwner ? (
              <div className="flex items-center gap-3 bg-neutral-700 p-2 rounded hover:brightness-75 cursor-pointer w-[12rem] h-[3.5rem]">
                <img
                  className="bg-neutral-500 h-10 w-10 rounded-full"
                  src={selectedOwner.image}
                />
                <span className="flex gap-2 items-center">
                  <p>{selectedOwner.username}</p>
                </span>
              </div>
            ) : (
              <div className="w-[12rem] h-[3.5rem] flex items-center">
                <p className="text-neutral-500 p-2">select new owner</p>
              </div>
            )}
            <Button
              variant={"ghost"}
              className="w-1 h-[3.5rem] hover:bg-transparent"
            >
              <IoMdArrowDropdown color="#737373" className="-translate-x-1/2" />
            </Button>
          </div>
          {showMenu && selectedRef.current && memberList.length > 1 && (
            <Modal
              invisBack={true}
              modalCustomCords={{
                state: true,
                style: {
                  top: `${
                    selectedRef.current.getBoundingClientRect().bottom + 5
                  }px`,
                  left: `${
                    selectedRef.current.getBoundingClientRect().left + 6
                  }px`,
                },
              }}
              onClose={() => [setShowMenu(false)]}
              modalClassName="p-0"
            >
              <div className="bg-[#383838] w-[12rem] rounded p-1 flex flex-col gap-1">
                {memberList.map((member) => {
                  if (member.role === "owner") {
                    return <Fragment key={member.id} />;
                  }
                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedOwner(member);
                        setShowMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-3  p-2 rounded hover:brightness-75 cursor-pointer",
                        {
                          "bg-neutral-800": member.id == selectedOwner?.id,
                        }
                      )}
                    >
                      <img
                        className="bg-neutral-500 h-10 w-10 rounded-full"
                        src={member.image}
                      />
                      <span className="flex gap-2 items-center">
                        <p>{member.username}</p>
                        <p className="text-sm text-neutral-500">
                          {member.id == selectedOwner?.id && "(selected)"}
                        </p>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Modal>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center gap-2">
        <input
          type="checkbox"
          id="delete"
          checked={forceDelete}
          onChange={(e) => {
            setForceDelete(e.target.checked);
          }}
        />
        <label htmlFor="delete" className="text-sm text-neutral-500">
          delete chat
        </label>
      </div>
      <Button
        className="bg-red-700 hover:bg-red-700"
        onClick={() => {
          handleLeave(forceDelete, selectedOwner);
        }}
      >
        Leave Chat
      </Button>
    </div>
  );
}
