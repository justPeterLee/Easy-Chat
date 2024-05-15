"use client";

import { Modal } from "./Backdrop";
import { SelectPicture, StandardInput } from "../ui/Input";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/Button";

export const UserModal = () => {
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

  const createAccount = async () => {};

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
    <Modal>
      <SelectPicture />
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
      <Button onClick={validateUsername} size={"full"}>
        create account
      </Button>
    </Modal>
  );
};
