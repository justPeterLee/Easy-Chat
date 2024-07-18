import { useState } from "react";
import { Modal } from "./Backdrop";
import { Button } from "../ui/Button";
import { CreateGCModal } from "./CreateGCModal";

export function GCModal({ onClose }: { onClose: () => void }) {
  const [hasChanged, setHasChanged] = useState(false);
  const [closeCheck, setCloseCheck] = useState(false);
  const [error, setError] = useState(false);

  const updateHasChanged = (newState: boolean) => {
    setHasChanged(newState);
  };
  const updateError = (newState: boolean) => {
    setError(newState);
  };

  return (
    <>
      <Modal
        modalClassName="min-w-80"
        onClose={() => {
          if (hasChanged) {
            setCloseCheck(true);
          } else {
            onClose();
          }
        }}
        error={{ error: error, errorLable: "could not make chat" }}
      >
        <>
          <CreateGCModal
            onClose={onClose}
            updateHasChanged={updateHasChanged}
            updateError={updateError}
            hasChanged={hasChanged}
          />
        </>
      </Modal>

      {closeCheck && hasChanged && (
        <Modal
          onClose={() => {
            setCloseCheck(false);
          }}
        >
          <p className="mb-6">Are you sure you want to discard chat?</p>
          <div className="flex gap-2 w-full justify-end">
            <Button variant={"ghost"} onClick={() => setCloseCheck(false)}>
              cancel
            </Button>
            <Button className="text-red-600" onClick={onClose}>
              discard
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
