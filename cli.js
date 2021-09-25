#!/usr/bin/env node
const chalk = require('chalk')
const { init, send, capture, help } = require('./commands')
const minimist = require('minimist')
const args = minimist(process.argv.slice(2))
  
;(async function main() {
  const [command] = args._
  try {
    switch (command) {
      case 'init':
        await init()
        break
      case 'send':
        await send(args)
        break
      case 'capture':
        await capture()
        break
      default:
        await help()
    }
  } catch (e) {
    console.error(chalk.red('Error: ' + e.message))
    process.exit()
  }
})()
