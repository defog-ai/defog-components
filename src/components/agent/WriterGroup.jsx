// group of Writer components
// call their write function one after the other

import React, { Fragment, useState } from "react";
import Writer from "./Writer";

export default function WriterGroup({ items }) {
  const [active, setActive] = useState(0);
  function onComplete() {
    setActive(active + 1);
  }

  return (
    <>
      {items.map((item, i) => (
        <Writer
          s={item.text}
          key={item.key || i}
          animate={item.animate}
          onComplete={onComplete}
          start={item.animate && active === i}
        >
          <div dangerouslySetInnerHTML={{ __html: item.emptyHtml }}></div>
        </Writer>
      ))}
    </>
  );
}
