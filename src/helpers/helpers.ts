import { BigNumber, Contract, Wallet, ethers, providers } from "ethers";
import { Config } from "../config/config";
import { Trade } from "../model/trade";

class Helpers {
    private _provider: providers.JsonRpcProvider;

    constructor() {
        this._provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC_URL);
    }

    /**
     *
     * @param account of the account to sign transactions
     * @returns the account object to sign transaction
     */
    private getAccount = (account: string) => {
        return new ethers.Wallet(account, this._provider).connect(this._provider);
    };

    /**
     *
     * @param tokenAddress to get the balanceOf
     * @returns
     */
    public getERC20TokenContract = async (tokenAddress: string, account: string) => {
        try {
            return new ethers.Contract(
                tokenAddress,
                ["function balanceOf(address account) public view returns(uint256)"],
                this._provider
            );
            
        } catch (error) {
            console.log("Unable to getERC20TokenContract", error);
        }
    };

    /**
     *
     * @param walletAddress the public address to check for the nonce
     * @returns nonce of the public address
     */
    public getWalletNonce = async (walletAddress: string) => {
        try {
            return await this._provider.getTransactionCount(walletAddress);
        } catch (error) {
            console.log("Error getting wallet Nonce", error);
        }
    };

    /**
     *
     * @param tokenA - address of tokenA
     * @param tokenB - address of tokenB
     * @returns - pair address
     */
    public getTokenPair = async (tokenA: string, tokenB: string) => {
        try {
            const contract = new ethers.Contract(
                Config.PAIR_FACTORY_BSC,
                [
                    `function getPair(address tokenA, address tokenB) external view returns (address pair)`,
                ],
                new Wallet(process.env.PRIVATE_KEY_1!, this._provider)
            );

            return contract.getPair(tokenA, tokenB);
        } catch (error) {
            console.log("Unable to get pair", error);
        }
    };

    /**
     *
     * @param pairAddress - address of the pair
     * @param path -path includes targetFrom token and targetTo token
     * @returns the reserves of targetFrom token
     */

    public getBNBReserves = async (pairAddress: string, path: string[]) => {
        try {
            const contract = new ethers.Contract(
                Config.RESERVES_CHECK_CONTRACT_ADDRESS,
                [
                    `function getBNBReserves(address pairAddress, address[] path) external view returns(uint112)`,
                ],
                new Wallet(process.env.PRIVATE_KEY_1!, this._provider)
            );

            return contract.getBNBReserves(pairAddress, path);
        } catch (error) {
            console.log("Unable to get reserves", error);
        }
    };

    /**
     * 
     * @param account we are getting token balance for
     * @param tokenAddress to check balance of token
     * @returns 
     */

    public getTokenBalanceOfWallet = async (
        tokenAddress: string,
        account: string
    ) => {
        try {
           // const wallet = this.getAccount(account);
            const tokenContract = await this.getERC20TokenContract(tokenAddress, account);
            return  tokenContract!.balanceOf(account)
            
        } catch (error) {
            console.log("Unable to getTokenBalanceOfWallet", error);
        }
    };


    /**
     * 
     * @param percentage of the tokens to sell 
     * @param tokenAddress of the token contract
     * @param account of doing the percentage of token contract
     * @returns 
     */
    public percentageOfTokensToSell = async (
        percentage: number,
        tokenAddress: string,
        account: string) => {
        try {
            // const wallet: any = this.getAccount(account);
            console.log("we got here")
            let tokens: any = await this.getTokenBalanceOfWallet(tokenAddress, account)
            console.log("Found some tokens", tokens)
            const pToSell = Math.trunc(tokens * (percentage / 100))
            console.log("PERCENTAGE TOKENS", pToSell)
            return pToSell

        } catch (error) {
            console.log("Unable to getPercentageOfTokensToSell ", error)
        }
    }

    /**
     * 
     * @param value to encrypt
     * @returns encrypted value
     */
    public encrypt = async (value: string) => {
        let buffer = Buffer.from(value, "utf8");
        return buffer.toString("base64")
    }

    /**
     * 
     * @param value to decrypt
     * @returns decrypted value
     */
    public decrypt = async (value: string) => {
        let buffer = Buffer.from(value, "base64");
        return buffer.toString("utf8");
    }


    /**
     * 
     * @param token 
     * @param value 
     * @param wallet 
     * @param amount_balance 
     */
    public saveToDB = async (
        token: string,
        value: number,
        wallet: {
            ADDRESS: string,
            PRIVATE_KEY: string
        },
        action: string,
        amount_balance: any
    ) => {
        try {
          const trade = await Trade.build({
                token,
                wallet,
                action,
                value,
                amount_balance
            }).save()

            return trade;

        } catch (error) {
            console.log("Unable to save to DB ", error)
        }

    }
 

    /**
     * 
     * @param router 
     * @param path 
     * @param amountIn 
     * @returns 
     */
    public getAmountsOut = async (
        router: string,
        path: string[],
        amountIn: BigNumber,
    ) => {
        try {

            let contract = new Contract(
                router,
                [
                    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
                ],
                this._provider
            )

            return contract.getAmountsOut(amountIn, path)

        } catch (error) {
            console.log("Unable to getAmountsOut", error)
        }

    }
  
    /**
     * 
     * @param method 
     * @returns 
     */
    public whatActionToTake = (method: any) => {
        let action = "NOACTION"
        if (method == Config.SUPPORTED_BUY_METHODS) {
            action = "SELL"

        } else if (method == Config.SUPPOTED_SELL_METHODS) {
            action = "BUY"
        }

        return action;
    }

}

export const HelpersWrapper = new Helpers();
