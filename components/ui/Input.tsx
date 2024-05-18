import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Modal } from "../modal/Backdrop";
import Image from "next/image";
import { Button } from "./Button";
interface StandardInputProps {
  label: string;

  outClassName?: string;
  innerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;

  errorLabel?: string;
  isError?: boolean;
  clearError?: () => void;

  value: string;
  onChange: (newValue: string) => void;
}

export function StandardInput(props: StandardInputProps) {
  const { label } = props;
  const { outClassName, innerClassName, labelClassName, inputClassName } =
    props;
  const { errorLabel, isError, clearError } = props;
  const { value, onChange } = props;

  const [isFocus, setIsFocus] = useState(false);

  const labelAnimation = {
    "text-base top-1/2 text-neutral-400": !isFocus && !value,
    "top-0 text-sm bg-neutral-800 p-1 text-blue-500": isFocus,
    "top-0 text-sm bg-neutral-800 p-1 text-neutral-400": value && !isFocus,
  };

  return (
    <div
      id="outter-stand-input"
      className={`flex flex-col mb-4 relative ${outClassName}`}
    >
      <div id="inner-stand-input" className={`relative mt-3 ${innerClassName}`}>
        <label
          id="stand-label"
          htmlFor="stand-input"
          className={cn(
            `absolute -translate-y-1/2 left-2 transition-all duration-75 ease-out`,
            labelAnimation,
            labelClassName
          )}
        >
          {label}
        </label>
        <input
          id="stand-input"
          className={`bg-transparent border-2 border-neutral-500 rounded  min-h-7 p-2 outline-none transition-all duration-75 ease-out focus:border-blue-500 ${inputClassName} ${
            isError && "border-red-700"
          }`}
          value={value}
          onChange={(e) => {
            onChange(e.currentTarget.value);
          }}
          onFocus={() => {
            setIsFocus(true);
            if (clearError) {
              clearError();
            }
          }}
          onBlur={() => {
            setIsFocus(false);
          }}
        ></input>
      </div>
      {errorLabel &&
        (isError ? (
          <label
            htmlFor="stand-input"
            className="text-red-700 text-xs absolute -bottom-4"
          >
            *{errorLabel}
          </label>
        ) : (
          <></>
        ))}
    </div>
  );
}

const pfpImages: { [key: string]: { image: string; alt: string } } = {
  heart: {
    image: "/pfp/heart.webp",
    alt: "heart",
  },
  moon: {
    image: "/pfp/moon.webp",
    alt: "moon",
  },
  mushroom: {
    image: "/pfp/mushroom.webp",
    alt: "mushroom",
  },
  robot: {
    image: "/pfp/robot.webp",
    alt: "robot",
  },
  sun: {
    image: "/pfp/sun.webp",
    alt: "sun",
  },
  sunflower: {
    image: "/pfp/sunflower.webp",
    alt: "sunflower",
  },
};

function SelectGrid({
  onClose,
  setImage,
  selected,
}: {
  onClose: () => void;
  setImage: (selectedImage: string) => void;
  selected: string;
}) {
  const imageKeys = Object.keys(pfpImages);
  const [isConsidered, setIsConsidered] = useState(selected);

  return (
    <Modal
      invisBack={true}
      modalClassName="p-10 z-40 flex justify-center items-center flex-col gap-10"
      containerClassName="top-0 left-0"
      onClose={onClose}
    >
      <p className="text-2xl">Select an Image</p>
      <div className="grid grid-cols-3 gap-8">
        {imageKeys.map((_key) => {
          return (
            <PfpCard
              key={Math.random()}
              imageKey={_key}
              imageData={pfpImages[_key]}
              selected={isConsidered === _key}
              setConsidered={(image) => {
                setIsConsidered(image);
              }}
            />
          );
        })}
      </div>
      <div className="flex gap-4">
        <Button
          variant={"ghost"}
          onClick={() => {
            onClose();
          }}
        >
          cancel
        </Button>
        <Button
          className="px-5"
          onClick={() => {
            setImage(isConsidered);
            onClose();
          }}
        >
          save
        </Button>
      </div>
    </Modal>
  );
}

function PfpCard({
  imageKey,
  imageData,
  selected,
  setConsidered,
}: {
  imageKey: string;
  imageData: { image: string; alt: string };
  selected: boolean;
  setConsidered: (image: string) => void;
}) {
  const s = {
    "ring ring-neutral-300 ring-offset-4 ring-offset-neutral-700": selected,
  };
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex justify-center items-center hover:brightness-[.6] hover:cursor-pointer",
        s
      )}
      onClick={() => {
        setConsidered(imageKey);
      }}
    >
      <Image
        className="select-none pointer-events-none"
        src={imageData.image}
        alt={imageData.alt}
        width={200}
        height={200}
      />
    </div>
  );
}
export function SelectPicture() {
  const savedImage = localStorage.getItem("pfp");
  const validImage = Object.keys(pfpImages);

  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [imageTag, setImageTag] = useState(
    savedImage
      ? validImage.includes(savedImage)
        ? savedImage
        : "sunflower"
      : "sunflower"
  );

  useEffect(() => {
    if (!savedImage) {
      localStorage.setItem("pfp", "sunflower");
    }
  }, [savedImage]);

  return (
    <div className="w-full flex justify-center items-center mb-10">
      <div
        className="h-52 w-52 border-2 border-neutral-400 rounded-full flex items-center justify-center transition duration-75 hover:cursor-pointer overflow-hidden hover:brightness-[.6] ring ring-neutral-500 ring-offset-4 ring-offset-neutral-700"
        onClick={() => {
          setIsFocus(true);
        }}
        onMouseOver={() => {
          setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
      >
        <Image
          src={`/pfp/${imageTag}.webp`}
          alt={"profile picture"}
          width={500}
          height={500}
        />
      </div>
      {isHover && (
        <p className="absolute select-none pointer-events-none">change pic</p>
      )}

      {isFocus && (
        <SelectGrid
          onClose={() => {
            setIsFocus(false);
          }}
          setImage={(selectedImage) => {
            setImageTag(selectedImage);
            localStorage.setItem("pfp", selectedImage);
          }}
          selected={imageTag}
        />
      )}
    </div>
  );
}
