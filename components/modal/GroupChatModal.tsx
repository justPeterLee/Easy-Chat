import { Modal } from "./Backdrop";
import { SelectPicture, StandardInput } from "../ui/Input";
import { useState } from "react";
export function CreateGroupChatModal() {
  const [chatSettings, setChatSetting] = useState({
    title: "",
    description: "",
    privacy: false,
    password: "",
  });
  return (
    <Modal>
      <SelectPicture />
      <div></div>
      <StandardInput
        keyTag={1}
        value={chatSettings.title}
        onChange={(newTitle) => {
          setChatSetting({ ...chatSettings, title: newTitle });
        }}
        label="title"
      />

      <StandardInput
        keyTag={"text-area"}
        value={chatSettings.description}
        onChange={(newDescription) => {
          setChatSetting({ ...chatSettings, description: newDescription });
        }}
        label="description"
        isTextArea={true}
      />
    </Modal>
  );
}
