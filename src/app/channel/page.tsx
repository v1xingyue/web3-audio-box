"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Hello = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("name")) {
      console.log("channel empty!!!");
    }
  }, [searchParams]);

  const query = useQuery({
    queryKey: ["audioList"],
    queryFn: async () => {
      const channel = searchParams.get("name");
      const url = `https://0xbe3EEe31e274aabf33F455D5b29Cc96329FC39eb.3333.w3link.io/${channel}/list.json`;
      console.log(url);
      const resp = await fetch(url);
      const items: any[] = await resp.json();
      return {
        items,
      };
    },
  });

  return (
    <>
      <h1>Hello channel audio list :</h1>
      {JSON.stringify(query.data)}
    </>
  );
};

export default Hello;
