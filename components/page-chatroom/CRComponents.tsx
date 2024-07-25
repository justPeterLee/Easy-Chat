"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Modal } from "../modal/Backdrop";
import { userActionValidator } from "@/lib/validator";
import { VscLoading } from "react-icons/vsc";
import Link from "next/link";

export function CRTitle({ title, code }: { title: string; code: string }) {
  return (
    <div className="flex flex-col gap-1 w-full px-10 py-4 shadow-md">
      <span className="text-xl flex gap-3 items-center">
        <h1 className="text-yellow-400">#</h1>
        <h1>{title}</h1>
        <p className="text-neutral-500 text-xs">code: {code}</p>
      </span>
      {/* <span className="text-neutral-400">
        <p>{description}</p>
      </span> */}
    </div>
  );
}

export function CRShowMessage({ messages }: { messages: chatMessages[] }) {
  const scrollContainer = useRef<HTMLDivElement | null>(null);
  const scollToBottom = () => {
    scrollContainer.current!.scrollTop = scrollContainer.current!.scrollHeight;
  };

  useEffect(() => {
    scollToBottom();
  }, []);

  return (
    <div className="overflow-hidden flex-grow min-h-20 mb-3">
      <div
        ref={scrollContainer}
        className="flex-col-reverse flex gap-2 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-500 px-10"
      >
        {messages.map((message, index) => {
          // user w/ date bar
          if (messages.length - 1 === index) {
            return (
              <Fragment key={message.id}>
                <CRShowMessageUser key={message.id} message={message} />
                <CRShowMessageBarDate timestamp={message.timestamp} />
              </Fragment>
            );
          }
          const curDay = format(new Date(message.timestamp), "yyyy MM dd");
          const nextDay = format(
            new Date(messages[index + 1].timestamp),
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
          if (messages[index].senderId === messages[index + 1].senderId) {
            return <CRShowMessageOnly key={message.id} message={message} />;
          }

          // new user
          return <CRShowMessageUser key={message.id} message={message} />;
        })}
      </div>
    </div>
  );
}

function CRShowMessageUser({ message }: { message: chatMessages }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ image: "", username: "" });
  const [error, setError] = useState(false);
  useEffect(() => {
    axios
      .get(`/api/chat/users/${message.senderId}`)
      .then(async (response) => {
        const user = await response;
        setUser({ ...user.data });
        setError(false);
        setLoading(false);
      })
      .catch((err) => {
        setError(true);
        setLoading(false);
      });
  }, []);
  return (
    <div className={`flex relative min-h-12 `}>
      {error ? (
        <>message not found</>
      ) : (
        <>
          {loading ? (
            <div className="bg-neutral-400 w-12 h-12 rounded-full absolute animate-pulse" />
          ) : (
            <img
              className="bg-neutral-600 w-12 h-12 rounded-full absolute"
              src={user.image}
              alt="pfp"
            ></img>
          )}
          <div className="pl-16">
            {loading ? (
              <div className="bg-neutral-400 w-[10rem] h-[.75rem] rounded-lg animate-pulse"></div>
            ) : (
              <div className="flex justify-center items-center gap-4">
                <p className="text-yellow-400 text-lg hover:underline hover:cursor-pointer">
                  {user.username}{" "}
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

function CRShowMessageOnly({ message }: { message: chatMessages }) {
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

export function CRMemberList({
  memberList,
  chatId,
}: {
  memberList: { [key: string]: chatMember };
  chatId: string;
}) {
  const memberListArray = useMemo(() => {
    const memberKeyArray = Object.keys(memberList);
    const memberArray = memberKeyArray.map((memberKey: string) => {
      return memberList[memberKey];
    });
    return memberArray;
  }, [memberList]);

  return (
    <div className="p-3">
      <p className="text-sm text-neutral-400">
        members - {memberListArray.length}
      </p>
      {memberListArray.map((member) => {
        return (
          <MemberCard memberInfo={member} key={member.id} chatId={chatId} />
        );
      })}
    </div>
  );
}

function MemberCard({
  memberInfo,
  chatId,
}: {
  memberInfo: chatMember;
  chatId: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userState, setUserState] = useState({
    mute: memberInfo.isMute,
    ban: memberInfo.isBan,
  });
  const handleUserAction = async (userAction: "mute" | "kick" | "ban") => {
    try {
      const validUserAction = userActionValidator.parse({
        userId: parseInt(memberInfo.id),
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
          src={memberInfo.image}
        />
        <div className="flex items-center gap-2">
          <p>{memberInfo.username}</p>
          {memberInfo.role === "owner" && (
            <p className="text-xs">{"(owner)"}</p>
          )}

          <div>
            {(memberInfo.isMute || userState.mute) && (
              <p className="text-xs">{"(muted)"}</p>
            )}
            {(memberInfo.isBan || userState.ban) && (
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
