import { useState } from "react";
import { Modal } from "./Backdrop";
import { useForm } from "react-hook-form";
import { StandardInput } from "../ui/Input";
import { JoinChat, joinChatValidator } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
export function JoinGCModal({ onClose }: { onClose: () => void }) {
  const [closeCheck, setCloseCheck] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [error, setError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JoinChat>({
    resolver: zodResolver(joinChatValidator),
  });
  const formData = watch();

  return (
    <form>
      <StandardInput
        register={register}
        id={"code"}
        value={formData.code}
        label="code (or url)"
      />
    </form>
  );
}
