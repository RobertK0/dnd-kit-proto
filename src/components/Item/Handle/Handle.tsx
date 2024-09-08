import React, { forwardRef } from "react";
import { Action, ActionProps } from "../Action/Action";

export const Handle = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action
        ref={ref}
        cursor="grab"
        data-cypress="draggable-handle"
        {...props}
      >
        <svg
          width="20"
          height="12"
          viewBox="0 0 20 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1H19"
            stroke="#1C1C1C"
            stroke-opacity="0.2"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M1 6H19"
            stroke="#1C1C1C"
            stroke-opacity="0.2"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M1 11H19"
            stroke="#1C1C1C"
            stroke-opacity="0.2"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </Action>
    );
  }
);
