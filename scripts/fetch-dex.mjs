// 一次性数据准备脚本：抓取 PokeAPI 图鉴基础数据，生成静态快照 src/data/dex.ts
// 用法: node scripts/fetch-dex.mjs
import { writeFileSync } from 'node:fs'

const IDS = Array.from({ length: 151 }, (_, i) => i + 1).concat([
  152, 155, 158, 196, 197, 252, 255, 258, 387, 390, 393, 445, 448, 700, 778,
  887, 1007,
])

const CONCURRENCY = 10
const results = []
let cursor = 0

async function worker() {
  while (cursor < IDS.length) {
    const id = IDS[cursor++]
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const p = await res.json()
      results.push({
        id: p.id,
        name: p.name,
        types: p.types.map((t) => t.type.name),
        stats: p.stats.map((s) => s.base_stat),
        height: p.height,
        weight: p.weight,
        baseExp: p.base_experience ?? 0,
      })
    } catch (err) {
      console.error(`skip ${id}: ${err.message}`)
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))
results.sort((a, b) => a.id - b.id)

const body = results
  .map(
    (p) =>
      `  { id: ${p.id}, name: ${JSON.stringify(p.name)}, types: ${JSON.stringify(p.types)}, stats: ${JSON.stringify(p.stats)}, height: ${p.height}, weight: ${p.weight}, baseExp: ${p.baseExp} },`
  )
  .join('\n')

const out = `// 由 scripts/fetch-dex.mjs 生成 —— 请勿手改
// 数据来源: https://pokeapi.co/api/v2/pokemon/{id}
import type { PokemonType } from '@/lib/type-chart'

export interface DexEntry {
  id: number
  name: string
  types: PokemonType[]
  /** [hp, attack, defense, special-attack, special-defense, speed] */
  stats: number[]
  height: number
  weight: number
  baseExp: number
}

export const DEX: DexEntry[] = [
${body}
]

export const STAT_LABELS = ['HP', '攻击', '防御', '特攻', '特防', '速度'] as const

export function statTotal(entry: DexEntry): number {
  return entry.stats.reduce((sum, n) => sum + n, 0)
}

export function artwork(id: number): string {
  return \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${id}.png\`
}

export function sprite(id: number): string {
  return \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/\${id}.png\`
}
`

writeFileSync('src/data/dex.ts', out)
console.log(`wrote src/data/dex.ts — ${results.length} entries, ${out.length} bytes`)
