import Koa from "koa"
import bodyparser from "koa-bodyparser"
import Router from "koa-router"
import TelegramBot from "node-telegram-bot-api"
import * as winston from "winston"
import get_text_from_audio from "./get_text_from_audio"

const PORT = 8000

// Setting up the environment variables
const result = require("dotenv").config()
if (result.error) {
  throw result.error
}
const { ODIOIVOCALI_BOT_TOKEN } = process.env
if (ODIOIVOCALI_BOT_TOKEN === undefined) {
  throw "ODIOIVOCALI_BOT_TOKEN is undefined"
}

// Setting up the logger
const log = new winston.Logger({
  level: "verbose",
  transports: [new winston.transports.Console()]
})

// Instantiating the Telegram Bot using the Telegram API token
const bot = new TelegramBot(ODIOIVOCALI_BOT_TOKEN)

// Setting up the webserver and its routes
const app = new Koa()
app.use(bodyparser())
const router = new Router()
router.post("/telegram", async ctx => {
  const update: TelegramBot.Update = ctx.request.body

  if (!update.message) {
    log.verbose("This is not a message")
    return
  }
  if (update.message.text) {
    log.verbose(`Received a text message: "${update.message.text}"`)
  }
  if (update.message.audio) {
    log.verbose("You send me an audio file")

    const file_link_or_err = await bot.getFileLink(update.message.audio.file_id)
    if (file_link_or_err instanceof Error) {
      throw file_link_or_err
    }

    const json = await get_text_from_audio(file_link_or_err)
    if (json.DisplayText) {
      bot.sendMessage(update.message.chat.id, json.DisplayText)
    } else {
      bot.sendMessage(update.message.chat.id, "Non e' stato possibile riconoscere nessuna parola nell'audio")
    }
  }
  ctx.status = 200
})
app.use(router.routes())

// Starting the web server
app.listen(PORT, () => {
  log.info(`Listening on port: ${PORT}`)
})
