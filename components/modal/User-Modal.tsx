"use client";

import { Modal } from "./Backdrop";
import { SelectPicture, StandardInput } from "../ui/Input";
import { signIn } from "next-auth/react";
import { useRef, useState } from "react";
import { Button } from "../ui/Button";
import { nanoid } from "nanoid";
import axios from "axios";

export const UserModal = () => {
  const session = useRef(nanoid(5));

  const [username, setUsername] = useState("");
  const [isError, setIsError] = useState(false);

  const validateUsername = () => {
    if (!username.replace(/\s/g, "")) {
      setIsError(true);
      return true;
    } else {
      setIsError(false);
      return false;
    }
  };

  const createAccount = async () => {
    try {
      if (validateUsername()) throw new Error("invalid username");
      const { data }: { data: { username: string; session: string } } =
        await axios.post("/api/user", {
          username: username,
          session: session.current,
        });
      console.log(data);

      await loginWithCred(data);
    } catch (err) {
      console.log(err);
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

  return (
    <Modal modalClassName="">
      <div className="text-center text-gray-400 text-lg mb-10">
        <p>Create Account to Enter</p>
      </div>
      <SelectPicture />
      <div className="flex justify-between text-sm text-gray-500">
        <p>ID# {session.current.toLocaleUpperCase()}</p>

        <div className="flex justify-center items-center gap-2 pr-1">
          <p>status</p>
          <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <StandardInput
        label="username"
        value={username}
        onChange={(newValue: string) => {
          setUsername(newValue);
        }}
        isError={isError}
        errorLabel="invalid username"
        clearError={() => {
          setIsError(false);
        }}
        inputClassName="w-80"
      />
      <Button onClick={createAccount} size={"full"}>
        create account
      </Button>
    </Modal>
  );
};
