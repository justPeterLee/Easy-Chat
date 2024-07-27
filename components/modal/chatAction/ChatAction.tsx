"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  UpdateChat,
  deleteChatValidator,
  updateChatValidator,
} from "@/lib/validator";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Fragment, useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { Modal } from "../Backdrop";
import { VscLoading } from "react-icons/vsc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StandardInput } from "@/components/ui/Input";
import { CRMemberList } from "@/components/pageComponents/CRComponents";

export function LeaveChat({
  onClose,
  chatInfo,
  userId,
}: {
  onClose: () => void;
  chatInfo: { code: string; id: number; owner: number };
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
        chatCode: chatInfo.code,
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
          {chatInfo.owner.toString() === userId ? (
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

export function EditChat({
  onClose,
  chatId,
}: {
  onClose: () => void;
  chatId: number;
}) {
  const [showWarningModal, setShowWarningModal] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setShowWarningModal(true);
        }}
      >
        edit
      </Button>

      {showWarningModal && (
        <EditChatModal
          onClose={() => {
            onClose();
            setShowWarningModal(false);
          }}
          chatId={chatId}
        />
      )}
    </>
  );
}

function EditChatModal({
  onClose,
  chatId,
}: {
  onClose: () => void;
  chatId: number;
}) {
  const [chatInfo, setChatInfo] = useState<{
    chatInfo: ChatInfo;
    members: {
      [key: string]: ChatMember;
    };
  } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/chat/get/${chatId}`)
      .then(
        (
          response: AxiosResponse<{
            chatInfo: ChatInfo;
            members: {
              [key: string]: ChatMember;
            };
          }>
        ) => {
          //   const chatInfoData = response.data;
          setChatInfo(response.data);
          setError(false);
          setLoading(false);
        }
      )
      .catch((err) => {
        setLoading(false);
        setError(true);
        console.log("could not fetch chat info: ", err);
      });
  }, []);

  return (
    <Modal
      onClose={() => {
        onClose();
      }}
      modalClassName="p-7 h-[30rem] w-[35rem] overflow-auto  scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-500 px-10 "
    >
      {loading ? (
        <div className="w-full h-full flex justify-center items-center">
          <VscLoading className="animate-spin" size={100} />
        </div>
      ) : error || chatInfo === null ? (
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-[1.75rem] text-neutral-600 font-semibold">
            (ERROR)
          </p>
          <img src={"/svg/robotError.svg"} className="w-[18rem]" />
          <div className="flex flex-col justify-center items-center gap-2">
            <p className=" text-neutral-600 font-semibold">
              Cannot edit chat right now, try again later.
            </p>

            <Button
              onClick={() => {
                onClose();
              }}
            >
              close
            </Button>
          </div>
        </div>
      ) : (
        <EditChatForm
          onClose={onClose}
          chatInfo={chatInfo.chatInfo}
          chatId={chatId}
          memberList={chatInfo.members}
        />
      )}
    </Modal>
  );
}

function EditChatForm({
  onClose,
  chatInfo,
  chatId,
  memberList,
}: {
  onClose: () => void;
  chatInfo: ChatInfo;
  chatId: number;
  memberList: {
    [key: string]: ChatMember;
  };
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateChat>({
    defaultValues: {
      ...chatInfo,
      password: chatInfo.privacy,
      newpassword: "",
      oldpassword: "",
    },
    resolver: zodResolver(updateChatValidator),
  });

  const formData = watch();

  const [error, setError] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const updateChat = async (data: UpdateChat) => {
    const validatedData = updateChatValidator.parse(data);
    console.log(validatedData);

    await axios.post("/api/chat/update", { data: validatedData, id: chatId });
    onClose();
    try {
    } catch (err) {
      setError(true);
      if (err instanceof z.ZodError) {
        console.log("failed to update chat", { message: err.message });
      }

      if (err instanceof AxiosError) {
        console.log("failed to update chat", { message: err.response?.data });
      }
    }
  };

  const deleteChat = async () => {
    try {
      await axios.post("/api/chat/delete", { chatId: chatId });
      onClose();
    } catch (err) {
      setError(true);
    }
  };

  useEffect(() => {
    if (!hasChanged) {
      if (
        formData.title !== chatInfo.title ||
        formData.privacy !== chatInfo.privacy ||
        formData.description !== chatInfo.description ||
        formData.oldpassword ||
        formData.newpassword
      )
        setHasChanged(true);
    }
  }, [formData]);
  return (
    <>
      <form
        className="flex flex-col gap-4 justify-center items-center"
        onSubmit={handleSubmit(updateChat)}
      >
        <div className="flex items-center justify-between w-full mb-2">
          <p className="text-xl">Edit Chat</p>
          <div className="relative">
            <Button
              disabled={!hasChanged}
              type="submit"
              className={cn({ "hover:bg-neutral-600 opacity-30": !hasChanged })}
            >
              Save Changes
            </Button>
            {error && (
              <p className="absolute text-xs text-red-600 whitespace-nowrap">
                *could not update chat
              </p>
            )}
          </div>
        </div>
        <div className="bg-[#303030] p-3 rounded-lg w-full">
          <div>
            <p>Title and Description</p>
            <p className="text-sm text-neutral-500">
              Write a fitting title and expressive description to describe your
              chat.
            </p>
          </div>

          <div className="w-full p-2">
            <StandardInput
              register={register}
              id="title"
              inputClassName="w-full text-sm"
              labelClassName="bg-[#303030]"
              value={formData.title}
              label="title"
              error={errors.title?.message}

              // disable={true}
            />

            <StandardInput
              register={register}
              id={"description"}
              inputClassName="w-full text-sm"
              labelClassName="bg-[#303030]"
              value={formData.description}
              label="description"
              isTextArea={true}
            />
          </div>
        </div>

        <div className="w-full bg-[#303030] p-3 rounded-lg">
          <div className="mb-2">
            <p>Privacy</p>
            <p className="text-sm text-neutral-500">
              Depending on you privacy setting, your chat will be open to any
              one (public) or only those with the password (private).
            </p>
          </div>

          <div>
            <div className="flex justify-start items-center p-2">
              <label className="inline-flex items-center me-5 cursor-pointer flex-col justify-center gap-1">
                <span className=" text-sm font-medium text-neutral-400 select-none pointer-events-none">
                  Private
                </span>
                <input
                  {...register("privacy")}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-neutral-600 rounded-full peer dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-yellow-500"></div>
              </label>

              <div className="w-full">
                {chatInfo.privacy && (
                  <StandardInput
                    register={register}
                    id={"oldpassword"}
                    outClassName="flex-grow"
                    inputClassName="w-full text-sm"
                    labelClassName="bg-[#303030]"
                    value={formData.oldpassword || ""}
                    label="old password"
                    error={errors.oldpassword?.message}
                    disable={!formData.privacy}
                    type="password"
                  />
                )}
                <StandardInput
                  register={register}
                  id={"newpassword"}
                  outClassName="flex-grow"
                  inputClassName="w-full text-sm"
                  labelClassName="bg-[#303030]"
                  value={formData.newpassword || ""}
                  label="new password"
                  error={errors.newpassword?.message}
                  disable={!formData.privacy}
                  type="password"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#303030] p-3 rounded-lg">
          <p>Members</p>
          <p className="text-sm text-neutral-500">
            See all the members of your chat.
          </p>

          <div>
            <CRMemberList memberList={memberList} chatId={chatId.toString()} />
            {/* {JSON.stringify(memberList)} */}
          </div>
        </div>

        <div className="w-full bg-[#303030] p-3 rounded-lg">
          <div>
            <p>Delete Group Chat</p>
            <p className="text-sm text-neutral-500">
              Your group chat will be permanently deleted and all group members
              will be automatically kicked from the chat.
            </p>
          </div>

          <div className="flex justify-end p-2">
            <Button
              type="button"
              className="px-10 bg-red-800 hover:bg-red-800"
              onClick={() => {
                setShowDeleteWarning(true);
              }}
            >
              delete
            </Button>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            if (hasChanged) {
              setShowWarningModal(true);
            } else {
              onClose();
            }
          }}
        >
          close
        </Button>
      </form>

      {showWarningModal && (
        <Modal
          onClose={() => {
            setShowWarningModal(false);
          }}
        >
          <div className="flex flex-col gap-2">
            <p>Are you sure you want to discard changes?</p>
            <div className="flex justify-end gap-1">
              <Button
                variant={"ghost"}
                onClick={() => {
                  setShowWarningModal(false);
                }}
              >
                cancel
              </Button>
              <Button
                className="bg-red-800 hover:bg-red-700"
                onClick={() => {
                  onClose();
                }}
              >
                discard
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteWarning && (
        <Modal
          onClose={() => {
            setShowDeleteWarning(false);
          }}
        >
          <div className="flex flex-col gap-2">
            <p>Are you sure you want to delete chat?</p>
            <div className="flex justify-end gap-1">
              <Button
                variant={"ghost"}
                onClick={() => {
                  setShowDeleteWarning(false);
                }}
              >
                cancel
              </Button>
              <Button
                className="bg-red-800 hover:bg-red-700"
                onClick={() => {
                  deleteChat();
                }}
              >
                delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
