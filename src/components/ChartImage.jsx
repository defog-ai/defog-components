import React, { Fragment, useEffect, useRef } from "react";

export default function ChartImage({ images = [] }) {
  const imgRefs = useRef(images.map(() => null));

  useEffect(() => {
    async function getImage(path, idx) {
      try {
        const res = await fetch("https://agents.defog.ai/get_report_asset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: path,
          }),
        });
        const blob = await res.blob();
        await new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.onload = function () {
            imgRefs.current[idx].src = reader.result;
            resolve();
          };
          reader.onerror = function () {
            reject();
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.log(e);
      }
    }

    images.forEach((image, i) => {
      getImage(image.path, i);
    });
  }, [images]);
  return (
    <>
      {images.map((image, i) => (
        <img
          ref={(ref) => (imgRefs.current[i] = ref)}
          key={i}
          alt={image.path}
        />
      ))}
    </>
  );
}
