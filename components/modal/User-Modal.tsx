"use client";

import { Modal } from "./Backdrop";
import { SelectPicture, StandardInput } from "../ui/Input";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { createUserValidator, CreateUser } from "@/lib/validator";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { pfpImages } from "../ui/Input";
export const UserModal = () => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // console.log("session check", session);
    if (session !== undefined && session === null) {
      setShowModal(true);
    }
  }, [session]);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUser>({ resolver: zodResolver(createUserValidator) });

  const formData = watch();
  const ServerSession = useRef(nanoid(5));

  const [error, setError] = useState(false);

  const createAccount = async (formData: CreateUser) => {
    try {
      const validUsername = createUserValidator.parse(formData);

      const { data }: { data: { username: string; session: string } } =
        await axios.post("/api/user", {
          username: validUsername.username,
          session: ServerSession.current,
        });

      await loginWithCred(data);

      setError(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log("invalid user zod", err);
      }

      if (err instanceof AxiosError) {
        console.log(err);
      }
      console.log(err);
      setError(true);
    }
  };

  const loginWithCred = async (credential: {
    username: string;
    session: string;
  }) => {
    try {
      await signIn("credentials", credential);
    } catch (err) {
      console.log("couldn't create account");
    }
  };

  if (showModal) {
    return (
      <Modal
        modalClassName=""
        error={{ error: error, errorLable: "could not make user" }}
      >
        <form onSubmit={handleSubmit(createAccount)}>
          <div className="text-center text-neutral-400 text-lg mb-10">
            <p>Create Account to Enter</p>
          </div>
          <SelectPicture images={pfpImages} local="pfp" />
          <div className="flex justify-between text-sm text-neutral-500">
            <p>ID# {ServerSession.current.toLocaleUpperCase()}</p>

            <div className="flex justify-center items-center gap-2 pr-1">
              <p>status</p>
              <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <StandardInput
            register={register}
            id={"username"}
            label="username"
            value={formData.username}
            inputClassName="w-80"
            error={errors.username?.message}
          />
          <Button className={"mt-4"} size={"full"}>
            create account
          </Button>
        </form>
      </Modal>
    );
  }
  return null;
};
