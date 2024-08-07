"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import { cn, toPusherKey } from "@/lib/utils";
import { Modal } from "../modal/Backdrop";
import { userActionValidator } from "@/lib/validator";
import { VscLoading } from "react-icons/vsc";
import Link from "next/link";
import { FaGear } from "react-icons/fa6";
import { MenuModal } from "../modal/MenuModal";
import { EditChat, LeaveChat } from "../modal/chatAction/ChatAction";
import { TbTrashOff } from "react-icons/tb";
import { pusherClient } from "@/lib/pusher";

export function CRTitle({
  title,
  code,
  chatInfo,
  userId,
  chatId,
}: {
  title: string;
  code: string;
  chatInfo: {
    chat: ChatInfo;
    members: {
      [key: string]: ChatMember;
    };
    messages: any[];
  };
  userId: string;
  chatId: number;
}) {
  return (
    <div className="flex items-center justify-between gap-1 w-full px-10 py-4 shadow-md  ">
      <span className="text-xl flex gap-3 items-center h-10">
        <h1 className="text-yellow-400">#</h1>
        <h1>{title}</h1>
        <p className="text-neutral-500 text-xs">code: {code}</p>
      </span>
      <CREdit chatInfo={chatInfo} userId={userId} chatId={chatId} />
    </div>
  );
}

export function CRShowMessage({
  messages,
  chatId,
}: {
  messages: ChatMessages[];
  chatId: string;
}) {
  const [messagesState, setMessagesState] = useState(messages);

  const scrollContainer = useRef<HTMLDivElement | null>(null);
  const scollToBottom = () => {
    scrollContainer.current!.scrollTop = scrollContainer.current!.scrollHeight;
  };

  useEffect(() => {
    scollToBottom();
  }, []);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: ChatMessages) => {
      console.log(messagesState, message);
      setMessagesState((prev) => [message, ...prev]);
    };
    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, []);
  return (
    <div className="overflow-hidden flex-grow min-h-20 mb-3">
      <div
        ref={scrollContainer}
        className="flex-col-reverse flex gap-1 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-500 px-10"
      >
        {messagesState.map((message, index) => {
          // user w/ date bar
          if (messagesState.length - 1 === index) {
            return (
              <Fragment key={message.id}>
                <CRShowMessageUser key={message.id} message={message} />
                <CRShowMessageBarDate timestamp={message.timestamp} />
              </Fragment>
            );
          }
          const curDay = format(new Date(message.timestamp), "yyyy MM dd");
          const nextDay = format(
            new Date(messagesState[index + 1].timestamp),
            "yyyy MM dd"
          );

          // user w/ date bar
          if (curDay !== nextDay) {
            return (
              <Fragment key={message.id}>
                <CRShowMessageUser key={message.id} message={message} />
                <CRShowMessageBarDate timestamp={message.timestamp} />
              </Fragment>
            );
          }

          // message only
          if (
            messagesState[index].senderId === messagesState[index + 1].senderId
          ) {
            return <CRShowMessageOnly key={message.id} message={message} />;
          }

          // new user
          return <CRShowMessageUser key={message.id} message={message} />;
        })}
      </div>
    </div>
  );
}

function CRShowMessageUser({ message }: { message: ChatMessages }) {
  type User = { image: string | null; username: string | null };
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>({ image: "", username: "" });
  const [error, setError] = useState(false);
  useEffect(() => {
    axios
      .get(`/api/chat/users/${message.senderId}`)
      .then((response) => {
        const user: User = response.data;
        // console.log(user);
        setUser({ ...user });
        setError(false);
        setLoading(false);
      })
      .catch((err) => {
        setError(true);
        setLoading(false);
      });
  }, []);
  return (
    <div className={`flex relative min-h-12 mt-3 `}>
      {error ? (
        <>message not found</>
      ) : (
        <>
          {loading ? (
            <div className="bg-neutral-600 w-12 h-12 rounded-full absolute animate-pulse" />
          ) : user.image ? (
            <img
              className="bg-neutral-600 w-12 h-12 rounded-full absolute"
              src={user.image}
              alt="pfp"
            ></img>
          ) : (
            <div className="w-12 h-12 rounded-full bg-neutral-700 absolute flex justify-center items-center">
              <TbTrashOff color="#909090" size={20} />
            </div>
          )}
          <div className="pl-16">
            {loading ? (
              <div className="bg-neutral-600 w-[10rem] h-[.75rem] rounded-lg animate-pulse"></div>
            ) : (
              <div className="flex justify-center items-center gap-4">
                <p className="text-yellow-400 text-lg hover:underline hover:cursor-pointer ">
                  {user.username !== null ? user.username : "<deleted account>"}
                </p>
                <p className="text-neutral-500 text-xs">
                  {format(
                    new Date(message.timestamp),
                    "MMMM dd, yyyy hh:mm aa"
                  )}
                </p>
              </div>
            )}
            <p className="text-neutral-200">{message.message}</p>
          </div>
        </>
      )}
    </div>
  );
}

