import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 pt-10 pl-10 text-2xl text-zinc-700 dark:text-zinc-400 md:text-4xl lg:text-4xl">
      {time.toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
      })}
    </div>
  );
}
