import React from "react";

export function Badge({ st }) {
  return (
    <span className={"badge " + st.key}>
      {st.key === "live" && <i className="pulse" aria-hidden="true" />}
      {st.label}
    </span>
  );
}
