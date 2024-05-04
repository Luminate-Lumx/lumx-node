## 📦 Installing on command line (requires nodejs)

`yarn add lumx-node`

or

`npm i lumx-node`

## 👷 Usage

> Used for abstracting the lumx api and run faster and optimized requests

🌟 Check the [official documentation](https://docs.lumx.io/api-reference/v2/projects/create-a-project) for more details

## 🔎 Getting a lumx API key

Simple as that we just access the project methods object and call create with name and the desired chain

```js
import LumxApi from "lumx-node";

const lumx = LumxApi.config({}); //leave it empty since you're doing your first interaction

const { apiKey } = await lumx.project.create({
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

# 📞 Caliing methods

The methods from transactions and projects are covered [here](https://docs.lumx.io/api-reference/v2/transactions/mint-tokens)

## 💳 Creating a lumx wallet

> Will not cover everything here, feel free to explore we just displaying the top methods for quick onboarding

```mjs
import LumxApi from "lumx-node";

import dotenv from "dotenv";
dotenv.config();

const { bearer } = process.env;

const lumx = LumxApi.config({ bearer });

const wallet = await lumx.wallets.create();
```

## 📨 Transactions

> Will focus on the custom one for focus

```mjs
import LumxApi from "lumx-node";

import dotenv from "dotenv";
dotenv.config();

const { bearer } = process.env;

const lumx = LumxApi.config({ bearer });

//first make the operations you want when accessing contracts

lumx.transactions.addOperationToCustomQueue({
  function: "teste(uint16 _a)",
  parameters: [1],
});

//our custom module will create the tx and wait for the confirmation
lumx.transactions
  .executeCustomTransactionAndWait({
    contractAddress: "0x9Baf02772de058aFAe32c7607288af7ed45B8224",
    walletId: (await lumx.wallets.create()).id, //we create the wallet inside here
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
