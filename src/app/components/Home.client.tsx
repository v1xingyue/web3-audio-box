"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { WebmAudioToWav } from "../audio";


(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const doUpload = async (channel: string, path: string, audioBlob: Blob) => {
  const wavBlob = await WebmAudioToWav(audioBlob);
  const formData = new FormData();
  formData.append("audio", wavBlob);
  formData.append("path", path);
  formData.append("channel", channel);  

  const result = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  return result.json();
};

const Home = () => {
  const [seconds, setSeconds] = useState(15);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>({ path: "", error: "" });
  const [channel, setChannel] = useState("");

  useEffect(() => {
    if (!searchParams.get("channel")) {
      const id = crypto.randomUUID();
      setChannel(id);
      router.push("/?channel=" + id);
    } else {
      setChannel(searchParams.get("channel") as string);
    }

    const v = localStorage.getItem("seconds");
    if (v) {
      setSeconds(parseInt(v));
    } else {
      localStorage.setItem("seconds", "5");
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
        // get audio format 
        const audioType = recorder.mimeType;
        console.log("audioType:", audioType);

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const uploadPath = `${channel}/audio_${new Date().getTime()}.wav`;
        setCurrent(2);
        const result = await doUpload(channel, uploadPath, audioBlob);
        setResult(result);
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
        let s = seconds;
        const timer = setInterval(() => {
          console.log("interval ...", seconds);
          if (s == 0) {
            console.log("stop timer...");
            clearInterval(timer);
            recorder.stop();
          } else {
            s--;
            setSeconds(s);
          }
        }, 1000);
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
        <p className="m-2">
          Go To{" "}
          <a className="link link-info" href={`/channel/?name=${channel}`}>
            Share Page
          </a>
        </p>

        <div>
          <button
            className="btn"
            onClick={() => operateRecord()}
            disabled={current != 0}
          >
            {statusTexts[current]}
          </button>

          {current == 1 ? <p>{seconds} Seconds Left!</p> : null}
        </div>

        {result.error != "" ? (
          <p className="error">{result.error}</p>
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
