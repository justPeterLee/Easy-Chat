"use client";
import { SelectPicture, StandardInput, pfpImagesArray } from "../../ui/Input";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/Button";
import { customAlphabet } from "nanoid";
import axios, { AxiosError } from "axios";
import { CreateChat, createChatValidator } from "@/lib/validator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pfpImages } from "../../ui/Input";

export function CreateGCModal({
  onClose,
  updateHasChanged,
  updateError,
  updateModalState,
  hasChanged,
}: {
  onClose: () => void;
  updateHasChanged: (newState: boolean) => void;
  updateError: (newState: { error: boolean; errorLable: string }) => void;
  updateModalState: (newState: "create" | "join") => void;

  hasChanged: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateChat>({
    resolver: zodResolver(createChatValidator),
  });

  const formData = watch();

  const customNanoId = customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    8
  );
  const ChatCode = useRef(customNanoId());

  const images = pfpImagesArray(pfpImages);
  const [imageState, setImageState] = useState(images[0]);
  const createChat = async (data: CreateChat) => {
    try {
      const validatedChat = createChatValidator.parse(data);
      await axios.post("/api/chat/create", {
        ...validatedChat,
        code: ChatCode.current,
        image: imageState,
      });

      onClose();
      updateError({ error: false, errorLable: "" });
    } catch (err) {
      updateError({ error: true, errorLable: "unable to create chat" });
      if (err instanceof z.ZodError) {
        console.log("failed to create chat", { message: err.message });
        return;
      }

      if (err instanceof AxiosError) {
        console.log("failed to create chat", { message: err.response?.data });
        return;
      }
    }
  };

  useEffect(() => {
    if (!hasChanged) {
      if (
        formData.title ||
        formData.privacy ||
        formData.description ||
        imageState
      ) {
        updateHasChanged(true);
      }
    }
  }, [formData, imageState]);

  return (
    <form onSubmit={handleSubmit(createChat)}>
      <div className="text-center text-neutral-400 text-lg mb-10 flex flex-col gap-0">
        <span>Create Chat</span>
        <Button
          type="button"
          variant={"ghost"}
          className="p-0 hover:bg-transparent underline text-neutral-500 text-sm"
          onClick={() => {
            updateModalState("join");
          }}
        >
          or join
        </Button>
      </div>

      <SelectPicture
        images={pfpImages}
        setImage={(image) => {
          setImageState(image);
          updateHasChanged(true);
        }}
      />
      <div className="flex justify-between items-center text-sm text-neutral-400 ">
        <span
          className="flex flex-row gap-1 hover:cursor-pointer"
          onClick={async () => {
            await navigator.clipboard.writeText("generated url");
          }}
        >
          <p>url:</p>
          <p className="text-yellow-400">domain.com</p>
        </span>

        <span
          className="flex flex-row gap-1 hover:cursor-pointer"
          onClick={async () => {
            await navigator.clipboard.writeText("generated code");
          }}
        >
          <p>code:</p>
          <p className="text-yellow-400">{ChatCode.current}</p>
        </span>
      </div>
      <StandardInput
        register={register}
        id={"title"}
        inputClassName="w-full"
        value={formData.title}
        label="title"
        error={errors.title?.message}
      />

      <StandardInput
        register={register}
        id={"description"}
        inputClassName="w-full"
        value={formData.description}
        label="description"
        isTextArea={true}
      />

      <div className="flex justify-center items-center mb-5 w-full">
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

        <StandardInput
          register={register}
          id={"password"}
          inputClassName="w-full"
          value={formData.password || ""}
          label="password"
          error={errors.password?.message}
          disable={!formData.privacy}
          type="password"
        />
      </div>

      <Button size={"full"} type="submit">
        create
      </Button>
    </form>
  );
}
