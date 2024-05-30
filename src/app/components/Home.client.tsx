"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const Home = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>({ path: "", error: "" });

  useEffect(() => {
    if (!searchParams.get("channel")) {
      router.push("/?channel=" + crypto.randomUUID());
    }
  }, [router, searchParams]);

  const query = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const resp = await fetch("/api/init", { method: "POST" });
      const { address, balance, contract } = await resp.json();
      return {
        contract,
        address,
        balance,
      };
    },
  });

  const statusTexts: { [key: number]: string } = {
    0: "Recording!!",
    1: "Say Somegthing Then Share",
    2: "Uploading...",
    3: "Uploaded, Recording Again",
  };
  const [current, setCurrent] = useState(0);
  let audioChunks: any[] = [];
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event: BlobEvent) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        console.log(audioBlob.size);
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append(
          "path",
          `${searchParams.get(
            "channel"
          )}/test_${new Date().getUTCMilliseconds()}.webpm`
        );
        setCurrent(2);

        const result = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        setResult(await result.json());

        setCurrent(0);
      };

      setRecorder(recorder);
    };
    if (recorder == null) {
      init();
    }
  });

  const operateRecord = async () => {
    console.log("start recording!!!");
    if (recorder != null) {
      if (current == 0) {
        setCurrent(1);
        recorder.start();
      } else {
        setCurrent(2);
        recorder.stop();
      }
    }
  };

  return (
    <div className="main">
      <h1 className="w-full">Web3 Audio Publish Center</h1>
      <p className="mt-1">Address: {query.data?.address}</p>
      <p className="mt-1">Balance: {query.data?.balance}</p>
      <p className="mt-1">Channel: {searchParams.get("channel")}</p>
      <div className="w-full m-2">
        <button
          className="btn"
          onClick={() => operateRecord()}
          disabled={current != 0 && current != 1}
        >
          {statusTexts[current]}
        </button>

        {result.error != "" ? (
          <p>{result.error}</p>
        ) : result.path == "" ? null : (
          <a
            href={`https://${query.data?.contract}.3333.w3link.io/${result.path}`}
          >
            https://{query.data?.contract}.3333.w3link.io/{result.path}{" "}
          </a>
        )}
      </div>
    </div>
  );
};

export default Home;
