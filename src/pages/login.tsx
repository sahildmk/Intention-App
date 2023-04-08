import LoadingSpinner from "@/components/loadingSpinner";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const Login: NextPage = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  if (sessionData) void router.push("/");

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="The Intention App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-Inter flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-100 font-light dark:bg-[#131313] dark:text-zinc-300">
        {!sessionData ? (
          <section className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-5xl">Intention App</h1>
            <button
              className="flex items-center justify-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 py-2 px-3 text-zinc-700 transition-all hover:bg-zinc-700 dark:text-zinc-400"
              onClick={() => {
                setLoading(true);
                void signIn();
              }}
            >
              {loading ? <LoadingSpinner /> : "Sign In"}
            </button>
          </section>
        ) : (
          <LoadingSpinner />
        )}
      </main>
    </>
  );
};

export default Login;
