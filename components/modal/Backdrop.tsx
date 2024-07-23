"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Modal({
  children,
  onClose,
  invisBack = false,
  containerClassName,
  modalClassName,
  modalCustomCords,
  error,
}: {
  children: ReactNode;
  onClose: () => void;
  invisBack?: boolean;
  containerClassName?: string;
  modalClassName?: string;
  modalCustomCords?: {
    state: boolean;
    style: { top?: string; bottom?: string; left?: string; right?: string };
  };

  error?: { error: boolean; errorLable: string };
}) {
  return (
    <ModalPortal selector="#__modal">
      <div
        id="modal"
        className={cn(
          "z-40 absolute h-screen w-screen overflow-hidden",
          containerClassName
        )}
      >
        <div
          id="backdrop"
          className={cn("h-screen w-screen bg-black absolute opacity-40", {
            "bg-transparent": invisBack,
          })}
          onClick={onClose}
        ></div>
        <div
          id="modal-container"
          className={cn(
            "z-30 absolute bg-neutral-800 rounded px-5 py-10 text-neutral-200",
            {
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2":
                !modalCustomCords,
            },
            modalClassName
          )}
          style={modalCustomCords ? modalCustomCords.style : {}}
        >
          {children}

          {error && error.error && (
            <p className="absolute bottom-2 text-xs text-red-500">
              *{error.errorLable}
            </p>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}

function ModalPortal({
  children,
  selector,
}: {
  children: ReactNode;
  selector: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  if (mounted && ref.current) return createPortal(children, ref.current);
}
