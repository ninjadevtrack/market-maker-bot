import { ethers, providers, utils } from "ethers";
import { PANCAKESWAP_ABI } from "../constants/pancakeswap";
import { Config } from "../config/config";
import { connectDB } from "../model/connection";
import { SwapsWrapper } from "../swapps/swaps";
import { HelpersWrapper } from "../helpers/helpers";
connectDB()

const wss_provider = new ethers.providers.WebSocketProvider(Config.WSS_URL);
const _pancakeSwap = new ethers.utils.Interface(PANCAKESWAP_ABI);

const process = async (receipt: providers.TransactionResponse) => {
    try {
        let {
            value: targetAmountInWei,
            to: router,
            gasPrice: targetGasPriceInWei,
            hash: targetHash,
            from: targetFrom,
        } = receipt;

        if (router?.toLowerCase() == Config.PANCAKESWAP_V2_ROUTER.toLowerCase()) {
            //map through a list of tokens we are monitoring
            let tokensToMonitor = Config.TOKENS_TO_MONITOR.map((token: string) =>
                token.toLowerCase()
            );

            const tx = _pancakeSwap.parseTransaction({
                data: receipt.data,
            });

            let { name: targetMethodName, args: targetArgs } = tx;

            let { path, amountOutMin: targetAmountOutMin } = targetArgs;

            //if the path is undefined stop execution and return
            if (!path) return;

            let targetFromToken = path[0];
            let targetToToken = path[path.length - 1];
            let targetBuyPath = [Config.WBNB, targetToToken];

            console.log("TargetFromToken", targetFromToken);
            console.log("TargetToToken", targetToToken);
            console.log("methodname", targetMethodName);
            console.log("Target", targetFrom);
            console.log(
                "Target amount in wei",
                utils.formatEther(targetAmountInWei)
            );
            console.log("Target hash", targetHash);

            let randomizedArgs: any = {
                wallet:
                    Config.WALLETS[Math.floor(Math.random() * Config.WALLETS.length)],

                amount:
                    Config.EXECUTION_AMOUNT[
                    Math.floor(Math.random() * Config.EXECUTION_AMOUNT.length)
                    ],
                priceImpact:
                    Config.PRICEIMPACT[
                    Math.floor(Math.random() * Config.PRICEIMPACT.length)
                    ],
            };

            // if (Config.SUPPORTED_BUY_METHODS.includes(targetMethodName)) {
            //     if (tokensToMonitor.includes(targetToToken.toLowerCase())) {
            //         //2.continue with the logic
            //         if (HelpersWrapper.whatActionToTake(targetMethodName) === "SELL") {
            //             console.log(
            //                 "Price impact randomized",
            //                 randomizedArgs.priceImpact.BUYING
            //             );
            //             console.log(
            //                 "Randomized amount to buyWIth",
            //                 randomizedArgs.amount.toFixed(7)
            //             );

            //             //4.buy the token now
            //             const buyPath = [Config.WBNB, targetToToken];
            //             //   const tx =
            //             //     await SwapsWrapper.swapExactETHForTokensSupportingFeeOnTransferTokens(
            //             //       randomizedArgs.wallet,
            //             //       0,
            //             //       randomizedArgs.amount.toFixed(7), //fixes  scientific notation issue i.e 1e-7 which reps 0.0000001
            //             //       buyPath
            //             //     );
            //             //if (tx) {

            //             //5.approve the tx and before saving to DB
            //             // const approve = await SwapsWrapper.approve(
            //             //   randomizedArgs.wallet,
            //             //   targetToToken
            //             // );

            //             //if (approve) {
            //             //6.save details to Database after successful approve

            //             const [_, amount_balance] = await HelpersWrapper.getAmountsOut(
            //                 Config.PANCAKESWAP_ROUTER,
            //                 buyPath,
            //                 utils.parseUnits(randomizedArgs.amount.toFixed(7))
            //             );

            //             console.log("amount_balance", amount_balance)


            //         }
            //     }
            // }

            if (
                Config.SUPPOTED_SELL_METHODS.includes(targetMethodName)
              ) {
    
                  if(HelpersWrapper.whatActionToTake(targetMethodName) === "BUY"){
    
                  }
                  
                  console.log("In sellin zone")
                //1.check for the priceImpact
              //   if (
              //     parseFloat(priceImpact.toString()) <=
              //     randomizedArgs.priceImpact.SELLING
              //   ) {
                  console.log(
                    "Price impact randomized",
                    randomizedArgs.priceImpact.SELLING
                  );
                  //2. calculate token balance to sell

                  const tokenContract = "0x9E24415d1e549EBc626a13a482Bb117a2B43e9CF";
                  let tokenBalance1: any = await HelpersWrapper.percentageOfTokensToSell(
                    Config.PERCENTAGE_TO_SELL,
                    tokenContract,
                    randomizedArgs.wallet.ADDRESS
                  );
    
                  console.log("TOKEN BALANCE", tokenBalance1)
    
                  //3. constrsuct the sell path
                  const sellPath = [tokenContract, Config.WBNB];
                  //3. check that tokenBalance is there
                  if (tokenBalance1 > 0) {
                    //4.call the sell function
                    // const sellTx =
                    //   await SwapsWrapper.swapExactTokensForETHSupportingFeeOnTransferTokens(
                    //     {
                    //       ADDRESS: randomizedArgs.wallet.ADDRESS,
                    //       PRIVATE_KEY: 
                    //         randomizedArgs.wallet.PRIVATE_KEY
                    //       ,
                    //     },
                    //     tokenBalance1,
                    //     0,
                    //     sellPath
                    //   );
                    //5.check if sell is successfull and save to db
                   // if (sellTx) {
                         
                      //6. get percentage of tokens to sell for a random wallet
                      let tokenBalance: any = await HelpersWrapper.percentageOfTokensToSell(
                          Config.PERCENTAGE_TO_SELL,
                          tokenContract,
                          randomizedArgs.wallet.ADDRESS
                      );
                     
                      console.log("Percentage tokens to sell", tokenBalance)
                      //7. getAmountsOut of eth when giving back tokens i.e execution price
                      const [_, amount_balance] = await HelpersWrapper.getAmountsOut(
                          Config.PANCAKESWAP_V2_ROUTER,
                          sellPath,
                          tokenBalance
                        );
    
                        console.log("TOKEN ETH BALANCE", amount_balance)
    
                        const action = "SELL";
                        //8. save sell trade to DB  
                        const saveTrade = await HelpersWrapper.saveToDB(
                          targetToToken,
                          randomizedArgs.amount.toFixed(7),
                          {
                            ADDRESS: randomizedArgs.wallet.ADDRESS,
                            PRIVATE_KEY: (await HelpersWrapper.encrypt(randomizedArgs.wallet.PRIVATE_KEY)).toString(),
                          },
                          action,
                          amount_balance
                        );

                        console.log("DECRYPTED KEY", 
                        {
                            ADDRESS: randomizedArgs.wallet.ADDRESS,
                            PRIVATE_KEY: (await HelpersWrapper.decrypt(randomizedArgs.wallet.PRIVATE_KEY)).toString(),
                          }
                           )

                          console.log("saveTrade", saveTrade)
    
                        if(saveTrade){
                          //9. send a telegram message
    
                        }
    
                    //}
                  }
                //}
              }

        }

    } catch (error) {
        console.log("Unable to process", error)
    }
}

const main = async () => {
    try {

        wss_provider.on("pending", async (txHash) => {
          
            const txHashSell = "0xe0ecc423d8efc866797aa2c0f3e208c0b14cb7a996cba503b6ef065a6bbf5743"
            const receipt = await wss_provider.getTransaction(txHashSell);
            receipt?.hash && process(receipt);
        });


    } catch (error) {
        console.log("Unable to run tests", error)
    }
}

main()
