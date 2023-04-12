import { PropsWithChildren } from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset" | undefined;
  onClick?: () => {};
  className?: string;
  disabled?: boolean;
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={`${props.className} p-2 mt-1 text-center w-full rounded`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default Button;
