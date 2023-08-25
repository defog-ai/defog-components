// writes a string like a "chat" message

import React, { useEffect, useRef } from "react";

export default function Writer({
  s = "",
  animate = true,
  children,
  onComplete = () => {},
  start = true,
}) {
  const targetEl = useRef(null);
  const ctr = useRef(null);
  const writing = useRef(false);
  const done = useRef(false);

  function write() {
    let i = targetEl.current.innerHTML.length;
    if (i < s.length) {
      writing.current = true;
      done.current = false;
      targetEl.current.innerHTML += s.charAt(i);
      setTimeout(write, 20);
    } else {
      done.current = true;
      onComplete();
      writing.current = false;
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
    if (!ctr.current) return;

    let tmp;
    // weirdness in carousel where it's cloning stuff
    let clone = ctr.current.closest(".slick-cloned");
    tmp = ctr.current.getElementsByClassName("writer-target");

    // if has targets, and animate is true, hide children
    if (animate && !clone && tmp.length) {
      // hide children
      let c = ctr.current.getElementsByClassName("writer-children");

      if (c.length) {
        let ch = c[0].children;
        for (let i = 0; i < ch.length; i++) {
          ch[i].style.opacity = 0;
        }
      }
    }

    if (tmp.length) {
      // write target
      targetEl.current = tmp[0];
      if (start && animate) {
        write();
      }

      if (!animate) {
        targetEl.current.innerHTML = s;
      }
    } else {
      // no targets. just show everything.
      done.current = true;
      writing.current = false;
      onComplete();
    }
  }, []);

  useEffect(() => {
    if (
      !writing.current &&
      start &&
      animate &&
      ctr.current &&
      !done.current &&
      targetEl.current
    ) {
      write();
    }
  }, [start]);

  return <div ref={ctr}>{children}</div>;
}
