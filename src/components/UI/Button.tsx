import { PropsWithChildren } from "react";

const Button = (props: PropsWithChildren<any>) => {
  return (
    <button
      className={`${props.className} p-2 mt-1 text-center w-full rounded`}
      onClick={props.onClick}
      type={props.type}
    >
      {props.children}
    </button>
  );
};

export default Button;
