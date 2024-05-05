<h1 align="center">
  NodeJS client for Lumx API
</h1>

<div align="center">
<image src="https://uploaddeimagens.com.br/images/004/729/622/original/Logo_01_copiar.png?1706822699">
</div>

## 📦 Installing on command line (requires nodejs)

`yarn add lumx-node`

or

`npm i lumx-node`

## 👷 Usage

> Used for abstracting the lumx api and run faster and optimized requests

🌟 Check the [official documentation](https://docs.lumx.io/api-reference/v2/projects/create-a-project) for more and updated details

## 🔎 Getting a lumx API key

Simple as that we just access the project methods object and call create with name and the desired chain

```js
import LumxApi from "lumx-node";

const lumx = new LumxApi(); //leave it empty since you're doing your first interaction   

const { apiKey } = await lumx.lumx.project.create({
  name: "My Project", //Your project's name
  chain: "Ethereum", //Select one chain from the chain list ctrl + space
});

console.log(apiKey); //logs the key on terminal
```

First things first we are picking this apiKey and setting the environment

`.env`

```
bearer=<your_lumx_api_key>
```

`Don't forget to install dotenv > yarn add dotenv | npm i dotenv`

# 📞 Calling methods

The methods from transactions and projects are covered [here](https://docs.lumx.io/api-reference/v2/transactions/mint-tokens)

Down below you will find some of the abstractions made on top of LumxApi

## 💳 Creating a lumx wallet

> Will not cover everything here, feel free to explore we just displaying the top methods for quick onboarding

```mjs
import LumxApi from "lumx-node";

import dotenv from "dotenv";
dotenv.config();

const { BEARER: bearer } = process.env;

const lumx = new LumxApi({ bearer });

const wallet = await lumx.lumx.wallets.create();
//note that lumx is accessed under the variable since lumx class extends web3 so we have it for convention for easily seeing what is covered up
```

## ✍️ Writing Transactions

> Will focus on the custom one for focus

```mjs
import LumxApi from "lumx-node";

import dotenv from "dotenv";
dotenv.config();

const { BEARER: bearer } = process.env;

const lumx = new LumxApi({ bearer });

//first make the operations you want when accessing contracts

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
```

## 📖 Read-only contract functions

Since currently Lumx Doesn't support retrieving data from read-only functions we simply use a read function made with web3, here you will need the ABI from the contract you want to call a web3 provider wich you can easily find on [ChainList](https://chainlist.org/)
```mjs
import LumxAPI from "lumx-node";
import dotenv from 'dotenv';
import abi from './abis/abi.json' assert { type: "json" };
//replace this abi path to your abi path!

dotenv.config();

const { BEARER, WEB3_PROVIDER } = process.env

const lumx = new LumxAPI({
    bearer: BEARER,
    web3_provider: WEB3_PROVIDER //note that the provider needs to be on the same chain as the contract
});

const contractAddress = "0xFD7676e52e24aF5162348Af59Ba93297beBEC50b" //your contract address into the desired chain, this is on Amoy

const data = await lumx.web3.read({
    contractAddress,
    abi,
    method: 'teste()', //just the method you want to call
    args: [] //optional args for the contract if required
})

console.log(data)
```

# 🦻 Listening to events
For some custom contracts you may want to listen to a specific event in order to have faster responses or saving data.

```js
import LumxAPI from "./index.mjs";
import dotenv from 'dotenv';
import abi from './abis/abi.json' assert { type: "json" };
//replace this path with your abi path

dotenv.config();

const { BEARER, WEB3_PROVIDER, WEB3_WSS_PROVIDER } = process.env

const lumx = new LumxAPI({
    bearer: BEARER,
    web3_provider: WEB3_PROVIDER, //note that the provider needs to be on the same chain as the contract,
    web3_wss_provider: WEB3_WSS_PROVIDER
});

const contractAddress = "0x575024ABDFbFFd79c2A77F8A2107F6b81F684CA3" //your contract address into the desired chain, this is on Amoy

//create an event listener function to recive the data from the events
function eventListener(a, b) {
    console.log(a, b)
}

//parameters for listening to your contract events
lumx.web3.listen({
    contractAddress,
    abi,
    event: "TestEvent", //just the event name
    callback: eventListener
})
```