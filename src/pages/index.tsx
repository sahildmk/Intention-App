import { type NextPage } from "next";
import Head from "next/head";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { type ChangeEvent, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import { type GetServerSideProps } from "next";
import { type CollectionItemDto } from "@/server/api/routers/collections";
import Styles from "./index.module.css";
import Script from "next/script";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { useRouter } from "next/router";
import { TRPCError } from "@trpc/server";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "@/components/loadingSpinner";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const caller = appRouter.createCaller({
    session: await getSession(ctx),
    prisma: prisma,
  });

  let data: CollectionItemDto[] = [];

  try {
    const result = await caller.collections.getCollectionItems();
    if (result.ok) data = result.value;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED")
      console.log("Unauthorized. Logging out...");
  }

  return {
    props: {
      collectionItems: data,
    },
  };
};

const Home: NextPage<{ collectionItems: CollectionItemDto[] }> = ({
  collectionItems,
}) => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const router = useRouter();

  const [calledPush, setCalledPush] = useState(false);

  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    if (sessionStatus === "unauthenticated" && !sessionData && !calledPush) {
      void router.push("/login");
      setCalledPush(true);
    }
  }, [calledPush, router, sessionData, sessionStatus]);

  const firstItem = collectionItems.at(0);

  const [intention, setIntention] = useState(firstItem?.content ?? "");
  const [intentionUpdated, setIntentionUpdated] = useState(false);

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
    setIntentionUpdated(true);
    setIntention(e.target.value);
  };

  const updateIntentionMut = api.collections.updateCollectionItem.useMutation();

  const updateIntentionCallback = useCallback(() => {
    if (firstItem?.id && intentionUpdated)
      updateIntentionMut.mutate({
        collectionItemId: firstItem?.id,
        content: intention,
      });
  }, [firstItem?.id, intention, updateIntentionMut, intentionUpdated]);

  useEffect(() => {
    const timeout = setTimeout(updateIntentionCallback, 2000);

    return () => {
      clearTimeout(timeout);
      setIntentionUpdated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intention]);

  return (
    <>
      <Head>
        <title>{intention}</title>
        <meta name="description" content="The Intention App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-Inter flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-100 font-light dark:bg-[#131313] dark:text-zinc-300">
        {sessionData ? (
          <section>
            <Script id="textarea_script">
              {`const grower = document.getElementById("grow-wrap-id");
                const textarea = grower.querySelector("textarea");
                
                grower.dataset.replicatedValue = textarea.value;
                
                textarea?.addEventListener("input", () => {
                  grower.dataset.replicatedValue = textarea.value;
                });`}
            </Script>
            <Clock />
            <section className="px-5 sm:px-10">
              <div>
                <div id="grow-wrap-id" className={Styles["grow-wrap"]}>
                  <textarea
                    className={Styles["text-styling"]}
                    value={intention}
                    onChange={setIntentionCallback}
                    rows={1}
                    placeholder="What is your intention?"
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
            <div className="absolute top-0 right-0 mt-10 mr-10 text-sm">
              <button
                className="flex items-center justify-center gap-1 rounded-md border p-2 text-zinc-700 transition-all hover:bg-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                onClick={() => {
                  setLoadingLogout(true);
                  void signOut();
                }}
              >
                {loadingLogout ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-400" />
                    Sign out
                  </>
                )}
              </button>
            </div>
          </section>
        ) : (
          <LoadingSpinner />
        )}
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
