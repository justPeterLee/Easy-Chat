import { useState } from "react";
import { Button } from "./ui/Button";
import { CreateGCModal } from "./modal/CreateGCModal";
import { GCModal } from "./modal/GCModal";
export function CreateGroupChat() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <GCModal
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
      <Button
        className="h-1 w-1 bg-neutral-900 text-neutral-400 hover:bg-neutral-950 hover:text-neutral-100 rounded-lg"
        size={"lg"}
        onClick={() => {
          setShowModal(true);
        }}
      >
        <div className="flex justify-center items-center gap-2">
          create chat <p className="text-yellow-400">+</p>
        </div>
      </Button>
    </>
  );
}

export function GroupChatCard() {
  return (
    <Button
      className="h-1 w-1 bg-neutral-700 hover:brightness-[.9] hover:bg-neutral-700 rounded-lg "
      size={"lg"}
    >
      <div>chat </div>
    </Button>
  );
}

export function GroupChatSideCard() {}
