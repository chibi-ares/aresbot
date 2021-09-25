const fs = require('fs/promises')
const TelegramBot = require('node-telegram-bot-api')

const lib = (configFileName) => ({
  async getToken () {
    let config = await this.openConfig()
    return config.token
  },
  async setToken (token) {
    let config = await this.openConfig()
    config.token = token
    return await this.saveConfig(config)
  },
  async addChat (chat) {
    let config = await this.openConfig()
    config = {
      ...config,
      chats: {
        ...config.chats,
        [chat.id]: chat
      }
    }
    return await this.saveConfig(config)
  },
  async openConfig() {
    let config
    try {
      config = await fs.readFile(configFileName)
      config = JSON.parse(config)
    } catch (e) {
      config = {}
    }
    return config
  },
  async saveConfig (config) {
    try {
      await fs.writeFile(configFileName, JSON.stringify(config))
    } catch (e) {
      console.error(e)
      return e
    }
    return true
  },
  async removeChat (chat) {
    let config = await this.openConfig()
    if (config?.chats?.[chat.id]) {
      delete config.chats[chat.id]
      return await this.saveConfig(config)
    }
  },
  async initBot () {
    const token = await this.getToken()
    if (token) {
      const bot = new TelegramBot(token, { polling: true })
      return bot
    }
    throw new Error('no token provided, please update config!')
  }
})

module.exports = lib
