"use client";
export function CRTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-3xl">
        <h1># {title}</h1>
      </span>
      <span className="text-neutral-400">
        <p>{description}</p>
      </span>
      <div className="w-full h-[1px] bg-neutral-400 mt-2" />
    </div>
  );
}

export function CRMemebers() {
  return <div></div>;
}

export function CRShowMessage() {
  return <div></div>;
}

export function CRSendMessage() {
  return <div></div>;
}
