# MiniGoogle

MiniGoogle is an interactive search engine demonstrator built with React, TypeScript, and Vite. It shows how two ranking techniques can produce different results for the same search query:

- **Word Frequency**: ranks relevant pages by how often the query terms occur.
- **PageRank**: ranks relevant pages by link-authority scores.

The interface uses a simple, old-school search engine style with the classic blue, red, yellow, and green wordmark colors.

## Features

- Search across six predefined webpages
- Switch between Word Frequency, PageRank, and Compare Both modes
- Compare rankings side-by-side
- Expand ranking explanations for individual results
- Explore directed links in an interactive web graph
- Adjust the PageRank damping factor
- Step through PageRank iterations
- View PageRank scores in an interactive bar chart
- Browse and filter the complete dataset
- Responsive desktop and mobile layouts

## Search Example

Try queries such as:

- `pizza`
- `food`
- `canteen`
- `Pune`
- `chai`
- `recipes`

For PageRank searches, pages are first matched against the query and then sorted by their calculated PageRank score. PageRank does not introduce unrelated pages.

## Ranking Algorithms

### Word Frequency

The query and page text are normalized to lowercase tokens. The score is the sum of each query term's occurrence count on that page.

```text
TF(page, query) = sum(frequency(query term, page text))
```

### PageRank

PageRank is calculated iteratively over the directed link graph using a configurable damping factor:

```text
PR(i) = (1 - d) / N + d * sum(PR(j) / outgoingLinks(j))
```

- Default damping factor: `0.85`
- Default iterations: `20`
- Convergence threshold: `0.000001`
- Dangling pages contribute their rank evenly across all pages

## Project Structure

```text
src/
├── algorithms/
│   ├── pageRank.ts
│   └── wordFrequency.ts
├── data/
│   └── webpages.ts
├── App.tsx
├── App.css
└── index.css
```

## Getting Started

### Requirements

- Node.js 20 or later
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite, typically `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Technology

- React
- TypeScript
- Vite
- Recharts
- D3
- Lucide React
