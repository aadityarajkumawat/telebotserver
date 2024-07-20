import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { fromNano, internal, TonClient, WalletContractV4 } from "@ton/ton";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // open wallet v4 (notice the correct wallet version here)
  const mnemonic =
    "young coffee rookie raw catch layer chef artist wife school try camera note text option minute magic urban admit famous frozen fee pony weasel";
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  // make sure wallet is deployed
  if (!(await client.isContractDeployed(wallet.address))) {
    return console.log("wallet is not deployed");
  }

  // query balance from chain
  const balance = await client.getBalance(wallet.address);
  console.log("balance:", fromNano(balance));

  // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    seqno: seqno,
    messages: [
      internal({
        to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
        value: "0.01", // 0.05 TON
        body: "Hello", // optional comment
        bounce: false,
      }),
    ],
  });

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

main();
