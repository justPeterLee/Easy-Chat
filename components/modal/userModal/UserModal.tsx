"use client";
import { MenuModal } from "../MenuModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Fragment, useEffect, useRef, useState } from "react";
import { Modal } from "../Backdrop";
import axios from "axios";
import { IoMdArrowDropdown } from "react-icons/io";
import { cn } from "@/lib/utils";
export function ViewUserModal({
  onClose,
  showWarningModal,
  parentRef,
}: {
  onClose: () => void;
  showWarningModal: () => void;
  parentRef: HTMLDivElement;
}) {
  const { data } = useSession();

  return (
    <MenuModal
      onClose={onClose}
      parentRef={parentRef}
      customCords={{
        state: true,
        style: {
          bottom: `${parentRef.getBoundingClientRect().height + 15}px`,
          left: `${parentRef.getBoundingClientRect().right / 2}px`,
          transform: `translateX(-50%)`,
        },
      }}
    >
      <div className="bg-[#181818] rounded p-6 max-w-[16rem]">
        {data?.user && (
          <div className="flex flex-col justify-center gap-5 items-center">
            <Image
              src={data.user.image}
              alt="pfp"
              width={150}
              height={150}
              className="rounded-full"
            />
            <div className="flex flex-col items-center">
              <p className="text-lg">{data.user.name}</p>
              <Button
                onClick={() => {
                  showWarningModal();
                  onClose();
                }}
              >
                delete user
              </Button>
            </div>
          </div>
        )}
      </div>
    </MenuModal>
  );
}

