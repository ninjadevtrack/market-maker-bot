import { ethers, providers, utils } from "ethers";
import { Config } from "../config/config";
import { PANCAKESWAP_ABI } from "../constants/pancakeswap";
import { HelpersWrapper } from "../helpers/helpers";
import { SwapsWrapper } from "../swapps/swaps";
import { MessagesWrapper } from "../telegram/messages";
import { TGWrapper } from "../telegram/bot";

class Mempool {
  private wss_provider: providers.WebSocketProvider;
  private _pancakeSwap: ethers.utils.Interface;

  constructor() {
    this.wss_provider = new ethers.providers.WebSocketProvider(Config.WSS_URL);
    this._pancakeSwap = new ethers.utils.Interface(PANCAKESWAP_ABI);
  }

  public monitor = async () => {
    try {
      this.wss_provider.on("pending", async (txHash: any) => {
        const receipt = await this.wss_provider.getTransaction(txHash);
        receipt?.hash && this.process(receipt);
      });
    } catch (error) {
      console.log("Error while streaming transaction", error);
    }
  };

  public process = async (receipt: providers.TransactionResponse) => {
    let {
      value: targetAmountInWei,
      to: router,
      hash: targetHash,
      from: targetFrom,
    } = receipt;

    if (router?.toLowerCase() == Config.PANCAKESWAP_V2_ROUTER.toLowerCase()) {
      //Exclude all transfers
      if (!Config.METHODS_EXCLUDED.includes(receipt.data)) {
        //map through a list of tokens we are monitoring lowercasing
        let tokensToMonitor = Config.TOKENS_TO_MONITOR.map((token: string) =>
          token.toLowerCase()
        );

        try {
          //decode tx data for v2
          let decodedData = this._pancakeSwap.parseTransaction({
            data: receipt.data,
          });

          let { name: targetMethodName, args: targetArgs } = decodedData;

          let { path } = targetArgs;

          //if the path is undefined stop execution and return
          if (!path) return;

          let targetFromToken = path[0];
          let targetToToken = path[path.length - 1];
          let targetBuyPath = [Config.WBNB, targetToToken];

          //amount of BNB target is using (amountIn)
          let targetBNB = parseFloat(utils.formatEther(targetAmountInWei));
          //get the pair
          // let pair = await HelpersWrapper.getTokenPair(
          //   targetFromToken,
          //   targetToToken
          // );

          console.log("TargetFromToken", targetFromToken);
          console.log("TargetToToken", targetToToken);
          console.log("methodname", targetMethodName);
          console.log("Target", targetFrom);
          console.log(
            "Target amount in wei",
            utils.formatEther(targetAmountInWei)
          );
          console.log("Target hash", targetHash);
          // console.log("PAIR Address", pair)

          //TODO NOW REDO THIS FOR WETH TO GET PRICE IMPACT
          //wbnbReserves to add to the pool
          // const wbnbReserves = await HelpersWrapper.getBNBReserves(
          //   pair,
          //   targetBuyPath
          // );

          // //calculate new bnbResrvess of the pool
          // const newReserves =
          //   targetBNB + parseFloat(utils.formatEther(wbnbReserves));
          // //calculate the price impact
          // const priceImpact: any = (targetBNB / newReserves) * 100;

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

          //1.check that the methodname includes one of our supprted methods
          if (Config.SUPPORTED_BUY_METHODS.includes(targetMethodName)) {
            if (tokensToMonitor.includes(targetToToken.toLowerCase())) {
              //2.continue with the logic
              if (
                HelpersWrapper.whatActionToTake(targetMethodName) === "SELL"
              ) {
                //3.check for the priceImpact
                //   if (
                //     parseFloat(priceImpact.toString()) <=
                //     randomizedArgs.priceImpact.BUYING
                //   ) {

                console.log(
                  "*****************$$ IN THE BUYING ZONE &&************************"
                );

                console.log(
                  "Randomized amount to buyWIth",
                  randomizedArgs.amount.toFixed(7)
                );

                //4.buy the token now
                const buyPath = [Config.WBNB, targetToToken];
                let buyTx: any =
                  await SwapsWrapper.swapExactETHForTokensSupportingFeeOnTransferTokens(
                    randomizedArgs.wallet,
                    0,
                    randomizedArgs.amount.toFixed(7), //fixes  scientific notation issue i.e 1e-7 which reps 0.0000001
                    buyPath
                  );
                if (buyTx.success == true) {
                  //5.approve the tx and before saving to DB
                  const approve = await SwapsWrapper.approve(
                    randomizedArgs.wallet,
                    targetToToken
                  );
                  //send  a successful Buy transaction message
                  const message = MessagesWrapper.SuccessfulBuyMessage(
                    targetToToken,
                    buyTx
                  );
                  await TGWrapper.sendNotification(message);

                  if (approve) {
                    //6.save details to Database after successful approve

                    const [_, amount_balance] =
                      await HelpersWrapper.getAmountsOut(
                        Config.PANCAKESWAP_V2_ROUTER,
                        buyPath,
                        utils.parseUnits(randomizedArgs.amount.toFixed(7))
                      );

                    const action = "BUY";
                    const saveTrade = await HelpersWrapper.saveToDB(
                      targetToToken,
                      randomizedArgs.amount.toFixed(7),
                      {
                        ADDRESS: randomizedArgs.wallet.ADDRESS,
                        PRIVATE_KEY: (
                          await HelpersWrapper.encrypt(
                            randomizedArgs.wallet.PRIVATE_KEY
                          )
                        ).toString(),
                      },
                      action,
                      amount_balance
                    );

                    if (saveTrade) {
                      //TODO  send a telegram message
                      const message =
                        MessagesWrapper.unSuccessfulApproval(targetToToken);
                      await TGWrapper.sendNotification(message);
                    }
                  } else {
                    const message =
                      MessagesWrapper.unSuccessfulApproval(targetToToken);
                    await TGWrapper.sendNotification(message);
                  }
                } else {
                  //TODO SEND the unsccessful buy Messages
                  const message =
                    MessagesWrapper.unSuccessfulTransactionMessage(
                      targetToToken,
                      buyTx
                    );
                  await TGWrapper.sendNotification(message);
                }
              }
            }
          } else if (Config.SUPPOTED_SELL_METHODS.includes(targetMethodName)) {
            if (tokensToMonitor.includes(targetToToken.toLowerCase())) {
              if (HelpersWrapper.whatActionToTake(targetMethodName) === "BUY") {

                console.log("*****************$$ IN THE SELLING ZONE &&************************");

                //2. calculate token balance to sell for a random wallet
                let tokenBalance: any =
                  await HelpersWrapper.percentageOfTokensToSell(
                    Config.PERCENTAGE_TO_SELL,
                    Config.SUPPORTED_TOKEN, //tokens we are supporting
                    randomizedArgs.wallet.ADDRESS
                  );
    
                //3. constrsuct the sell path
                const sellPath = [Config.SUPPORTED_TOKEN, Config.WBNB];
                //4. check that tokenBalance is there
                if (tokenBalance > 0) {
    
                  //5.call the sell function
                  const sellTx =
                    await SwapsWrapper.swapExactTokensForETHSupportingFeeOnTransferTokens(
                      {
                        ADDRESS: randomizedArgs.wallet.ADDRESS,
                        PRIVATE_KEY: await HelpersWrapper.decrypt(
                          randomizedArgs.wallet.PRIVATE_KEY
                        ),
                      },
                      tokenBalance,
                      0,
                      sellPath
                    );
                  // 6.check if sell is successfull and save to db
                  if (sellTx.success == true) {
    
                    //7. getAmountsOut of eth when giving back tokens i.e execution price
                    const [_, amount_balance] = await HelpersWrapper.getAmountsOut(
                      Config.PANCAKESWAP_V2_ROUTER,
                      sellPath,
                      tokenBalance
                    );
    
                    console.log("TOKEN ETH BALANCE SELLING ZONE", amount_balance);
    
                    const action = "SELL";
                    //8. save sell trade to DB
                    const saveTrade = await HelpersWrapper.saveToDB(
                      targetToToken,
                      randomizedArgs.amount.toFixed(7),
                      {
                        ADDRESS: randomizedArgs.wallet.ADDRESS,
                        PRIVATE_KEY: randomizedArgs.wallet.PRIVATE_KEY,
                      },
                      action,
                      amount_balance
                    );
    
                    if (saveTrade) {
                      //9. send a successful sell telegram message
                      const message = MessagesWrapper.SuccessfulSellMessage(sellTx, Config.WBNB);
                      await TGWrapper.sendNotification(message)
                    }
                  } else {
                    // TODO send unsuccessful sell message
                    const message = MessagesWrapper.unSuccessfulTransactionMessage(Config.WBNB, sellTx);
                    await TGWrapper.sendNotification(message)
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log("Error processing transaction", error);
        }
      }
    }
  };
}

export const MempoolWrapper = new Mempool();
