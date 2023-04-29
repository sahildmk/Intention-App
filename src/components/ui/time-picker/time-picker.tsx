import { type ChangeEventHandler } from "react";

type Props = {
  value?: string;
  min?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const TimePicker: React.FC<Props> = ({ min, onChange, value }) => {
  return (
    <input
      className="relative rounded-md bg-transparent px-2 py-1 transition-all hover:cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-800"
      type="time"
      value={value}
      min={min}
      onChange={onChange}
    />
  );
};

export default TimePicker;