export function DeleteUserModal({ onClose }: { onClose: () => void }) {
  const { data } = useSession();
  const [ownedChatList, setOwnedChatList] = useState<ChatInfo[]>([]);
  const [joinedChatList, setJoinedChatList] = useState<ChatInfo[]>([]);
  const [newOwners, setNewOwners] = useState<{
    [key: string]: null | ChatMember;
  }>({});
  const [deleteAll, setDeleteAll] = useState(false);

  const deleteUser = async () => {
    try {
      if (!data) return;
      console.log(newOwners, deleteAll);
      await axios.post("/api/user/delete", {
        newOwners,
        joinedChatList,
        deleteAll,
      });
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (data)
      axios.get(`/api/chat/chatlist/${data.user.id}`).then((res) => {
        const data: { owned: ChatInfo[]; joined: ChatInfo[] } = res.data;
        console.log(data);
        setOwnedChatList(data.owned);
        setJoinedChatList(data.joined);
        if (data.owned.length) {
          const newOwnerObj: {
            [key: string]: null | ChatMember;
          } = {};
          for (let i = 0; i < data.owned.length; i++) {
            newOwnerObj[`${data.owned[i].memberId}`] = null;
          }
          setNewOwners(newOwnerObj);
          console.log(newOwnerObj);
        }
      });
  }, []);
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-3 max-w-[25rem]">
        <div>
          <p>WARNING!</p>
          <p className="text-neutral-500 text-sm">
            Are you sure you want to permanently delete your chat?
          </p>
        </div>

        {ownedChatList.length > 0 && (
          <>
            <div className="">
              <p className="">Your Chats :</p>
              <p className="text-neutral-500 text-xs">
                Assigned your owned chats to a new owner, or else the chat will
                chat will be deleted.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="delete"
                  checked={deleteAll}
                  onChange={(e) => {
                    setDeleteAll(e.target.checked);
                  }}
                />
                <label htmlFor="delete" className="text-sm text-neutral-500">
                  delete all chat
                </label>
              </div>
              <p className="text-sm text-neutral-400">select new owners :</p>
              {ownedChatList.map((chat) => {
                return (
                  <div
                    className="flex items-center justify-between "
                    key={chat.memberId}
                  >
                    <span className="flex gap-3">
                      <p className="text-yellow-500">#</p>
                      <p className="text-neutral-300">{chat.title}</p>
                    </span>
                    <SelectNewOwner
                      chatId={chat.memberId}
                      setNewOwner={(owner) => {
                        setNewOwners({ ...newOwners, [chat.memberId]: owner });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
        <Button className="bg-red-700 hover:bg-red-700" onClick={deleteUser}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

function SelectNewOwner({
  chatId,
  setNewOwner,
}: {
  chatId: number;
  setNewOwner: (owner: ChatMember | null) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loading, setLodaing] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<ChatMember | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [memberList, setMemberList] = useState<ChatMember[]>([]);

  const fetchMembers = async () => {
    try {
      setLodaing(true);
      const members = await axios.get(`/api/chat/members/${chatId}`);
      const membersObj: { [key: string]: ChatMember } = members.data;

      const memberArr = Object.keys(membersObj).map((key) => {
        return membersObj[key];
      });

      setMemberList(memberArr);
      setLodaing(false);
    } catch (err) {
      setLodaing(false);
      console.log(err);
    }
  };

  return (
    <div>
      {/* <label className="text-sm text-neutral-500">select new owner :</label> */}
      <div>
        <div
          ref={ref}
          className={
            "w-[10rem] h-[2.5rem] rounded flex items-center  gap-1 p-1 relative  border border-neutral-500  hover:cursor-default"
          }
          onClick={() => {
            fetchMembers();
            setShowMenu(true);
          }}
        >
          {selectedOwner ? (
            <div className=" w-[90%] h-full flex items-center border-r-[1px] border-neutral-500">
              <span className="flex gap-2 items-center p-2 text-neutral-500">
                <p>{selectedOwner.username}</p>
              </span>
            </div>
          ) : (
            <div className=" w-[90%] h-full flex items-center border-r-[1px] border-neutral-500">
              <p className="text-neutral-500 p-2">none</p>
            </div>
          )}
          <Button
            variant={"ghost"}
            className={cn(
              "w-[10%] h-full hover:bg-neutral-700 rounded-tl-none rounded-bl-none",
              { "bg-neutral-700": showMenu }
            )}
          >
            <IoMdArrowDropdown color="#737373" className="-translate-x-1/2" />
          </Button>
        </div>
        {showMenu && ref.current && (
          <Modal
            invisBack={true}
            modalCustomCords={{
              state: true,
              style: {
                top: `${ref.current.getBoundingClientRect().bottom + 3}px`,
                left: `${ref.current.getBoundingClientRect().left + 3}px`,
              },
            }}
            onClose={() => [setShowMenu(false)]}
            modalClassName="p-0"
          >
            {/* <>{JSON.stringify(memberList)}</> */}
            <div className="bg-[#303030] min-h-8 w-36 rounded text-neutral-300 p-1 flex flex-col gap-1">
              {loading ? (
                <p>loading</p>
              ) : (
                <>
                  <div
                    onClick={() => {
                      setSelectedOwner(null);
                      setShowMenu(false);
                      setNewOwner(null);
                    }}
                    className={cn(
                      "bg-[#252525] h-8 flex items-center hover:bg-[#404040] hover:cursor-pointer",
                      { "bg-[#404040]": selectedOwner === null }
                    )}
                  >
                    <p className="p-2">none</p>
                  </div>
                  {memberList.map((member) => {
                    if (member.role === "owner" || member.isBan) {
                      return <Fragment key={member.id} />;
                    }

                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedOwner(member);
                          setShowMenu(false);
                          setNewOwner(member);
                        }}
                        className={cn(
                          "flex items-center gap-3 p-2 h-8 bg-[#252525] hover:bg-[#404040] hover:cursor-pointer",
                          { "bg-[#404040]": selectedOwner?.id === member.id }
                        )}
                      >
                        {/* <img
                          className="bg-neutral-500 h-5 w-5 rounded-full"
                          src={member.image}
                        /> */}
                        <p>{member.username}</p>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
