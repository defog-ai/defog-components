import React, { Fragment, useEffect, useState } from "react";

export default function ChartImage({ img }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const { path } = img;
  const [url, setUrl] = useState(null);

  useEffect(() => {
    async function getImage() {
      const res = await fetch("https://agents.defog.ai/get_report_asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: path,
        }),
      });
      try {
        const blob = await res.blob();
        await new Promise((resolve) => {
          let reader = new FileReader();
          reader.onload = function () {
            setUrl(this.result);
            setLoading(false);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.log(e);
        setErr("Error loading chart image.");
      }
    }

    getImage();
  }, [path]);
  return (
    <>
      {loading && !err ? (
        <div>Loading chart image...</div>
      ) : err ? (
        <div>{err}</div>
      ) : (
        <img src={url} />
      )}
    </>
  );
}
