"use client";

import { Modal } from "./Backdrop";
import { StandardInput } from "../elements/Input";
import { signIn } from "next-auth/react";
import { useState } from "react";

export const UserModal = () => {
  const [username, setUsername] = useState("");

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
      <StandardInput
        label="username"
        value={username}
        onChange={(newValue: string) => {
          setUsername(newValue);
        }}
        isError={true}
        errorLabel="invalid username"
      />
      <button>login</button>
    </Modal>
  );
};
