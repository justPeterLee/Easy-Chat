import Link from "next/link";

export default function notFound() {
  return (
    <main className="flex flex-col  text-white bg-neutral-800 h-screen w-full relative overflow-hidden justify-center items-center">
      <img src="/svg/notFound1.svg" className="w-[20rem]" />
      <div className="flex flex-col justify-center items-center gap-5">
        <p className="text-[5rem] text-neutral-500">(Page: Not Found)</p>
        <Link
          href={"/"}
          className="p-2 bg-neutral-700  rounded hover:brightness-75 duration-75 text-sm "
        >
          return
        </Link>
      </div>
    </main>
  );
}