function CRShowMessageOnly({ message }: { message: ChatMessages }) {
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      className="pl-16 hover:brightness-50 relative flex items-center hover:cursor-default"
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
      {isHover && (
        <span className="absolute left-0 top-[50%] translate-y-[-50%] text-xs text-neutral-400">
          {format(new Date(message.timestamp), "hh:mm aa")}
        </span>
      )}
      <span>{message.message}</span>
    </div>
  );
}

function CRShowMessageBarDate({ timestamp }: { timestamp: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-grow h-[1px] bg-neutral-600 mr-4"></div>
      <div className="text-xs text-neutral-400">
        {format(new Date(timestamp), "MMMM dd, yyyy")}
      </div>
      <div className="flex-grow h-[1px] bg-neutral-600 ml-4"></div>
    </div>
  );
}
export function CRSendMessage({ chatId }: { chatId: string }) {
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { message: "" } });

  const onSubmit = async (messageData: { message: string }) => {
    try {
      if (!messageData.message.replace(/\s/g, "")) {
        return;
      }

      await axios.post("/api/chat/send", {
        message: messageData.message,
        chatId,
      });

      reset();
      textRef.current!.blur();
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log("failed to send message", { message: err.message });
        return;
      }

      if (err instanceof AxiosError) {
        console.log("failed to send messsage", { message: err.response?.data });
        return;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };
  useEffect(() => {
    const textArea = textRef.current;

    const handleResize = () => {
      textArea!.style.height = "auto";
      textArea!.style.height = `${textArea?.scrollHeight}px`;
    };

    if (textArea) {
      textArea?.addEventListener("input", handleResize);
    }

    return () => {
      if (textArea) textArea.removeEventListener("input", handleResize);
    };
  }, []);
  return (
    <div className="bottom-5 right-10 left-10 px-10 pb-6">
      <div className="w-full h-[1px] bg-neutral-600 " />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative mt-5 shadow-md"
      >
        <Controller
          name="message"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <textarea
              {...field}
              ref={(e) => {
                field.ref(e);
                textRef.current = e;
              }}
              onKeyDown={handleKeyDown}
              placeholder={"Type a message..."}
              rows={1}
              className="resize-none overflow-none w-full bg-neutral-700 text-neutral-400 rounded flex items-center pl-3 py-2 pr-16 hover:bg-neutral-600 duration-75 cursor-text focus:text-white"
            ></textarea>
          )}
        />
        <div className="absolute top-1/2 right-1 translate-y-[-50%]">
          <Button
            type="button"
            variant={"ghost"}
            className="hover:bg-transparent hover:text-white text-neutral-400 rounded-none "
          >
            $
          </Button>
          <Button
            type="button"
            variant={"ghost"}
            className="hover:bg-transparent hover:text-white text-neutral-400 rounded-none"
          >
            $
          </Button>
        </div>
      </form>
    </div>
  );
}

