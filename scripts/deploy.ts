import {
    Cell,
    StateInit,
    beginCell,
    contractAddress,
    storeStateInit,
    toNano
} from "ton-core";
import { hex } from "../build/main.compiled.json"
import QueryString from "qs";
import qrcode from "qrcode-terminal"

import dotenv from "dotenv";
dotenv.config();

async function deployScript() {
    console.log(
        "==============================================================="
    );
    console.log("Deploy script is running, let's deploy our main.fc contract...")

    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const dataCell = new Cell();

    const stateInit: StateInit = {
        code: codeCell,
        data: dataCell,
    }



    const stateInitBuilder = beginCell();
    storeStateInit(stateInit)(stateInitBuilder);
    const stateInitCell = stateInitBuilder.endCell();

    /*  // const stateInitCell = stateInitBuilder.endCell(); 
        // as same as 
        const stateInitCell = beginCell()
            .storeBit(false)    // split_depth - Parameter for the highload contracts, defines behaviour of split
            .storeBit(false)    // special - Used for invoking smart contracts in every new block of the boockchain
            .storeMaybeRef(codeCell)    // code - Contract's serialized code.
            .storeMaybeRef(dataCell)    // data - Contract initial data.
            .storeUint(0,1)     // library - Currently used StatInit without libs
            .endCell();
    */

    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell
    })

    console.log(
        `The address of the contract is following: ${address.toString()}`
    );
    console.log(`Please scan the QR code below to deploy the contract to ${process.env.TESTNET ? "testnet" : "mainnet"}:`);

    let link =
        `https://${process.env.TESTNET ? "test." : ""}tonhub.com/transfer/` +
        address.toString({
            testOnly: process.env.TESTNET ? true: false,
        }) +
        "?" +
        QueryString.stringify({
            text: "Deploy contract",
            amount: toNano("0.05").toString(10),
            init: stateInitCell.toBoc({ idx: false }).toString("base64"),
        });

    qrcode.generate(link, { small: true }, (code) => {
        console.log(code);
    });

}

deployScript(); 