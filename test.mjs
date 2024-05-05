import LumxAPI from "./index.mjs";
import dotenv from 'dotenv';
import abi from './abis/abi.json' assert { type: "json" };

dotenv.config();

const { BEARER, WEB3_PROVIDER, WEB3_WSS_PROVIDER } = process.env

const lumx = new LumxAPI({
    bearer: BEARER,
    web3_provider: WEB3_PROVIDER, //note that the provider needs to be on the same chain as the contract,
    web3_wss_provider: WEB3_WSS_PROVIDER
});

lumx.lumx.transactions.addOperationToCustomQueue({
    function: "teste(uint16 _a)",
    parameters: [1],
});

//our custom module will create the tx and wait for the confirmation
lumx.lumx.transactions
    .executeCustomTransactionAndWait({
        contractAddress: "0x9Baf02772de058aFAe32c7607288af7ed45B8224",
        walletId: (await lumx.lumx.wallets.create()).id, //we create the wallet inside here
        timeout: 30000, //optional default is 20000
        log: true, //optional to see the progress of the txn
    })
    .then((result) => {
        if (result.status == "success") {
            console.log("Transaction mined");
        } else {
            console.log("Transaction failed");
        }
    })
    .catch((error) => {
        //will fail if the transaction is not mined in 30 seconds or any other expection occurs
        console.error(error);
    });