type MemberList = { [key: string]: ChatMember };
export function CRMemberList({
  memberList,
  chatId,
}: {
  memberList: MemberList;
  chatId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [memListArr, setMemListArr] = useState<MemberList>({});

  const memberListArray = useMemo(() => {
    const memberKeyArray = Object.keys(memListArr);
    const memberArray = memberKeyArray.map((memberKey: string) => {
      return memListArr[memberKey];
    });
    return memberArray;
  }, [memListArr]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/chat/members/${chatId}`)
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        const data: MemberList = response.data;
        setMemListArr({ ...data });
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  }, []);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`member:list:${chatId}`));

    const memberRevalidateHandler = async () => {
      const data = await axios.get(`/api/chat/members/${chatId}`);
      setMemListArr({ ...data.data });
    };

    pusherClient.bind("revalidate-member-list", memberRevalidateHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`member:list:${chatId}`));
      pusherClient.unbind("revalidate-member-list", memberRevalidateHandler);
    };
  }, []);
  return (
    <div className="p-3">
      <p className="text-sm text-neutral-400">
        members - {memberListArray.length}
      </p>
      {memberListArray.map((member) => {
        return (
          <MemberCard memberInfo={member} key={Math.random()} chatId={chatId} />
        );
      })}
    </div>
  );
}

function MemberCard({
  memberInfo,
  chatId,
}: {
  memberInfo: ChatMember;
  chatId: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [memberInfoState, setMemberInfoState] = useState(memberInfo);
  const [isClicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userState, setUserState] = useState({
    mute: memberInfoState.isMute,
    ban: memberInfoState.isBan,
  });
  const handleUserAction = async (userAction: "mute" | "kick" | "ban") => {
    try {
      const validUserAction = userActionValidator.parse({
        userId: parseInt(memberInfoState.id),
        chatId: parseInt(chatId),
      });
      setLoading(true);
      const newState: { data: { state: boolean } } = await axios.post(
        `/api/chat/user/${userAction}`,
        validUserAction
      );
      setLoading(false);
      if (userAction !== "kick") {
        setUserState(() => ({
          ...userState,
          [userAction]: newState.data.state,
        }));
      }
    } catch (err) {
      setLoading(false);
      console.log("user action failed: ", err);
    }
  };

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`member:info:${memberInfo.id}`));

    const memberHandler = (member: ChatMember) => {
      setMemberInfoState(member);
    };
    pusherClient.bind(`member-action-${memberInfo.id}`, memberHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`member:info:${memberInfo.id}`));
      pusherClient.unbind("member-action", memberHandler);
    };
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        onClick={() => {
          setIsClicked(true);
        }}
        className={cn(
          "hover:bg-neutral-700 hover:cursor-pointer duration-100 rounded p-2 flex items-center gap-3 text-neutral-400 select-none",
          { "bg-neutral-700": isClicked }
        )}
      >
        <img
          className="bg-neutral-500 h-9 w-9 rounded-full"
          src={memberInfoState.image}
        />
        <div className="flex items-center gap-2">
          <p>{memberInfoState.username}</p>
          {memberInfoState.role === "owner" && (
            <p className="text-xs">{"(owner)"}</p>
          )}

          <div>
            {(memberInfoState.isMute || userState.mute) && (
              <p className="text-xs">{"(muted)"}</p>
            )}
            {(memberInfoState.isBan || userState.ban) && (
              <p className="text-xs">{"(banned)"}</p>
            )}
          </div>
        </div>
      </div>
      {isClicked && cardRef.current && (
        <Modal
          onClose={() => {
            setIsClicked(false);
          }}
          invisBack={true}
          modalCustomCords={{
            state: true,
            style: {
              top: `${cardRef.current.getBoundingClientRect().top}px`,
              right: `${
                innerWidth - cardRef.current.getBoundingClientRect().left + 24
              }px`,
            },
          }}
          modalClassName={` p-0 bg-neutral-700`}
        >
          <div className="rounded flex flex-col w-auto">
            <Button
              onClick={() => {
                handleUserAction("mute");
              }}
              disabled={loading}
              variant={"ghost"}
              className="hover:brightness-[.8]"
            >
              {!userState.mute ? "mute" : "unmute"}
            </Button>

            <Button
              onClick={() => {
                handleUserAction("ban");
              }}
              disabled={loading}
              variant={"ghost"}
              className="hover:brightness-[.8]"
            >
              {!userState.ban ? "ban" : "unban"}
            </Button>

            {loading && (
              <div className="w-full h-full absolute">
                <div className="w-full h-full bg-neutral-700 opacity-90" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <VscLoading className="animate-spin" />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export function CRBanned() {
  return (
    <main className="flex flex-col  text-white bg-neutral-800 h-screen w-full relative overflow-hidden">
      <Modal onClose={() => {}} modalClassName="p-6">
        <div className="flex flex-col justify-center items-center gap-5">
          <p>youve been banished (banned)</p>
          <Link
            href={"/"}
            className="p-2 bg-neutral-700 text-red-600 rounded hover:brightness-75 duration-75 text-sm"
          >
            leave chat
          </Link>
        </div>
      </Modal>
    </main>
  );
}

export function CREdit({
  chatInfo,
  userId,
  chatId,
}: {
  chatInfo: {
    chat: ChatInfo;
    members: {
      [key: string]: ChatMember;
    };
    messages: any[];
  };
  userId: string;
  chatId: number;
}) {
  const editRef = useRef<HTMLDivElement | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  return (
    <>
      <div>
        <div ref={editRef}>
          <Button
            variant={"ghost"}
            className={cn({ "bg-neutral-700": showEditModal })}
            onClick={() => {
              setShowEditModal(true);
            }}
          >
            <FaGear color="#808080" />
          </Button>
        </div>
      </div>
      {showEditModal && editRef.current && (
        <MenuModal
          onClose={() => {
            setShowEditModal(false);
          }}
          parentRef={editRef.current}
        >
          {chatInfo.chat.owner === parseInt(userId) && (
            <EditChat
              onClose={() => {
                setShowEditModal(false);
              }}
              chatId={chatId}
            />
          )}
          <LeaveChat
            onClose={() => {
              setShowEditModal(false);
            }}
            chatInfo={{
              code: chatInfo.chat.code,
              id: chatId,
              owner: chatInfo.chat.owner,
            }}
            userId={userId}
          />
        </MenuModal>
      )}
    </>
  );
}
