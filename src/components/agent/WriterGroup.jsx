// group of Writer components
// call their write function one after the other

import React, { Fragment, useState } from "react";
import Writer from "./Writer";
import { createRoot } from "react-dom/client";

export default function WriterGroup({ items }) {
  const [active, setActive] = useState(0);
  function onComplete() {
    setActive(active + 1);
    try {
      if (items[active] && items[active]?.type === "csvTable") {
        const table = items[active];
        const id = table.emptyHtml.match(/csv-table-[0-9]+/)[0];
        // find the matching id in window.renders
        const rdr = window.renders.find((d) => d.id === id);

        const Component = rdr.component;
        const root = createRoot(document.getElementById(id));
        root.render(<Component {...rdr.props} apiKey={""} apiEndpoint={""} />);
      }
    } catch (e) {
      console.log(e);
    }
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
