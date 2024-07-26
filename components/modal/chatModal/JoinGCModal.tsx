import { useForm } from "react-hook-form";
import { StandardInput } from "../../ui/Input";
import { JoinChat, joinChatValidator } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "../../ui/Button";
import { z } from "zod";
import axios, { AxiosError } from "axios";
export function JoinGCModal({
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
  } = useForm<JoinChat>({
    resolver: zodResolver(joinChatValidator),
  });
  const formData = watch();

  useEffect(() => {
    if (!hasChanged) {
      if (formData.code || formData.password) {
        updateHasChanged(true);
      }
    }
  }, [formData]);

  const onSubmit = async (code: JoinChat) => {
    try {
      const validatedCode = joinChatValidator.parse(code);
      console.log(validatedCode);
      await axios.post("/api/chat/join", validatedCode);
      onClose();
      updateError({ error: false, errorLable: "" });
    } catch (err) {
      updateError({ error: true, errorLable: "could not join chat" });
      if (err instanceof z.ZodError) {
        console.log("unable to join chat", { message: err.message });
        return;
      }
      if (err instanceof AxiosError) {
        console.log("failed to join chat", { message: err.response });
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center flex flex-col gap-0">
        <span className="text-neutral-400 text-lg ">Join Chat</span>
        <Button
          type="button"
          variant={"ghost"}
          className="p-0 hover:bg-transparent underline text-neutral-500 text-sm"
          onClick={() => {
            updateModalState("create");
          }}
        >
          or create
        </Button>
      </div>
      <StandardInput
        register={register}
        id={"code"}
        inputClassName="w-full"
        // outClassName="mb-4"
        value={formData.code}
        label="code (or url)"
        error={errors.code?.message}
      />
      <StandardInput
        register={register}
        id={"password"}
        inputClassName="w-full"
        outClassName="mb-4"
        value={formData.password ? formData.password : ""}
        label="password"
      />
      <Button size={"full"} type="submit">
        join
      </Button>
    </form>
  );
}
