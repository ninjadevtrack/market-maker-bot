import { Config } from "./config/config"
import { MempoolWrapper } from "./core/core"
import { connectDB } from "./model/connection"
import { randomPriceSupportForToken } from "./schedular/trade-execution"
import { TGWrapper } from "./telegram/bot"

const main = async () => {

    try {
        if (Config.IS_BOT_ON) {
            //connect to DB
            await connectDB()
            //conect to TG
            await TGWrapper.BotOperate();
            //streaming transaction data
           await MempoolWrapper.monitor()
           
          //schedular
        //  randomPriceSupportForToken(Config.SUPPORTED_TOKEN)

        } else {
            console.log("Unable to start bot kindly turn BOT_ON on Config file")
        }

    } catch (error) {
        console.log("Error", error)
    }


}

main()