import { type ChangeEventHandler } from "react";
import Styles from "./textarea.module.css";
import Script from "next/script";

type Props = {
  value?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
};

const Textarea: React.FC<Props> = ({ onChange, value, placeholder }) => {
  return (
    <div>
      <Script id="textarea_script">
        {`const grower = document.getElementById("grow-wrap-id");
          const textarea = grower.querySelector("textarea");
          
          grower.dataset.replicatedValue = textarea.value;
          
          textarea?.addEventListener("input", () => {
            grower.dataset.replicatedValue = textarea.value;
          });`}
      </Script>
      <div id="grow-wrap-id" className={Styles["grow-wrap"]}>
        <textarea
          className={Styles["text-styling"]}
          value={value}
          onChange={onChange}
          rows={1}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default Textarea;
