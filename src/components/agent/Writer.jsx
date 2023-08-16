// writes a string like a "chat" message

import React, { useEffect, useRef } from "react";

export default function Writer({ s, animate = true, children }) {
  const targetEl = useRef(null);
  const ctr = useRef(null);

  function write() {
    let i = targetEl.current.innerHTML.length;
    if (i < s.length) {
      targetEl.current.innerHTML += s.charAt(i);
      setTimeout(write, 20);
    } else {
      // show hidden
      let c = ctr.current.getElementsByClassName("writer-children");
      //   for child inside writer-children, show opacity one by one
      if (c.length) {
        c[0].style.opacity = 1;

        let ch = c[0].children;

        for (let i = 0; i < ch.length; i++) {
          ch[i].style.transitionProperty = "opacity";
          ch[i].style.transitionDuration = "1s";
          ch[i].style.transitionDelay = i * 0.5 + "s";
          ch[i].style.opacity = 1;
        }
      }
    }
  }

  useEffect(() => {
    if (!ctr) return;

    let tmp;
    // weirdness in carousel where it's cloning stuff
    let clone = ctr.current.closest(".slick-cloned");

    tmp = ctr.current.getElementsByClassName("writer-target");
    if (tmp.length) {
      targetEl.current = tmp[0];
    }

    if (animate && !clone) {
      let c = ctr.current.getElementsByClassName("writer-children");

      if (c.length) {
        let ch = c[0].children;
        for (let i = 0; i < ch.length; i++) {
          ch[i].style.opacity = 0;
        }
      }
      write();
    }
    if (!animate) {
      targetEl.current.innerHTML = s;
    }
  }, []);

  return <div ref={ctr}>{children}</div>;
}
