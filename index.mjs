import axios from "axios";
import Web3 from "web3";
import { WebSocketProvider, Contract } from "ethers";

/**
 * @typedef {Object} Token
 * @property {string} contractId - The contract's unique identifier
 * @property {number} uriNumber - The URI number
 * @property {string} blockchainName - The name of the blockchain
 * @property {string} contractAddress - The contract's address
 * @property {string} contractType - The type of the contract (e.g., "fungible")
 * @property {string} name - The name of the token
 * @property {string} tokenId - The token's unique identifier
 * @property {string} uri - The URI of the token
 * @property {Object} metadata - The metadata associated with the token
 * @property {string} symbol - The symbol of the token
 * @property {number} quantity - The quantity of the token
 */

/**
 * @typedef {Object} WalletBase
 * @property {string} id - The project's unique identifier
 * @property {string} address - The address associated with the project
 * @property {string} projectId - The project's unique identifier
 * @property {string} createdAt - The creation date of the project
 * @property {string} updatedAt - The last update date of the project
 * @property {Token[]} tokens - An array of tokens associated with the project
 */

/**
* Represents a Project object.
* @typedef {Object} CreatedProject
* @property {string} id - The ID of the object.
* @property {string} name - The name of the object.
* @property {Object} blockchain - The blockchain information.
* @property {string} blockchain.name - The name of the blockchain.
* @property {number} blockchain.decimalChainId - The decimal chain ID.
* @property {string} createdAt - The creation date of the object.
* @property {string} updatedAt - The last update date of the object.
* @property {string} apiKey - The API key associated with the object.
*/

/**   
* Parameters to create a project
* @typedef {Object} CreateProjectParams
* @property {string} name - The name of the project.
* @property {'Ethereum' | 'Chiliz' | 'Polygon'} chain - The name of the blockchain.
*/

/**
 * Represents the return data of a custom transaction.
 * @typedef {Object} CustomTransactionReturnData
 * @property {string} id - The ID of the transaction.
 * @property {string} contractId - The ID of the contract.
 * @property {string} status - The status of the transaction.
 * @property {string} transactionHash - The hash of the transaction.
 * @property {string} blockscanUrl - The URL to view the transaction on a block explorer.
 * @property {string} createdAt - The timestamp when the transaction was created.
 * @property {string} updatedAt - The timestamp when the transaction was last updated.
 * @property {string} completedAt - The timestamp when the transaction was completed.
 * @property {Object} metadata - Additional metadata of the transaction.
 * @property {Object[]} metadata.operations - The operations performed in the transaction.
 * @property {string} metadata.operations.functionSignature - The signature of the function called in the transaction.
 * @property {string[]} metadata.operations.argumentsValues - The values of the arguments passed to the function.
 * @property {number} metadata.operations.messageValue - The value of the message.
 * @property {string} type - The type of the transaction.
 */

/**
 * Represents a custom object.
 * @typedef {Object} TransactionReadReturnData
 * @property {string} id - The ID of the object.
 * @property {string} type - The type of the object.
 * @property {string} status - The status of the object.
 * @property {string} transactionHash - The transaction hash of the object.
 * @property {string} scanUrl - The scan URL of the object.
 * @property {string} createdAt - The creation timestamp of the object.
 * @property {string} updatedAt - The update timestamp of the object.
 * @property {string} completedAt - The completion timestamp of the object.
 * @property {Object} metadata - The metadata of the object.
 * @property {string} metadata.uriNumber - The URI number of the object.
 * @property {number} metadata.quantity - The quantity of the object.
 * @property {string} metadata.from - The "from" value of the object.
 * @property {string} metadata.to - The "to" value of the object.
 * @property {Array<Object> | undefined} metadata.operations - The operations of the object.
 * @property {string} metadata.operations.functionSignature - The function signature of the operation.
 * @property {Array<string>} metadata.operations.argumentsValues - The argument values of the operation.
 * @property {number} metadata.operations.messageValue - The message value of the operation.
 * @property {Array | undefined} metadata.tokenIds - The token IDs of the object.
 */

/**
 * Represents a transfer object.
 * @typedef {Object} TransferObject
 * @property {string} id - The unique identifier of the transfer object.
 * @property {string} contractId - The unique identifier of the contract.
 * @property {string} status - The status of the transfer (e.g., "pending").
 * @property {string} transactionHash - The transaction hash associated with the transfer.
 * @property {string} blockscanUrl - The URL to view the transfer on a block explorer.
 * @property {string} createdAt - The creation date of the transfer.
 * @property {string} updatedAt - The last update date of the transfer.
 * @property {string} completedAt - The completion date of the transfer.
 * @property {Object} metadata - Additional metadata associated with the transfer.
 * @property {string} metadata.uriNumber - The URI number.
 * @property {number} metadata.quantity - The quantity of the transfer.
 * @property {string} metadata.from - The sender of the transfer.
 * @property {string} metadata.to - The recipient of the transfer.
 * @property {string} type - The type of the transfer.
 */

