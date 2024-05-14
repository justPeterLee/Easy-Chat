import { useState } from "react";

interface StandardInputProps {
  label: string;

  outClassName?: string;
  innerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;

  errorLabel?: string;
  isError?: boolean;

  value: string;
  onChange: (newValue: string) => void;
}

export function StandardInput(props: StandardInputProps) {
  const { label } = props;
  const { outClassName, innerClassName, labelClassName, inputClassName } =
    props;
  const { errorLabel, isError } = props;
  const { value, onChange } = props;

  const [isFocus, setIsFocus] = useState(false);
  return (
    <div
      id="outter-stand-input"
      className={`flex flex-col mb-4 relative ${outClassName}`}
    >
      <div id="inner-stand-input" className={`relative m-1 ${innerClassName}`}>
        <label
          id="stand-label"
          htmlFor="stand-input"
          className={`absolute top-1/2 -translate-y-1/2 left-2 text-gray-400 transition-all duration-75 ease-out ${
            isFocus && "top-0 text-sm bg-slate-700 p-1 text-blue-500"
          } ${value && "top-0 text-sm bg-slate-700 p-1"} ${labelClassName} `}
        >
          {label}
        </label>
        <input
          id="stand-input"
          className={`bg-transparent border-2 border-gray-400 rounded  min-h-7 p-2 outline-none transition-all duration-75 ease-out focus:border-blue-500 ${inputClassName}`}
          value={value}
          onChange={(e) => {
            onChange(e.currentTarget.value);
          }}
          onFocus={() => {
            setIsFocus(true);
          }}
          onBlur={() => {
            setIsFocus(false);
          }}
        ></input>
      </div>
      {errorLabel &&
        (isError ? (
          <label
            htmlFor="stand-input"
            className="text-red-700 text-xs absolute -bottom-4"
          >
            *{errorLabel}
          </label>
        ) : (
          <></>
        ))}
    </div>
  );
}
