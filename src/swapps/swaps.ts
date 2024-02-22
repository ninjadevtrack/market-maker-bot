import { Contract, ethers, providers } from "ethers";
import { Config } from "../config/config";
import { toHex } from 'viem'
import { PANCAKESWAP_ABI } from "../constants/pancakeswap";
import { HelpersWrapper } from "../helpers/helpers";

class Swaps {
    private _provider: providers.JsonRpcProvider;
    constructor() {
        // initialize some variables i.e provider, signers
        this._provider = new providers.JsonRpcProvider(Config.JSON_RPC_URL);
    }


    private pancakeSwapContract = (signer: any) => {
        return new Contract(Config.PANCAKESWAP_V2_ROUTER, PANCAKESWAP_ABI, signer);
    }

    private approveContract = async (privateKey: any, tokenAddress: string) => {

        const account = new ethers.Wallet(
            privateKey,
            this._provider
        ).connect(this._provider);

        return new Contract(
            tokenAddress,
            ["function approve(address _spender, uint256 _value) public returns (bool success)"],
            account
        )
    }


    public swapExactETHForTokensSupportingFeeOnTransferTokens = async (
        wallet: { ADDRESS: string, PRIVATE_KEY: string },
        amountOutMin: number,
        ethAmount: number,
        path: Array<string>,
    ) => {
        try {


            // Wallet Account
            const account = new ethers.Wallet(
                wallet.PRIVATE_KEY,
                this._provider
            ).connect(this._provider);


            const swapContract = this.pancakeSwapContract(account);

            let value = ethers.utils.parseUnits(ethAmount.toString(), 'ether');

            console.log("The Value is here", value)

            const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
            const nonce = await HelpersWrapper.getWalletNonce(wallet.ADDRESS);

            const transaction = await swapContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
                toHex(amountOutMin),
                path,
                wallet.ADDRESS,
                deadline,
                {
                    nonce,
                    value: value
                }
            )

            console.log("Tx Hash", transaction)

            console.log("Transaction hash: ", `https://bscscan.com/tx/${transaction.hash}`);
            return { success: true, data: `${transaction.hash}` };

        } catch (error) {
            console.log("swapExactETHForTokensSupportingFeeOnTransferTokens:  ====> ", error);
            return { success: false, data: `${error}` };
        }
    }

    public swapExactTokensForETHSupportingFeeOnTransferTokens = async (
        wallet: { ADDRESS: string, PRIVATE_KEY: string },
        amountIn: number,
        amountOutMin: number,
        path: Array<string>,
    ) => {
        try {

            // Wallet Account
            const account = new ethers.Wallet(
                wallet.PRIVATE_KEY,
                this._provider
            ).connect(this._provider);

            const swapContract = this.pancakeSwapContract(account);
            const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
            const nonce = await HelpersWrapper.getWalletNonce(wallet.ADDRESS);

            const transaction = await swapContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
                toHex(amountIn),
                toHex(amountOutMin),
                path,
                wallet.ADDRESS,
                deadline,
                {
                    nonce,
                }
            )

            console.log("Transaction hash: ", `https://bscscan.com/tx/${transaction.hash}`);
            return { success: true, data: `${transaction.hash}` };

        } catch (error) {
            console.log("swapExactTokensForETHSupportingFeeOnTransferTokens:  ====> ", error);
            return { success: false, data: `${error}` };
        }
    }

    public approve = async (wallet: { ADDRESS: string, PRIVATE_KEY: any },
        tokenAddress: string
    ) => {

        try {
            const MAX_INT = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
            const nonce = await HelpersWrapper.getWalletNonce(wallet.ADDRESS)
            const contract = await this.approveContract(wallet.PRIVATE_KEY, tokenAddress)
            const transaction = await contract.approve(
                Config.PANCAKESWAP_V2_ROUTER,
                MAX_INT, {
                nonce: nonce! + 1
            }
            )

            console.log("**".repeat(20));
            console.log("******APPROVE TRANSACTION********", transaction.hash)
            return { success: true, data: `${transaction.hash}` };

        } catch (error) {
            console.log("Approve Transaction Failed", error)
            return { success: false, data: `${error}` }
        }

    }


}

export const SwapsWrapper = new Swaps()