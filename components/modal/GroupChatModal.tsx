import { Modal } from "./Backdrop";
import { SelectPicture, StandardInput } from "../ui/Input";
import { useRef, useState } from "react";
import { Button } from "../ui/Button";
import { customAlphabet } from "nanoid";
import axios, { AxiosError } from "axios";
import { CreateChat, createChatValidator } from "@/lib/validator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function CreateGroupChatModal({ onClose }: { onClose: () => void }) {
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

  const [chatSettings, setChatSetting] = useState({
    title: "",
    description: "",
    privacy: false,
    password: "",
  });

  const [error, setError] = useState(false);

  const createChat = async (data: CreateChat) => {
    // valid title X
    // valid password X
    // generate code X
    console.log("test");
    try {
      // if (await validator()) return;
      const allChatSetting = { ...chatSettings, code: ChatCode.current };

      const validatedChat = createChatValidator.parse(data);

      console.log(validatedChat);
      // await axios.post("/api/chat/create", {
      //   ...chatSettings,
      //   code: ChatCode.current,
      // });

      setError(false);
    } catch (err) {
      setError(true);
      if (err instanceof z.ZodError) {
        console.log("failed to create chat", { message: err.message });
        return;
      }

      if (err instanceof AxiosError) {
        console.log("failed to create chat", { message: err.response?.data });
        return;
      }
    }

    // create hash (public information)
    // chat id
    // chat code
    // chat picture
    // chat title

    // create json (private info)
    // chat memebers list
    // chat settings
  };

  // const validator = () => {
  //   const proxyError = { ...error };
  //   let isError = false;
  //   if (!chatSettings.title.replace(/\s/g, "")) {
  //     proxyError.title = true;
  //     isError = true;
  //   }

  //   if (chatSettings.privacy) {
  //     if (!chatSettings.password.replace(/\s/g, "")) {
  //       proxyError.password = true;
  //       isError = true;
  //     }
  //   } else {
  //     proxyError.password = false;
  //   }

  //   proxyError.isError = isError;
  //   setError(proxyError);

  //   return isError;
  // };

  const onSubmit = (data: CreateChat) => {
    console.log(data);
  };

  return (
    <Modal
      modalClassName="min-w-80"
      onClose={onClose}
      error={{ error: error, errorLable: "could not make chat" }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="text-center text-neutral-400 text-lg mb-10">
          <p>Create a Chat</p>
        </div>

        <SelectPicture />
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
    </Modal>
  );
}