/**
 * Represents a transfer object.
 * @typedef {Object} BaseTransferData
 * @property {string} from - The sender's wallet ID.
 * @property {string} to - The recipient's wallet ID.
 * @property {string} contractId - The contract's unique identifier.
 */

/**
 * Represents a transfer nft object
 * @typedef {BaseTransferData} TransferNftData
 * @property {string} tokenId - The token's unique identifier.
 */

/**
 * Represents a transfer tokens object
 * @typedef {BaseTransferData} TransferTokensData
 * @property {Number} quantity - The token's unique identifier.
 */

/**
 * @typedef {WalletBase} WalletTokens
 * @property {Token[]} tokens - An array of tokens associated with the project
 */

export default class LumxAPI extends Web3 {
    /**
     * Lumx instanciate class
     * @param {Object} variablesData
     * @param {string | null} variablesData.bearer - The bearer token to authenticate with Lumx.
     * @param {string | null} variablesData.web3_provider - The web3 provider to interact with the blockchain.
     * @param {string | null} variablesData.web3_wss_provider - The web3 provider to listen to events. 
     * @returns {LumxAPI}
     */
    constructor(data = { bearer: null, web3_provider: null, web3_wss_provider: null }) {
        super(data?.web3_provider)

        this._url = 'https://protocol-sandbox.lumx.io/v2/';
        this.web3_wss_provider = data?.web3_wss_provider;
        this._bearerToken = data?.bearer;
        this._web3Provider = data?.web3_provider;
        this.operationsQueue = [];
        this.customContract = ''
    }

