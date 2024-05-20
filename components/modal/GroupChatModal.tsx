import { Modal } from "./Backdrop";
import { SelectPicture, StandardInput } from "../ui/Input";
import { useState } from "react";
import { Button } from "../ui/Button";
export function CreateGroupChatModal() {
  const [chatSettings, setChatSetting] = useState({
    title: "",
    description: "",
    privacy: false,
    password: "",
  });
  return (
    <Modal modalClassName="min-w-80">
      <div className="text-center text-neutral-400 text-lg mb-10">
        <p>Create a Chat</p>
      </div>
      <SelectPicture />
      <div></div>
      <StandardInput
        id={"chat-title"}
        inputClassName="w-full"
        value={chatSettings.title}
        onChange={(newTitle) => {
          setChatSetting({ ...chatSettings, title: newTitle });
        }}
        label="title"
      />

      <StandardInput
        id={"text-area"}
        inputClassName="w-full"
        value={chatSettings.description}
        onChange={(newDescription) => {
          setChatSetting({ ...chatSettings, description: newDescription });
        }}
        label="description"
        isTextArea={true}
      />

      <div className="flex justify-center items-center mb-5 w-full">
        <label className="inline-flex items-center me-5 cursor-pointer flex-col justify-center gap-1">
          <span className=" text-sm font-medium text-neutral-400 select-none pointer-events-none">
            Private
          </span>
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={chatSettings.privacy}
            onChange={(e) => {
              setChatSetting({
                ...chatSettings,
                privacy: e.target.checked,
                password: e.target.checked ? chatSettings.password : "",
              });
            }}
          />
          <div className="relative w-11 h-6 bg-neutral-600 rounded-full peer dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-yellow-500"></div>
        </label>
        <StandardInput
          id={"chat-password"}
          inputClassName="w-full"
          value={chatSettings.password}
          onChange={(newPassword) => {
            setChatSetting({ ...chatSettings, password: newPassword });
          }}
          label="password"
          disable={!chatSettings.privacy}
          type="password"
        />
      </div>
      <Button size={"full"}>create</Button>
    </Modal>
  );
}
