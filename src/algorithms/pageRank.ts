import type { Webpage } from '../data/webpages'

export type PageRankResult = {
  ranks: Record<number, number>
  iterations: number
  history: Record<number, number>[]
}

export function calculatePageRank(pages: Webpage[], damping = 0.85, maxIterations = 20, threshold = 1e-6): PageRankResult {
  const n = pages.length
  let ranks: Record<number, number> = Object.fromEntries(pages.map(page => [page.id, 1 / n]))
  const history: Record<number, number>[] = [{ ...ranks }]

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const incoming = Object.fromEntries(pages.map(page => [page.id, 0]))
    for (const page of pages) {
      const outgoingCount = page.links.length
      if (outgoingCount === 0) {
        const share = ranks[page.id] / n
        for (const target of pages) incoming[target.id] += share
      } else {
        for (const targetId of page.links) incoming[targetId] += ranks[page.id] / outgoingCount
      }
    }
    const next = Object.fromEntries(pages.map(page => [
      page.id,
      (1 - damping) / n + damping * incoming[page.id],
    ]))
    const error = Math.max(...pages.map(page => Math.abs(next[page.id] - ranks[page.id])))
    ranks = next
    history.push({ ...ranks })
    if (error < threshold) {
      return { ranks, iterations: iteration + 1, history }
    }
  }
  return { ranks, iterations: maxIterations, history }
}

export function incomingLinks(pages: Webpage[], id: number) {
  return pages.filter(page => page.links.includes(id))
}
