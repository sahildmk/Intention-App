import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { type ChangeEvent, useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";

import { type GetServerSideProps } from "next";
import { type CollectionItemDTO } from "@/server/api/routers/collections";

import Styles from "./index.module.css";
import Script from "next/script";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const caller = appRouter.createCaller({
    session: null,
    prisma: prisma,
  });

  const data = await caller.collections.getCollectionItems();

  return {
    props: {
      collectionItems: data,
    },
  };
};

const Home: NextPage<{ collectionItems: CollectionItemDTO[] }> = ({
  collectionItems,
}) => {
  const firstItem = collectionItems.at(0);

  const [intention, setIntention] = useState(firstItem?.content ?? "");

  const currentMoment = moment();
  const currentDate = currentMoment.format("YYYY-MM-DD");

  const startOfCurrentTimeBlockString = `${currentDate}T${String(
    currentMoment.hour()
  ).padStart(2, "0")}:00:00`;

  const [currentIntentionStartTime, setCurrentIntentionStartTime] = useState(
    moment(firstItem?.startDateTime ?? startOfCurrentTimeBlockString)
  );

  const [currentIntentionEndTime, setCurrentIntentionEndTime] = useState(
    moment(firstItem?.endDateTime ?? startOfCurrentTimeBlockString).add(
      1,
      "hour"
    )
  );

  const Clock = dynamic(() => import("@/components/clock"), {
    ssr: false,
  });

  const setIntentionCallback = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIntention(e.target.value);
  };

  return (
    <>
      <Head>
        <title>{intention}</title>
        <meta name="description" content="The Intention App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-Inter flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-100 font-light dark:bg-[#131313]">
        <Script id="textarea_script">
          {`const growers = document.querySelectorAll("#grow-wrap-id");

growers.forEach((grower) => {
  const textarea = grower.querySelector("textarea");
  textarea?.addEventListener("input", () => {
    grower.dataset.replicatedValue = textarea.value;
  });
});`}
        </Script>
        <Clock />
        <section>
          <div>
            {/* <input
              type={"text"}
              className="items-center justify-center rounded-lg bg-transparent px-5 pb-2 text-4xl text-white transition-all after:h-full after:w-2 after:bg-white hover:bg-zinc-800 focus:outline-none md:text-5xl lg:text-7xl"
              value={intention === "" ? "Set current intention" : intention}
              onChange={setIntentionCallback}
            /> */}
            <div id="grow-wrap-id" className={Styles["grow-wrap"]}>
              <textarea
                className={Styles["text-styling"]}
                value={intention === "" ? "Set current intention" : intention}
                onChange={setIntentionCallback}
              />
            </div>
          </div>
          <div className="mt-2 flex gap-1 text-sm font-extralight text-zinc-700 dark:text-zinc-300 md:text-sm lg:text-xl">
            <div className="rounded-md px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-800">
              {currentIntentionStartTime.format("h:mm a")}
            </div>
            <div className="py-1">-</div>
            <div className="rounded-md px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-800">
              {currentIntentionEndTime.format("h:mm a")}
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
