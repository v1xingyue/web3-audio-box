import { ethers } from "ethers";
import { EthStorageBrowser as Ethstorage } from "ethstorage-sdk-ts";

const getRpc = () => {
  return new ethers.JsonRpcProvider(process.env.rpc);
};

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const audio = formData.get("audio") as Blob;
  const path = formData.get("path") as string;
  console.log(audio.type);

  const wallet = new ethers.Wallet(process.env.privateKey as string);
  const conn = getRpc();
  const balance = await conn.getBalance(wallet.address);

  const arrayBuffer = await audio.arrayBuffer();
  console.log(arrayBuffer);

  const storage = new Ethstorage(
    process.env.rpc as string,
    process.env.privateKey,
    process.env.flat_contract
  );

  const result = {
    now: new Date().toString(),
    contract: process.env.flat_contract,
    address: wallet.address,
    message: "",
    error: "",
    balance: ethers.formatUnits(balance),
    path,
  };

  try {
    const result = await storage
      .uploadData("test.webpm", Buffer.from(arrayBuffer))
      .catch((err: any) => {
        console.log("upload error : ", err);
      });
    console.log("result:", result);
  } catch (error: any) {
    result.error = error;
  }

  return Response.json(result);
};
