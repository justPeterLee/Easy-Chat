"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { deleteChatValidator } from "@/lib/validator";
import axios from "axios";
import { Fragment, useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { Modal } from "../Backdrop";

export function LeaveChat({
  onClose,
  chatInfo,
  userId,
}: {
  onClose: () => void;
  chatInfo: AllChatInfo;
  userId: string;
}) {
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleClose = () => {
    onClose();
    setShowWarningModal(false);
  };
  const handleLeave = async (
    forceDelete: boolean = false,
    newOwner: ChatMember | null = null,
    isOwner: boolean = false
  ) => {
    try {
      handleClose();

      const validatedData = deleteChatValidator.parse({
        chatCode: chatInfo.chatInfo?.code,
        chatId: chatInfo.id,
        forceDelete,
        newOwner,
      });

      if (forceDelete || (newOwner === null && isOwner)) {
        await axios
          .post("/api/chat/delete", { chatId: validatedData.chatId })
          .then(() => {
            axios.post("/api/chat/leave", validatedData);
          });
      } else {
        await axios.post("/api/chat/leave", validatedData);
      }
    } catch (err) {
      handleClose();
      console.log(err);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setShowWarningModal(true);
        }}
        className="bg-neutral-800 hover:brightness-90 text-red-600"
      >
        Leave Chat
      </Button>

      {showWarningModal && (
        <Modal onClose={handleClose}>
          {chatInfo.chatInfo!.owner.toString() === userId ? (
            <OwnerLC
              chatId={chatInfo.id}
              handleLeave={(forceDelete, newOwner) => {
                handleLeave(forceDelete, newOwner, true);
              }}
            />
          ) : (
            <MemberLC handleLeave={handleLeave} />
          )}
        </Modal>
      )}
    </>
  );
}

function MemberLC({ handleLeave }: { handleLeave: () => void }) {
  return (
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
  );
}

export function OwnerLC({
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
