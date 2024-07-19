import { Config } from "../config/config";
import { HelpersWrapper } from "../helpers/helpers";
import { Trade } from "../model/trade";
import { schedule } from "node-cron";
import { SwapsWrapper } from "../swapps/swaps";
import { MessagesWrapper } from "../telegram/messages";
import { TGWrapper } from "../telegram/bot";

export const randomPriceSupportForToken = async (token: string) => {
  try {
    //RANDOM  STARTING TIME FOR SCHEDULAR *TIME*  FOR THE BOT
    let nextTime =
      Config.EXECUTION_TIME[
        Math.floor(Math.random() * Config.EXECUTION_TIME.length)
      ];

    console.log("RANDOM SCHEDULAR START TIME IN MINS:", nextTime);

    let randomizedArgs: any = {
      wallet: Config.WALLETS[Math.floor(Math.random() * Config.WALLETS.length)],
      amount:
        Config.EXECUTION_AMOUNT[
          Math.floor(Math.random() * Config.EXECUTION_AMOUNT.length)
        ],
    };

    // Get Saved token
    const allTokenTrades = await Trade.find({
      token: token,
      is_sold_out: false,
    });

    // console.log("ALL SAVED TOKENS", allTokenTrades)

    //get the last registred trade on the database
    let lastTrade = allTokenTrades[allTokenTrades.length - 1];

    console.log("lastTrade", lastTrade);

    schedule(`*/${nextTime} * * * *`, async () => {
      console.log("WE GOT IN HERE");

      //check what was the last action  on the trade
      if (lastTrade && lastTrade.action === "BUY") {
        console.log(
          "********************EXECUTING SELL ORDER ON SCHEDULAR***********************"
        );
        //1. querry to get the amount of tokens a wallet holds
        // const tokenBalance =
        //     lastTrade?.amount_balance! > 0 ? lastTrade.amount_balance
        //         : lastTrade.value / 2;
        //2. sell only a percentage of the tokens
        let tokenBalance: any = await HelpersWrapper.percentageOfTokensToSell(
          Config.PERCENTAGE_TO_SELL,
          lastTrade.token,
          lastTrade.wallet.ADDRESS
        );

        //3. constrsuct the sell path
        const sellPath = [lastTrade.token, Config.WBNB];
        //4. check that tokenBalance is there
        if (tokenBalance > 0) {
          //5.call the sell function
          const sellTx =
            await SwapsWrapper.swapExactTokensForETHSupportingFeeOnTransferTokens(
              {
                ADDRESS: lastTrade.wallet.ADDRESS,
                PRIVATE_KEY: await HelpersWrapper.decrypt(
                  lastTrade.wallet.PRIVATE_KEY
                ),
              },
              tokenBalance,
              0,
              sellPath
            );

          //6. check if sell was successful
          if (sellTx.success == true) {
            console.log(
              "******** SCHEDULAR  SELL TX WAS SUCCESSFUL *********",
              sellTx
            );

            //7. update on the database
            const trade = await Trade.findByIdAndUpdate(lastTrade.id, {
              is_sold_out: true,
              action: "SELL",
            });

            // console.log("Trade", trade)

            if (trade) {
              //8 send a telegram message
              const message = MessagesWrapper.SuccessfulSellMessage(
                sellTx,
                Config.WBNB
              );
              await TGWrapper.sendNotification(message);
            }
          } else {
            const message = MessagesWrapper.unSuccessfulTransactionMessage(
              Config.WBNB,
              sellTx
            );
            await TGWrapper.sendNotification(message);
          }
        }
      } else if (lastTrade && lastTrade.action === "SELL") {
        console.log(
          "*****************EXECUTING A BUY ORDER ON SCHEDULAR******************"
        );

        //1. construct a buy path
        const buyPath = [Config.WBNB, lastTrade.token];

        //2. call the buy function to execute
        const buyTx =
          await SwapsWrapper.swapExactETHForTokensSupportingFeeOnTransferTokens(
            randomizedArgs.wallet,
            0,
            randomizedArgs.amount.toFixed(7),
            buyPath
          );

        //3. check if the buy was successful
        if (buyTx.success == true) {
          //get the execution price
          const amount_balance = await HelpersWrapper.getAmountsOut(
            Config.PANCAKESWAP_V2_ROUTER,
            buyPath,
            randomizedArgs.amount.toFixed(7)
          );

          console.log("AMOUNTS OUT", amount_balance);

          const action = "BUY";

          //4. save the buy to the database
          const trade = await HelpersWrapper.saveToDB(
            token.toLowerCase(),
            randomizedArgs.amount.toFixed(7),
            randomizedArgs.wallet,
            action,
            amount_balance
          );

          if (trade) {
            //send  a successful Buy transaction message
            const message = MessagesWrapper.SuccessfulBuyMessage(
              lastTrade.token,
              buyTx
            );
            await TGWrapper.sendNotification(message);
          } else {
            const message = MessagesWrapper.unSuccessfulTransactionMessage(
              lastTrade.token,
              buyTx
            );
            await TGWrapper.sendNotification(message);
          }
        }
      } else {
        if (!lastTrade) {
          console.log("******************EXECUTING A BUY ORDER ON SCHEDULAR**************************");
          //1. construct a buy path
          const buyPath = [Config.WBNB, Config.SUPPORTED_TOKEN];

          //2. call the buy function to execute
          const buyTx =
            await SwapsWrapper.swapExactETHForTokensSupportingFeeOnTransferTokens(
              randomizedArgs.wallet,
              0,
              randomizedArgs.amount.toFixed(7),
              buyPath
            );

          //3. check if the buy was successful
          if (buyTx.success == true) {
            //4.get the execution price
            const amount_balance = await HelpersWrapper.getAmountsOut(
              Config.PANCAKESWAP_V2_ROUTER,
              buyPath,
              randomizedArgs.amount.toFixed(7)
            );

            console.log("AMOUNTS OUT", amount_balance);
            const action = "BUY";

            //5. save the buy to the database
           const trade = await HelpersWrapper.saveToDB(
              token.toLowerCase(),
              randomizedArgs.amount.toFixed(7),
              randomizedArgs.wallet,
              action,
              amount_balance
            );

            if (trade) {
                //send  a successful Buy transaction message
                const message = MessagesWrapper.SuccessfulBuyMessage(
                  Config.SUPPORTED_TOKEN,
                  buyTx
                );
                await TGWrapper.sendNotification(message);
              } else {
                const message = MessagesWrapper.unSuccessfulTransactionMessage(
                  Config.SUPPORTED_TOKEN,
                  buyTx
                );
                await TGWrapper.sendNotification(message);
              }

            //7. set the next random time
            nextTime =
              Config.EXECUTION_TIME[
                Math.floor(Math.random() * Config.EXECUTION_TIME.length)
              ];
            console.log("RANDOM TRADE START TIME:", nextTime);
          }

        }
      }
    });
  } catch (error) {
    console.log("Unable to perform randomPriceSupportForToken ", error);
  }
};
