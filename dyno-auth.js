#!/usr/bin/env node
const path = require('path');
const { readdir, readFile } = require("fs").promises;

async function read() {
  try {
    console.log('pwd =', __dirname)
    const filesCurrent = await readdir(__dirname).catch(console.log);
    console.log('ls =', filesCurrent)

    const splitPwd = __dirname.split('\\')
    console.log('DEBUG: split on /', splitPwd)
    let oneUp = ''
    let drop = splitPwd[splitPwd.length - 1]
    console.log('DEBUG: drop', drop)
    for (const dir of splitPwd) {
      if (dir === drop) break
      oneUp+=dir + '\\'
    }
    console.log(oneUp)
    const filesUpOne = await readdir(oneUp).catch(console.log);
    console.log('ls ../ =', filesUpOne)

    let twoUp = ''
    drop = splitPwd[splitPwd.length - 2]
    console.log('DEBUG: drop', drop)
    for (const dir of splitPwd) {
      if (dir === drop) break
      twoUp+=dir + '\\'
    }
    console.log(twoUp)
    const filesUpTwo = await readdir(twoUp).catch(console.log);
    console.log('ls ../../ =', filesUpTwo)


    
    // after finding a file
    // const env = path.resolve('./.env');
    // console.log(aPath.split('\\'))

    // const env = path.resolve('./.env');

    // utf8
    // const raw = await readFile(env, 'utf8').catch(console.log);
    // console.log(raw)

    // json
    // const raw = await readFile(jsonFile).catch(console.log);
    // const urls = JSON.parse(raw)
    // console.log(urls['market-mongo']['dev'])
    return {pwd: __dirname, filesCurrent, filesUpOne, filesUpTwo}
  } catch (error) {
    console.log('/codabool-dyno-auth ERROR', error)
    return error
  }
}

module.exports = read;
