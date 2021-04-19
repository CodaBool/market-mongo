const fs = require('fs');
const path = require('path');
pwd = '/var/task/node_modules/coda-auth/dist/client'

var readTaskFolder = new Promise((resolve, reject) => {
  if (fs) {
    if (pwd.includes('\\')) {
      pwd = __dirname.replace(/\\/g, '/')
    }
    const splitPwd = pwd.split('/')
    console.log('DEBUG: split on /', splitPwd)
    let folderToRead = ''
    let drop = splitPwd[splitPwd.length - 4]
    console.log('DEBUG: drop', drop)
    for (const dir of splitPwd) {
      if (dir === drop) break
      folderToRead+=dir + '/'
    }
    console.log('DEBUG: folderToRead =', folderToRead)
    fs.readdir(folderToRead, (err, data) => {
      if (err) {
        reject(err); return
      }
      resolve(data)
    })
  }
});

readTaskFolder
  .then(function(result) {
    console.log('ls ../../../../ =', result)
  })
  .catch(function(err) {
    console.log('readTaskFolder Error', err)
  });