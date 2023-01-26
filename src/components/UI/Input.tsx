import { forwardRef } from "react";

interface InputProps {
  id: string;
  type: string;
  label: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <div className="flex flex-col w-full p-2 justify-around">
      <label
        className="text-slate-900 dark:text-slate-200 w-fit p-1 backdrop-blur-xl rounded dark:bg-slate-900 bg-slate-200 !bg-opacity-20"
        htmlFor={props.id}
      >
        {props.label}
      </label>
      <input
        ref={ref}
        className={`border-b-2 border-solid border-b-slate-800 dark:border-b-slate-100 text-slate-900 dark:text-slate-200 bg-transparent outline-none ${props.className}`}
        type={props.type}
        name={props.id}
        id={props.id}
      />
    </div>
  );
});

export default Input;
