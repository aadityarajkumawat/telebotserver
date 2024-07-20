"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ton_access_1 = require("@orbs-network/ton-access");
const crypto_1 = require("@ton/crypto");
const ton_1 = require("@ton/ton");
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
    const mnemonic = "young coffee rookie raw catch layer chef artist wife school try camera note text option minute magic urban admit famous frozen fee pony weasel";
    const key = await (0, crypto_1.mnemonicToWalletKey)(mnemonic.split(" "));
    const wallet = ton_1.WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
    });
    const endpoint = await (0, ton_access_1.getHttpEndpoint)({ network: "testnet" });
    const client = new ton_1.TonClient({ endpoint });
    if (!(await client.isContractDeployed(wallet.address))) {
        return console.log("wallet is not deployed");
    }
    const balance = await client.getBalance(wallet.address);
    console.log("balance:", (0, ton_1.fromNano)(balance));
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            (0, ton_1.internal)({
                to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
                value: "0.01",
                body: "Hello",
                bounce: false,
            }),
        ],
    });
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}
main();
//# sourceMappingURL=ton.js.map