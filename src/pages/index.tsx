import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { type ChangeEvent, useState } from "react";
import dynamic from "next/dynamic";
import { CollectionItem } from "@prisma/client";
import moment from "moment";

const Home: NextPage = () => {
  const collectionsQuery = api.collections.getCollectionItems.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      onSuccess(data) {
        console.log(data.at(0));

        setFirstColItem(data.at(0));
        setIntention(data.at(0)?.content ?? "");
      },
    }
  );

  const [intention, setIntention] = useState("What is your Intention?");

  const [firstColItem, setFirstColItem] = useState<CollectionItem>();

  const Clock = dynamic(() => import("@/components/clock"), {
    ssr: false,
  });

  const setIntentionCallback = (e: ChangeEvent<HTMLInputElement>) => {
    setIntention(e.target.value);
  };

  return (
    <>
      <Head>
        <title>{intention}</title>
        <meta name="description" content="The Intention App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-Inter flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#252525] to-[#151515] font-light">
        <Clock />
        <section>
          <div>
            <input
              type={"text"}
              className="items-center justify-center rounded-lg bg-transparent px-5 pb-2 text-4xl text-white transition-all after:h-full after:w-2 after:bg-white hover:bg-zinc-800 focus:outline-none md:text-5xl lg:text-7xl"
              value={intention}
              onChange={setIntentionCallback}
            />
          </div>
          <div className="flex gap-1 px-3 text-sm font-extralight text-zinc-300 md:text-sm lg:text-xl">
            <div className="rounded-md px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-800">
              {moment(firstColItem?.StartDateTime).format("h:mm a")}
            </div>
            <div className="py-1">-</div>
            <div className="rounded-md px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-800">
              {moment(firstColItem?.EndDateTime).format("h:mm a")}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
