import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { useState } from "react";
import dynamic from "next/dynamic";

const Home: NextPage = () => {
  const [intention, setIntention] = useState("What is your Intention?");

  const Clock = dynamic(() => import("@/components/clock"), {
    ssr: false,
  });

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
              className="items-center justify-center rounded-lg bg-transparent text-4xl text-white transition-all after:h-full after:w-2 after:bg-white hover:bg-zinc-800 focus:outline-none md:text-5xl lg:text-7xl"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
            />
          </div>
          <div className="text-sm font-extralight text-zinc-300 md:text-sm lg:text-xl">
            9:45 pm - 10:45 pm
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