    async #makeRequest({ method, path, data }) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this._bearerToken}`,
        }

        if (method === 'GET') {
            return (await axios.get(this._url + path, { headers })).data
        }

        if (method == 'POST') {
            return (await axios.post(this._url + path, data, { headers })).data
        }
    }

    web3 = {
        /**
         * 
         * @param {Object} readDataOptions
         * @param {string} readDataOptions.contractAddress
         * @param {string} readDataOptions.abi
         * @param {string} readDataOptions.method
         * @param {string[]} readDataOptions.args 
         * @returns {Promise<any>}
         */
        read: async ({ contractAddress, abi, method, args = [] }) => {
            const contract = new this.eth.Contract(abi, contractAddress)

            return await contract.methods[method](...args).call()
        },
        /**
         * 
         * @param {Object} listenToEventOptions - Options to listen to an event
         * @param {string} listenToEventOptions.contractAddress - Contract address
         * @param {string} listenToEventOptions.abi - Contract abi
         * @param {string} listenToEventOptions.event - Event name
         * @param {Function} listenToEventOptions.callback - your function to recive the callbacks, pay atention to the parameters.
         */
        listen: async ({ contractAddress, abi, event, callback }) => {
            const contract = new Contract(contractAddress, abi, new WebSocketProvider(this.web3_wss_provider))

            contract.on(event, callback)
        }
    }

    lumx = {
        project: {
            /**
            * Creates a new project on Lumx.
            * @param {CreateProjectParams} params - The parameters to create a project.
            * @returns {Promise<CreatedProject>} Project object.
            */
            create: async ({ name, chain = 'Ethereum' || 'Chiliz' || 'Polygon' }) => {
                return await this.#makeRequest({
                    method: 'POST',
                    path: 'projects/auth',
                    data: { name, blockchainName: chain }
                });;
            },
        },

        wallets: {
            /**Create a new wallet on Lumx but only retrieves the id and references to it!
             * 
             * @returns {Promise<WalletBase>}
             */
            create: async () => {
                return await this.#makeRequest({
                    method: 'POST',
                    path: 'wallets'
                });
            },
            /**Gets information about an wallet on Lumx with it's tokens information too!
            * 
            * @returns {Promise<WalletTokens>}
            */
            read: async ({ walletId }) => {
                return await this.#makeRequest({
                    method: 'GET',
                    path: `wallets/${walletId}`
                });
            },
            /**Gets information about an wallet on Lumx with it's tokens information too!
            * 
            * @returns {Promise<[WalletBase]>}
            */
            readAllWallets: async () => {
                return await this.#makeRequest({
                    method: 'GET',
                    path: `wallets`
                });
            },
        },

        transactions: {
            /**
            * Transfers a non-fungible token from one wallet to another.
            * @param {TransferNftData} - The data for the transfer.
            * @returns {Promise<TransferObject>} The transfer object.
            */
            transferNft: async ({ contractId, from, to, tokenId }) => {
                return await this.#makeRequest({
                    method: 'POST',
                    path: `transactions/transfers`,
                    data: { from, to, tokenId, contractId }
                });
            },

            /**
            * Transfers a non-fungible token from one wallet to another.
            * @param {TransferTokensData} - The data for the transfer.
            * @returns {Promise<TransferObject>} The transfer object.
            */
            transferTokens: async ({ contractId, from, to, quantity }) => {
                return await this.#makeRequest({
                    method: 'POST',
                    path: `transactions/transfers`,
                    data: { from, to, quantity, contractId }
                });
            },

            /**
            * Waits a transaction to be completed or failed
            * @param {Object} waitTransactionParameters
            * @param {string} waitTransactionParameters.transactionId - The transaction's unique identifier
            * @param {number | 20000} waitTransactionParameters.timeout - Timeout in milisseconds
            * @param {boolean} waitTransactionParameters.log - Log the transaction status
            * @returns {Promise<TransactionReadReturnData>} The transaction object
            */
            readAndWaitTransaction: async ({ transactionId, timeout = 20000, log }) => {
                let attempts = 0

                return new Promise(async (resolve, reject) => {
                    attempts++

                    const _timeout = setTimeout(() => {
                        clearInterval(interval);
                        reject(`Waited for ${timeout / 1000} seconds and the transaction is still pending.`)
                    }, timeout)

                    let timeBetween = 1000

                    const interval = setInterval(async () => {
                        const transaction = await this.#makeRequest({
                            method: 'GET',
                            path: `transactions/${transactionId}`
                        });

                        if (transaction.status !== 'created') {
                            clearInterval(interval);
                            clearTimeout(_timeout);
                            resolve(transaction);
                        } else {
                            if (log) {
                                console.log(`Transaction ${transactionId} is still pending retrying in ${timeBetween / 1000} seconds, status: ${transaction.status}, attempts: ${attempts}`)
                            }
                        }
                    }, timeBetween)

                });
            },

            /**
             * Reads a single transaction from Lumx.
             * @param {string} transactionId - The transaction's unique identifier
             * @returns {Promise<TransactionReadReturnData>}
             */
            readTransaction: async (transactionId) => {
                return await this.#makeRequest({
                    method: 'GET',
                    path: `transactions/${transactionId}`
                });
            },

            /**
             * Gets information about all transactions made in your project.
             * @returns {Promise<[TransactionReadReturnData]>} The transactions made in your project.
             */
            readAllTransactions: async () => {
                return await this.#makeRequest({
                    method: 'GET',
                    path: `transactions`
                });
            },

            /**
            * Execute all the custom operations in the queue and then clear it.
            * @param {Object} TransactionData
            * @param {string} TransactionData.walletId
            * @param {string} TransactionData.contractAddress
            * @returns {Promise<CustomTransactionReturnData>} 
            */
            executeCustomTransaction: async ({ walletId, contractAddress }) => {
                const requestResult = await this.#makeRequest({
                    method: 'POST',
                    path: `transactions/custom`,
                    data: { walletId, contractAddress, operations: this.operationsQueue }
                });

                this.operationsQueue = []
                this.customContract = ''

                return requestResult
            },

            /**
            * Execute all the custom operations in the queue, clear it and then wait for confirmation.
            * @param {Object} TransactionData
            * @param {string} TransactionData.walletId - The wallet id
            * @param {string} TransactionData.contractAddress - The contract address
            * @param {Number} TransactionData.timeout - Timeout in milisseconds of waiting
            * @param {boolean} waitTransactionParameters.log - Log the transaction status
            * @returns {Promise<TransactionReadReturnData>} 
            */
            executeCustomTransactionAndWait: async ({ walletId, contractAddress, timeout, log = false }) => {
                if (log) {
                    console.log(`Executing custom transaction with ${this.operationsQueue.length} operations`)
                }

                const requestResult = await this.#makeRequest({
                    method: 'POST',
                    path: `transactions/custom`,
                    data: { walletId, contractAddress, operations: this.operationsQueue }
                });

                if (log) {
                    console.log(`Transaction created with id ${requestResult.id} output: `)
                    console.log(requestResult)
                }

                this.operationsQueue = []
                this.customContract = ''

                return await this.lumx.transactions.readAndWaitTransaction({ transactionId: requestResult.id, log })
            },

            /**
             * Custom operation values to be executed
             * @param {Object} OperationParameters
             * @param {string} OperationParameters.function - Function name and parameter with types eg: "mint(uint256)"
             * @param {string[]} OperationParameters.parameters - Argumentes and values for the parameters on the functions eg: ["100"]
             * @param {number} OperationParameters.value - Value of chain native tokens to be sent along with the transaction. 
             */
            addOperationToCustomQueue: async (OperationParameters) => {
                this.operationsQueue.push({
                    functionSignature: OperationParameters.function,
                    argumentsValues: OperationParameters.parameters,
                    messageValue: OperationParameters.value || 0
                })
            }
        },
    }
}