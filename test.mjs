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

const contractAddress = "0x575024ABDFbFFd79c2A77F8A2107F6b81F684CA3" //your contract address into the desired chain, this is on Amoy

function eventListener(a, b) {
    console.log(a, b)
}

lumx.web3.listen({
    contractAddress,
    abi,
    event: "TestEvent",
    callback: eventListener
})