import { type MouseEventHandler, type ReactNode } from "react";

type Props = {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  children?: ReactNode;
};

const Button: React.FC<Props> = ({ onClick, children }) => {
  return (
    <button
      className="flex items-center justify-center gap-1 rounded-md border p-2 text-zinc-700 transition-all hover:bg-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
