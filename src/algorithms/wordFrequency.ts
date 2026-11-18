import type { Webpage } from '../data/webpages'

export const normalizeTokens = (text: string) =>
  text.toLowerCase().match(/[a-z0-9]+/g) ?? []

export function termFrequency(page: Webpage, query: string) {
  const terms = normalizeTokens(query)
  const pageTokens = normalizeTokens(page.text)
  const frequencies = Object.fromEntries(
    [...new Set(terms)].map(term => [term, pageTokens.filter(token => token === term).length])
  )
  const score = terms.reduce((sum, term) => sum + (frequencies[term] ?? 0), 0)
  return { score, frequencies }
}

export function rankByWordFrequency(pages: Webpage[], query: string) {
  return pages
    .map(page => ({ page, ...termFrequency(page, query) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.page.id - b.page.id)
}
