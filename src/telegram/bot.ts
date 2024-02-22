import { Telegraf } from "telegraf";
import { Config } from "../config/config";
import { Messages } from "./messages";

export class TGBot extends Messages{
    bot: Telegraf;
    constructor() {
        super();
        this.bot = new Telegraf(Config.BOT_TOKEN!);
        // Start the bot
        this.bot.launch();

        console.log("***************BOT HAS STARTED***********")
    }

    BotOperate = async()=>{
        try {
            // Reply when a user sends start to the bot
            this.bot.start((ctx) => {
                ctx.reply(this.startMessage())
            })
            
        } catch (error) {
            console.log("Unable to Start bot Operations", error)
        }
    }

    sendNotification = async (message: any) => {
       
        const chatIDs = Config.AUTHORIZED_USERS;
        console.log(typeof chatIDs);
        chatIDs.forEach(chat => {
            this.bot.telegram.sendMessage(chat, message, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }).catch((error: any) => {
                console.log("Encouterd an error while sending notification to TG", error)
                
            })
        });
        
    };

}

export const TGWrapper = new TGBot();