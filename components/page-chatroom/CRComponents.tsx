"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
export function CRTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-3xl">
        <h1># {title}</h1>
      </span>
      <span className="text-neutral-400">
        <p>{description}</p>
      </span>
      <div className="w-full h-[1px] bg-neutral-400 mt-2" />
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
    <div className="overflow-hidden flex-grow">
      <div
        ref={scrollContainer}
        className="flex-col-reverse flex gap-2 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-500"
      >
        {messages.map((message) => {
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
  //   useEffect(() => {
  //     axios
  //       .get(`/api/chat/users/${message.senderId}`)
  //       .then(async (response) => {
  //         const user = await response;
  //         setUser({ ...user.data });
  //         setError(false);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         setError(true);
  //         setLoading(false);
  //       });
  //   }, []);
  return (
    <div className="flex  relative min-h-12 ">
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
              <p className="text-yellow-400">{user.username}</p>
            )}
            <p className="text-neutral-200">{message.message}</p>
          </div>
        </>
      )}
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
    <div className="bottom-5 right-10 left-10">
      <div className="w-full h-[1px] bg-neutral-400 " />

      <form onSubmit={handleSubmit(onSubmit)} className="relative mt-5">
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
