interface PageProps {
  params: {
    chatId: string;
  };
}
export default async function ChatRoom({ params }: PageProps) {
  return (
    <main className="bg-neutral-800 h-screen w-screen p-10 grid grid-cols-[repeat(auto-fill,_minmax(12rem,_0px))] gap-4 auto-rows-[minmax(0,_4rem)]">
      {params.chatId}
    </main>
  );
}
//
