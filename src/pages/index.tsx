import { type NextPage } from "next";
import Head from "next/head";
import { getSession, signOut, useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { type ChangeEvent, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import { type GetServerSideProps } from "next";
import { type CollectionItemDto } from "@/server/api/routers/collections/collectionsRouter";
import Styles from "./index.module.css";
import Script from "next/script";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { useRouter } from "next/router";
import { TRPCError } from "@trpc/server";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/loadingSpinner";
import { useToast } from "@/hooks/ui/use-toast";

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

const Clock = dynamic(() => import("@/components/clock"), {
  ssr: false,
});

const Home: NextPage<{ collectionItems: CollectionItemDto[] }> = ({
  collectionItems,
}) => {
  const { toast } = useToast();
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

  const [firstItention, setFirstIntention] = useState(collectionItems.at(0));
  const [intention, setIntention] = useState(firstItention?.content ?? "");
  const [intentionUpdated, setIntentionUpdated] = useState(false);

  const currentMoment = moment();
  const currentDate = currentMoment.format("YYYY-MM-DD");

  const startOfCurrentTimeBlockString = `${currentDate}T${String(
    currentMoment.hour()
  ).padStart(2, "0")}:00:00`;

  const [currentIntentionStartTime, setCurrentIntentionStartTime] = useState(
    moment(firstItention?.startDateTime ?? startOfCurrentTimeBlockString)
  );

  const endTime = firstItention?.endDateTime
    ? moment(firstItention?.endDateTime)
    : moment(startOfCurrentTimeBlockString).add(1, "hour");

  const [currentIntentionEndTime, setCurrentIntentionEndTime] =
    useState(endTime);

  const setIntentionCallback = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIntentionUpdated(true);
    setIntention(e.target.value);
  };

  const timeToLocalISOString = (time: string) => {
    return `${currentDate}T${time}:00`;
  };

  const setStartTimeCallback = (e: ChangeEvent<HTMLInputElement>) => {
    setIntentionUpdated(true);
    setCurrentIntentionStartTime(moment(timeToLocalISOString(e.target.value)));
    // console.log(moment(timeToLocalISOString(e.target.value)).toISOString());
  };

  const setEndTimeCallback = (e: ChangeEvent<HTMLInputElement>) => {
    setIntentionUpdated(true);
    setCurrentIntentionEndTime(moment(timeToLocalISOString(e.target.value)));
  };

  const createIntentionMut = api.collections.createCollectionItem.useMutation({
    onSuccess(data) {
      if (data.ok) setFirstIntention(data.value);
    },
  });
  const updateIntentionMut = api.collections.updateCollectionItem.useMutation();

  const updateIntentionCallback = useCallback(() => {
    if (!intentionUpdated) return;

    if (firstItention?.id) {
      console.log("➡️ Updating intention...");
      updateIntentionMut.mutate({
        collectionItemId: firstItention?.id,
        content: intention,
        startDateTime: currentIntentionStartTime.toISOString(),
        endDateTime: currentIntentionEndTime.toISOString(),
      });
      toast({
        description: "Intention Updated",
      });
    } else if (intention !== "") {
      console.log("🎆 Creating intention...");

      createIntentionMut.mutate({
        content: intention,
        startDateTime: currentIntentionStartTime.toISOString(),
        endDateTime: currentIntentionEndTime.toISOString(),
      });
      toast({
        description: "Intention Saved",
      });
    }
  }, [
    toast,
    intentionUpdated,
    firstItention?.id,
    intention,
    updateIntentionMut,
    currentIntentionStartTime,
    currentIntentionEndTime,
    createIntentionMut,
  ]);

  useEffect(() => {
    const timeout = setTimeout(updateIntentionCallback, 2000);

    return () => {
      clearTimeout(timeout);
      setIntentionUpdated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intention, currentIntentionStartTime, currentIntentionEndTime]);

  return (
    <>
      <Head>
        <title>{intention}</title>
        <meta name="description" content="The Intention App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-Inter flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-100 font-light dark:bg-[#131313] dark:text-zinc-300">
        {sessionData ? (
          <section className="flex w-full justify-center">
            <Script id="textarea_script">
              {`const grower = document.getElementById("grow-wrap-id");
                const textarea = grower.querySelector("textarea");
                
                grower.dataset.replicatedValue = textarea.value;
                
                textarea?.addEventListener("input", () => {
                  grower.dataset.replicatedValue = textarea.value;
                });`}
            </Script>
            <Clock />
            <section className="w-full px-5 sm:px-10 md:w-fit">
              <div>
                <div id="grow-wrap-id" className={Styles["grow-wrap"]}>
                  <textarea
                    className={Styles["text-styling"]}
                    value={intention}
                    onChange={setIntentionCallback}
                    rows={1}
                    placeholder="Set your intention"
                  />
                </div>
              </div>
              <div className="time-picker text-md mt-2 flex gap-1 font-extralight text-zinc-700 dark:text-zinc-300 md:text-xl">
                <input
                  className="rounded-md bg-transparent px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-800"
                  type="time"
                  value={currentIntentionStartTime.format("HH:mm")}
                  onChange={setStartTimeCallback}
                />

                <div className="py-1">-</div>

                <input
                  className="rounded-md bg-transparent px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-800"
                  type="time"
                  value={currentIntentionEndTime.format("HH:mm")}
                  min={currentIntentionEndTime.format("HH:mm")}
                  onChange={setEndTimeCallback}
                />
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
