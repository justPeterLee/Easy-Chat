"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";

export function CRTitle({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full px-10 pb-4 shadow-md">
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

export function CRMemebers() {
  return <div></div>;
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
    <div className="overflow-hidden flex-grow min-h-20">
      <div
        ref={scrollContainer}
        className="flex-col-reverse flex gap-2 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-500 px-10"
      >
        {messages.map((message, index) => {
          // user w/ date bar
          if (messages.length - 1 === index) {
            return (
              <Fragment key={message.id}>
                <CRShowMessageUser
                  key={message.id}
                  message={message}
                  index={index}
                />
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
                <CRShowMessageUser
                  key={message.id}
                  message={message}
                  index={index}
                />
                <CRShowMessageBarDate timestamp={message.timestamp} />
              </Fragment>
            );
          }

          // message only
          if (messages[index].senderId === messages[index + 1].senderId) {
            return (
              <CRSendMessageOnly
                key={message.id}
                message={message}
                index={index}
              />
            );
          }

          // new user
          return (
            <CRShowMessageUser
              key={message.id}
              message={message}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

function CRShowMessageUser({
  message,
  index,
}: {
  message: chatMessages;
  index: number;
}) {
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
            <p className="text-neutral-200">
              {message.message} {index}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CRSendMessageOnly({
  message,
  index,
}: {
  message: chatMessages;
  index: number;
}) {
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
      <span>
        {message.message} {index}
      </span>
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
      console.log(messageData);
      if (!messageData.message.replace(/\s/g, "")) {
        return;
      }

      await axios.post("/api/chat/send", {
        message: messageData.message,
        chatId,
      });
      console.log("test");
      reset();
      textRef.current!.blur();
      // add value
      // valiate values
      // send value to db
      // clear & unfocus input
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
