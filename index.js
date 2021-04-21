const url1 = 'secure'
const url2 = null

const original = !(!url1 || url1 == 'insecure')

const val = !((url1 == 'insecure' || url2 == 'insecure') || (!url1 && !url2))


console.log(`(${url1 == 'insecure'} || ${url2 == 'insecure'}) || (${!url1} && ${!url2})`)








console.log('original', original ? 'secure' : 'insecure')
console.log('val', val ? 'secure' : 'insecure')

// original: !(!url1 || url1.startsWith('http://'))