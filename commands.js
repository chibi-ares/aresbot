const chalk = require('chalk')
const rl = require('readline-sync');
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))
const defaultConfigFile = './aresbot.config.json'
const configFile = args.config || args.c || defaultConfigFile
const lib = require('./lib')(configFile)

if (configFile !== defaultConfigFile) {
  console.log('Use config:', configFile)
}

async function init () {
  console.log('\nThis utility will walk you through creating a config file.\n')
  console.log('Press ^C at any time to quit.')
  let token = await lib.getToken()
  token = rl.question('Telegram bot token? ' + (token ? `(${token}) ` : ''), {
    defaultInput: token
  })
  const doCaptureChats = rl.keyInYN('Capture chats? ')
  await lib.setToken(token)
  if (doCaptureChats) {
    capture()
  }
}

async function send (args, configFile) {
  console.log(chalk.bold(`\nSending message...`))
  let message = args.message || args._.slice(1).join(' ')
  if (message && message !== true) {
    const bot = await lib.initBot()
    const { chats = {} } = await lib.openConfig()
    const chatIds = Object.keys(chats)
    message = ('' + message).replace('\\n', '\n')
    await Promise.all(chatIds.map(id => {
      const { title, username } = chats[id]
      console.log(chalk.cyan(` - sending to ${title || username}:${id}`))
      return bot.sendMessage(id, message, { parse_mode: 'HTML' })
    }))
  } else {
    throw new Error('nothing to send!')
  }
  process.exit()
}

async function capture () {
  console.log(chalk.bold('\nCapturing - enter /start in your telegram chat...'))
  const { startMessage, stopMessage } = await lib.openConfig()
  const bot = await lib.initBot()
  bot.onText(/\/start/, async (msg) => {
    const { title, first_name, username, id } = msg.chat
    const chatName = title || first_name || username
    const response = await lib.addChat(msg.chat)
    console.log(chalk.green(` - chat ${chatName} (${id}) added`))
    const message = startMessage || `<b>Welcome!</b> Bot activated.`
    await bot.sendMessage(id, message, { parse_mode: 'HTML' })
    // await bot.stopPolling()
    // process.exit()
  })
  bot.onText(/\/stop/, async (msg) => {
    const { title, first_name, username, id } = msg.chat
    const chatName = title || first_name || username
    const response = await lib.removeChat(msg.chat)
    console.log(chalk.red(` - chat ${chatName} (${id}) removed`))
    const message = stopMessage || `<b>Bot stopped!</b> Sending notifications canceled,` +
      ` bot deactivated successfully, config updated.`
    await bot.sendMessage(id, message, { parse_mode: 'HTML' })
    // await bot.stopPolling()
    // process.exit()
  })
}

async function help () {
  console.log('\nSending messages to telegram chats\n')
  console.log('Usage:')
  console.log('npx aresbot init')
  console.log('npx aresbot capture')
  console.log('npx aresbot send --message message text')
}
  
module.exports = {
  init,
  send,
  capture,
  help
}
