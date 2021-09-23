const fs = require('fs/promises')
const configFileName = './aresbot.config.json'

async function getToken() {
  let config = await openConfig()
  return config.token
}

async function addChat(chat) {
  let config = await openConfig()
  config = {
    ...config,
    chats: {
      ...config.chats,
      [chat.id]: chat
    }
  }
  return await saveConfig(config)
}

async function openConfig() {
  let config
  try {
    config = await fs.readFile(configFileName)
    config = JSON.parse(config)
  } catch (e) {
    config = {}
  }
  return config
}

async function saveConfig(config) {
  try {
    await fs.writeFile(configFileName, JSON.stringify(config))
  } catch (e) {
    console.error(e)
    return e
  }
  return true
}

async function removeChat(chat) {
  let config = await openConfig()
  if (config?.chats?.[chat.id]) {
    delete config.chats[chat.id]
    return await saveConfig(config)
  }
}

module.exports = {
  addChat,
  getToken,
  removeChat,
  openConfig,
  saveConfig,
}
