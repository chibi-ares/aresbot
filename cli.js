#!/usr/bin/env node
const chalk = require('chalk')
const fs = require('fs/promises')
const minimist = require('minimist')
const TelegramBot = require('node-telegram-bot-api')
const { getToken, addChat, removeChat, openConfig } = require('./lib')

const flags = minimist(process.argv.slice(2))

if (flags.help || !(flags.message || flags.capture)) {
  console.log('\nSend messages to telegram chats\n')
  console.log('Usage:')
  console.log('npx aresbot --capture')
  process.exit()
}

run()

async function run() {
  const token = await getToken()
  if (!token) {
    console.error(chalk.red('\nno telegram bot token is provided, please update your config!'))
    process.exit()
  }

  const bot = new TelegramBot(token, { polling: true })

  if (flags.message && flags.message !== true) {
    const { chats = {} } = await openConfig()
    const message = flags.message.replace('\\n', '\n')
    const chatIds = Object.keys(chats)
    console.log(chalk.bold(`\nsending to chats: ${chatIds.join(', ')}...`))
    await Promise.all(chatIds.map(id => {
      console.log(chalk.cyan(` - delivery to ${id}`))
      return bot.sendMessage(id, message, { parse_mode: 'HTML' })
    }))
    process.exit()
  }

  if (flags.capture) {
    const { startMessage, stopMessage } = await openConfig()
    console.log(chalk.bold('\ncapture chat mode - enter /start in your group...'))

    bot.onText(/\/start/, async (msg) => {
      let message
      const { title, first_name, id } = msg.chat
      const chatName = title || first_name
      const response = await addChat(msg.chat)
      console.log(chalk.green(` - chat ${chatName} (${id}) added`))
      if (response instanceof Error) {
        message = `Error: ${response.message}`
      } else {
        message = startMessage || `<b>Welcome!</b> Bot activated.`
      }
      await bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })
      // process.exit()
    })

    bot.onText(/\/stop/, async (msg) => {
      let message
      const { title, first_name, id } = msg.chat
      const chatName = title || first_name
      const response = await removeChat(msg.chat)
      console.log(chalk.red(` - chat ${chatName} (${id}) removed`))
      if (response instanceof Error) {
        message = `Error: ${response.message}`
      } else {
        message = stopMessage || `<b>Bot stopped!</b> Sending notifications canceled,` +
          ` bot deactivated successfully, config updated.`
      }
      await bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })
      // process.exit()
    })
  }

}
