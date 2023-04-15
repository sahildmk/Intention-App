import { type NextPage } from "next";
import Head from "next/head";
import { getSession, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { type GetServerSideProps } from "next";
import { type CollectionItemDto } from "@/server/api/routers/collections/collectionsRouter";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { useRouter } from "next/router";
import { TRPCError } from "@trpc/server";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Button from "@/components/ui/button/button";
import IntentionSection from "@/components/intention-section/intention-section";

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

const Clock = dynamic(() => import("@/components/ui/clock"), {
  ssr: false,
});

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

  return (
    <>
      <Head>
        <title>What is your intention?</title>
        <meta name="description" content="The Intention App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-Inter flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-100 font-light dark:bg-[#131313] dark:text-zinc-300">
        {sessionData ? (
          <section className="flex w-full justify-center">
            <Clock />
            <IntentionSection collectionItems={collectionItems} />
            <div className="absolute top-0 right-0 mt-10 mr-10 text-sm">
              <Button
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
              </Button>
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
