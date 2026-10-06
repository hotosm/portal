import { Fragment } from "react";

/** Renders `**phrase**` markers inside a translated string as <strong>. */
export function renderBold(text: string) {
  return text.split("**").map((part, index) => (
    <Fragment key={index}>
      {index % 2 === 1 ? <strong>{part}</strong> : part}
    </Fragment>
  ));
}
