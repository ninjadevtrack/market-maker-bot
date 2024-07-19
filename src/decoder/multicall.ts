import { ethers } from "ethers";
import { MULTICALL_ABI } from "../constants/multicall";
import { DecodedData } from "../types/interfaces";
import { Config } from "../config/config";

class DecodeMutical {
    private _multicall: ethers.utils.Interface;
  
    constructor() {
      this._multicall = new ethers.utils.Interface(MULTICALL_ABI);
     }

     public decodeMulticallTransaction = async(
        receipt: any
     ): Promise <DecodedData | undefined >=> {
        try {
        console.log(`\n\n [MULTICALL] : Start decoding multicall transaction`)
        const decodedData = this._multicall.parseTransaction({ data: receipt.data })
        console.log("decodedData", decodedData)
        const txnData = this._multicall.parseTransaction({ data: decodedData.args.data[0] })
        const txn = txnData.args

        console.log("Transaction v3 decoded", txnData)

        if (txn && txnData) {

            const methodName = txnData.name
            const tokenIn = txn.tokenIn
            const tokenOut = txn.tokenOut
            const amountIn = txn.amountIn
            const amountOutMinimum = txn.amountOutMinimum
            const path = { tokenIn, tokenOut }
            let txnType: string;

            console.log("methodName", methodName)
            console.log("tokenIn", tokenIn)
            console.log("tokenOut", tokenOut)
            console.log("amountIn", amountIn)
            console.log("amountIn", amountIn)


            // Check if the transaction was a buy or sell

            if (tokenIn.toLowerCase() == Config.WBNB.toLowerCase()) {
                txnType = "buy"
            } else {
                txnType = "sell"
            }

            const data = {
                methodName,
                txnType,
                path,
                amountIn,
                amountOutMinimum,
                txnMethodName: decodedData.name,
            }

            //TODO: HERE IS WHERE WE WILL HANDLE BUYS AND SELLS LOGIC

            return data
        } else {
            console.log("\n\n\n [ERROR] : Error decoding the multicall transaction ", decodedData, txnData, txn);

        }

            
        } catch (error) {
            console.log("Unable to decode multicall txn", error)
        }

    }

}

export const DecodeMulticallHelper = new DecodeMutical()