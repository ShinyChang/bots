const fetch = require('node-fetch')

const chk = () => {
  return fetch(process.env.HP).then(res => res.json()).then(list => {
    const hb = {};
    list.forEach(obj => {
      obj.barcodes.forEach(bar => {
        if (!hb[bar]) {
          hb[bar] = new Set();
        }
        hb[bar].add(obj.id);
      })
    })
    return Object.keys(hb).length ? `*Duplication*\n` + Object.keys(hb).filter(bar => hb[bar].size > 1).map(bar => {
      return `\`${bar}\` : ${Array.from(hb[bar]).map(v => `<${process.env.BL}/${v}}|${v}>`).join(', ')}`
    }).join('\n') : '';
  })
}

const handler = () => {
  return chk()
}

module.exports = handler
