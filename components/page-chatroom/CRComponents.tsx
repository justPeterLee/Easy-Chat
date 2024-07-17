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

export function CRShowMessage() {
  return <div></div>;
}

export function CRSendMessage() {
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

      await axios.post("/api/chat/send", { message: messageData.message });
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
    <div className="absolute bottom-5 right-10 left-10">
      <div className="w-full h-[1px] bg-neutral-400 mt-2" />

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
