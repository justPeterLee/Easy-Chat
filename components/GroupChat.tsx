import { Button } from "./ui/Button";

export function CreateGroupChat() {
  return (
    <Button
      className="h-1 w-1 bg-neutral-900 text-neutral-400 hover:bg-neutral-950 hover:text-neutral-100 rounded-lg"
      size={"lg"}
    >
      <div className="flex justify-center items-center gap-2">
        create chat <p className="text-yellow-400">+</p>
      </div>
    </Button>
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
