import { ReactNode } from "react";
import { Modal } from "./Backdrop";

export function MenuModal({
  children,
  onClose,
  parentRef,
}: {
  children: ReactNode;
  onClose: () => void;
  parentRef: HTMLDivElement;
}) {
  return (
    <Modal
      onClose={onClose}
      invisBack={true}
      modalCustomCords={{
        state: true,
        style: {
          top: `${parentRef.getBoundingClientRect().bottom + 5}px`,
          right: `${innerWidth - parentRef.getBoundingClientRect().right}px`,
        },
      }}
      modalClassName={` p-0 bg-neutral-700`}
    >
      {children}
    </Modal>
  );
}
