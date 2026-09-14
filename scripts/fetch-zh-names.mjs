// 一次性数据准备脚本：抓取 PokeAPI 的官方中文名，生成静态 JSON
const IDS = Array.from({ length: 151 }, (_, i) => i + 1)
  .concat([152,155,158,252,255,258,387,390,393,448,445,133,143,196,197,700,778,887,1007])

const out = {}
const CONCURRENCY = 12
let cursor = 0
async function worker() {
  while (cursor < IDS.length) {
    const id = IDS[cursor++]
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      if (!r.ok) continue
      const j = await r.json()
      const zh = j.names.find((n) => n.language.name === 'zh-hans')
      const en = j.names.find((n) => n.language.name === 'en')
      if (zh || en) out[id] = { zh: zh?.name ?? null, en: en?.name ?? j.name, ja: j.names.find(n=>n.language.name==='ja')?.name ?? null }
    } catch (e) { console.error('fail', id, e.message) }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
const sorted = Object.fromEntries(Object.keys(out).sort((a,b)=>a-b).map(k=>[k,out[k]]))
console.log('count:', Object.keys(sorted).length)
console.log('missing zh:', Object.values(sorted).filter(v=>!v.zh).length)
process.stdout.write(JSON.stringify(sorted, null, 0))
