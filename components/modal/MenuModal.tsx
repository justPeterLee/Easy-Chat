import { ReactNode } from "react";
import { Modal } from "./Backdrop";

export function MenuModal({
  children,
  onClose,
  parentRef,
  customCords,
}: {
  children: ReactNode;
  onClose: () => void;
  parentRef: HTMLDivElement;
  customCords?: {
    state: boolean;
    style: {
      top?: string | undefined;
      bottom?: string | undefined;
      left?: string | undefined;
      right?: string | undefined;
      transform?: string | undefined;
    };
  };
}) {
  return (
    <Modal
      onClose={onClose}
      invisBack={true}
      modalCustomCords={
        customCords || {
          state: true,
          style: {
            top: `${parentRef.getBoundingClientRect().bottom + 5}px`,
            right: `${innerWidth - parentRef.getBoundingClientRect().right}px`,
          },
        }
      }
      modalClassName={` p-0 bg-neutral-700 flex flex-col`}
    >
      {children}
    </Modal>
  );
}
