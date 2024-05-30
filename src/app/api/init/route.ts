import { ethers } from "ethers";

const getRpc = () => {
  return new ethers.JsonRpcProvider(process.env.rpc);
};

export const POST = async (req: Request) => {
  const wallet = new ethers.Wallet(process.env.privateKey as string);
  const conn = getRpc();
  const balance = await conn.getBalance(wallet.address);
  const result = {
    now: new Date().toString(),
    contract: process.env.flat_contract,
    address: wallet.address,
    balance: ethers.formatUnits(balance),
  };

  return Response.json(result);
};
