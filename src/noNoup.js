const shell = require('shelljs')
const fs = require('fs')
const path = require('path')

class NoNoup {
  init() {
    const samplePath = path.join(__dirname, '../assets/noup.json')
    const pwd = shell.pwd().toString()
    const curNoupFile = path.join(pwd, 'noup.json')
    if (fs.existsSync(curNoupFile)) {
      console.log('🐛 noup.jon exists'.red)
      process.exit()
    }
    shell.exec(`cp ${samplePath} ${pwd}`)
  }
}

module.exports = NoNoup
