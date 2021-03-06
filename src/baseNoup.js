/*
 * all commands require noup.json file
 * this class verify and parse
 */
const shell = require('shelljs')
const path = require('path')
const fs = require('fs')
const Q = require('q')
const { isObject } = require('lodash')
require('colors')

const { VERBOSE = false } = process.env
class BaseNoup {
  constructor() {
    const pwd = shell.pwd().toString()
    const configPath = path.join(pwd, 'noup.json')
    if (!fs.existsSync(configPath)) {
      console.log('🐛 No noup.json file'.red)
      process.exit()
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    this.workers = config.workers
    this.app = config.app
    this.env = config.env || {}
    this.node = config.node || ''
    this.scripts = config.scripts || []
    this.SETUP_SCRIPT = path.join(__dirname, '../scripts/setup.sh')
    this.DEPLOY_SCRIPT = path.join(__dirname, '../scripts/deploy.sh')
    this.STOP_SCRIPT = path.join(__dirname, '../scripts/stop.sh')
    this.START_SCRIPT = path.join(__dirname, '../scripts/start.sh')
    this.STATUS_SCRIPT = path.join(__dirname, '../scripts/status.sh')
    this.LOGS_SCRIPT = path.join(__dirname, '../scripts/logs.sh')
  }

  runCommand(command) {
    const extraCmd = VERBOSE === 'true' ? '' : '&> /dev/null'
    shell.exec(`${command} ${extraCmd}`)
  }

  runInlineScriptInServer({ host, script }) {
    return shell.exec(`ssh ${host} "${script}"`)
  }

  runScriptInServer({ host, script, env = {} }) {
    console.log(`✓ Host ${host}`)
    env.VERBOSE = VERBOSE
    const envStr = Object.keys(env).reduce((r, n) => {
      if (isObject(env[n])) {
        const value = JSON.stringify(env[n]).replace(/"/g, '\\\\\\"')
        r += `${n}="${value}" `
      } else {
        r += `${n}="${env[n]}" `
      }
      return r
    }, '')
    return shell.exec(`ssh ${host} ${envStr} bash -s < ${script}`)
  }

  allWorkers() {
    return Object.values(this.workers)
  }

  workerByName(name) {
    const worker = this.workers[name]
    if (!worker) {
      console.log(`🐛 No worker name ${name}`.red)
      process.exit()
    }
    return worker
  }

  getEnv() {
    return this.env
  }

  getApp() {
    return this.app
  }
  
  getAppScript() {
    return this.scripts
  }

  getNodeVersion() {
    return this.node
  }
}

module.exports = BaseNoup
