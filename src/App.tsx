import { useMemo, useState } from 'react'
import { BarChart3, ChevronDown, ExternalLink, GitBranch, Home, Link2, Search, SlidersHorizontal, Table2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './App.css'
import { webpages } from './data/webpages'
import { rankByWordFrequency } from './algorithms/wordFrequency'
import { calculatePageRank, incomingLinks } from './algorithms/pageRank'

type PageName = 'home' | 'search' | 'compare' | 'graph' | 'lab' | 'dataset'
type Algorithm = 'tf' | 'pagerank' | 'compare'

const navItems: { id: PageName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'compare', label: 'Compare', icon: SlidersHorizontal },
  { id: 'graph', label: 'Web Graph', icon: GitBranch },
  { id: 'lab', label: 'Algorithm Lab', icon: BarChart3 },
  { id: 'dataset', label: 'Dataset', icon: Table2 },
]

function App() {
  const [page, setPage] = useState<PageName>('home')
  const [query, setQuery] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('pizza')
  const [algorithm, setAlgorithm] = useState<Algorithm>('compare')
  const [damping, setDamping] = useState(0.85)
  const [selectedPage, setSelectedPage] = useState(2)
  const [datasetFilter, setDatasetFilter] = useState('')
  const [labIteration, setLabIteration] = useState(20)

  const rankData = useMemo(() => calculatePageRank(webpages, damping, labIteration), [damping, labIteration])
  const tfResults = useMemo(() => rankByWordFrequency(webpages, searchedQuery), [searchedQuery])
  const prResults = useMemo(() =>
    tfResults.map(tf => tf.page)
      .sort((a, b) => rankData.ranks[b.id] - rankData.ranks[a.id])
      .map(page => ({ page, score: rankData.ranks[page.id] })),
  [tfResults, rankData])

  const executeSearch = (value = query, mode = algorithm) => {
    const next = value.trim()
    if (!next) return
    setSearchedQuery(next)
    setAlgorithm(mode)
    setPage(mode === 'compare' ? 'compare' : 'search')
  }

  const navigate = (next: PageName) => setPage(next)

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="wordmark" onClick={() => navigate('home')} aria-label="MiniGoogle home">
          <strong>
            <span className="google-blue">M</span>
            <span className="google-red">i</span>
            <span className="google-yellow">n</span>
            <span className="google-blue">i</span>
            <span className="google-green">G</span>
            <span className="google-red">o</span>
            <span className="google-yellow">o</span>
            <span className="google-blue">g</span>
            <span className="google-green">l</span>
            <span className="google-red">e</span>
          </strong>
        </button>
        <nav aria-label="Main navigation">
          {navItems.map(item => (
            <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
              <item.icon size={15} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === 'home' && (
          <HomePage query={query} setQuery={setQuery} algorithm={algorithm} setAlgorithm={setAlgorithm} executeSearch={executeSearch} />
        )}
        {(page === 'search' || page === 'compare') && (
          <ResultsPage
            page={page} query={query} setQuery={setQuery} searchedQuery={searchedQuery} algorithm={algorithm}
            setAlgorithm={setAlgorithm} executeSearch={executeSearch} tfResults={tfResults} prResults={prResults}
            rankData={rankData.ranks} damping={damping}
          />
        )}
        {page === 'graph' && <GraphPage selected={selectedPage} setSelected={setSelectedPage} ranks={rankData.ranks} />}
        {page === 'lab' && (
          <LabPage damping={damping} setDamping={setDamping} iteration={labIteration} setIteration={setLabIteration} rankData={rankData} />
        )}
        {page === 'dataset' && <DatasetPage filter={datasetFilter} setFilter={setDatasetFilter} ranks={rankData.ranks} />}
      </main>
    </div>
  )
}

function WordmarkLarge() {
  return (
    <div className="hero-wordmark" aria-label="MiniGoogle">
      <span className="google-blue">M</span>
      <span className="google-red">i</span>
      <span className="google-yellow">n</span>
      <span className="google-blue">i</span>
      <span className="google-green">G</span>
      <span className="google-red">o</span>
      <span className="google-yellow">o</span>
      <span className="google-blue">g</span>
      <span className="google-green">l</span>
      <span className="google-red">e</span>
    </div>
  )
}

function HomePage({ query, setQuery, algorithm, setAlgorithm, executeSearch }: {
  query: string; setQuery: (v: string) => void; algorithm: Algorithm; setAlgorithm: (v: Algorithm) => void;
  executeSearch: (v?: string, m?: Algorithm) => void
}) {
  const suggestions = ['Pizza', 'Food', 'Canteen', 'Pune', 'Chai', 'Recipes']
  return (
    <section className="home-page">
      <div className="home-hero">
        <WordmarkLarge />
        <p>Explore how search engines rank the web</p>
        <form className="search-form" onSubmit={e => { e.preventDefault(); executeSearch() }}>
          <Search size={20} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the mini web" aria-label="Search" />
          <button type="submit">Search</button>
        </form>
        <div className="algorithm-toggle" role="group" aria-label="Ranking algorithm">
          {([['tf', 'Word Frequency'], ['pagerank', 'PageRank'], ['compare', 'Compare Both']] as [Algorithm, string][]).map(([id, label]) =>
            <button key={id} className={algorithm === id ? 'selected' : ''} onClick={() => setAlgorithm(id)}>{label}</button>
          )}
        </div>
        <div className="suggestions">
          {suggestions.map(term => <button key={term} onClick={() => executeSearch(term)}>{term}</button>)}
        </div>
      </div>
    </section>
  )
}

function ResultsPage(props: any) {
  const { page, query, setQuery, searchedQuery, algorithm, setAlgorithm, executeSearch, tfResults, prResults, rankData, damping } = props
  return (
    <section className="results-page">
      <div className="results-toolbar">
        <form onSubmit={e => { e.preventDefault(); executeSearch() }}>
          <Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={searchedQuery} />
          <button type="submit">Search</button>
        </form>
        <div className="algorithm-toggle compact">
          {([['tf', 'Word Frequency'], ['pagerank', 'PageRank'], ['compare', 'Compare Both']] as [Algorithm, string][]).map(([id, label]) =>
            <button key={id} className={algorithm === id ? 'selected' : ''} onClick={() => { setAlgorithm(id); executeSearch(query || searchedQuery, id) }}>{label}</button>
          )}
        </div>
      </div>
      {page === 'compare' ? (
        <>
          <div className="comparison-summary">
            <div><span className="summary-icon blue"><Search size={18} /></span><p><b>Word Frequency</b> prioritizes how often a query appears.</p></div>
            <div><span className="summary-icon green"><Link2 size={18} /></span><p><b>PageRank</b> prioritizes pages based on incoming link authority.</p></div>
          </div>
          <div className="comparison-grid">
            <div>
              <ColumnHeading title="Word Frequency" subtitle="Ranked by keyword frequency" color="blue" />
              {tfResults.map((result: any, index: number) => <ComparisonCard key={result.page.id} result={result} rank={index + 1} type="tf" ranks={rankData} query={searchedQuery} damping={damping} />)}
            </div>
            <div>
              <ColumnHeading title="PageRank" subtitle="Ranked by link authority" color="green" />
              {prResults.map((result: any, index: number) => <ComparisonCard key={result.page.id} result={result} rank={index + 1} type="pr" ranks={rankData} query={searchedQuery} damping={damping} />)}
            </div>
          </div>
        </>
      ) : (
        <div className="single-results">
          <h2>{algorithm === 'tf' ? 'Word Frequency results' : 'PageRank results'} <span>{algorithm === 'tf' ? tfResults.length : prResults.length} matches</span></h2>
          {(algorithm === 'tf' ? tfResults.map((r: any, i: number) => ({ ...r, rank: i + 1 })) : prResults.map((r: any, i: number) => ({ ...r, rank: i + 1 }))).map((result: any) =>
            <ComparisonCard key={result.page.id} result={result} rank={result.rank} type={algorithm === 'tf' ? 'tf' : 'pr'} ranks={rankData} query={searchedQuery} damping={damping} wide />
          )}
        </div>
      )}
    </section>
  )
}

function ColumnHeading({ title, subtitle, color }: { title: string; subtitle: string; color: string }) {
  return <div className="column-heading"><div className={`color-dot ${color}`} /><div><h2>{title}</h2><p>{subtitle}</p></div></div>
}

function ComparisonCard({ result, rank, type, ranks, query, damping, wide }: {
  result: any; rank: number; type: 'tf' | 'pr'; ranks: Record<number, number>; query: string; damping: number; wide?: boolean
}) {
  const [open, setOpen] = useState(false)
  const page = result.page
  const incoming = incomingLinks(webpages, page.id)
  const score = type === 'tf' ? result.score : ranks[page.id]
  return (
    <article className={`result-card ${wide ? 'wide' : ''}`}>
      <div className="rank-badge">{rank}</div>
      <div className="result-body">
        <h3>{page.title}</h3>
        <a href={`https://${page.url}`} onClick={e => e.preventDefault()}>{page.url} <ExternalLink size={11} /></a>
        <p className="snippet">{page.text}</p>
        <div className="result-meta">
          <b>{type === 'tf' ? 'Score' : 'PageRank'}: {type === 'tf' ? score : score.toFixed(4)}</b>
          <span>Incoming: {incoming.length}</span><span>Outgoing: {page.links.length}</span>
        </div>
        <p className="why"><b>{type === 'tf' ? 'Why:' : 'Authority:'}</b> {type === 'tf'
          ? `It contains the searched term ${score} time${score === 1 ? '' : 's'} in this dataset.`
          : 'It is ranked higher because of authority passed through incoming links.'}</p>
        <button className="explain-button" onClick={() => setOpen(!open)}>Why is this page ranked here? <ChevronDown size={14} className={open ? 'rotated' : ''} /></button>
        {open && (
          <div className="breakdown">
            {type === 'tf' ? (
              <>
                <table><thead><tr><th>Query word</th><th>Frequency</th></tr></thead><tbody>
                  {[...new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? [])].map(term => (
                    <tr key={term}><td>{term}</td><td>{result.frequencies?.[term] ?? 0}</td></tr>
                  ))}
                </tbody></table>
                <p><b>Total score:</b> {score}</p>
              </>
            ) : (
              <>
                <p><b>Final PageRank:</b> {score.toFixed(6)}</p>
                <p><b>Incoming links:</b> {incoming.length ? incoming.map(p => `Page ${p.id}`).join(', ') : 'None'}</p>
                <p><b>Damping factor:</b> {damping}</p>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function GraphPage({ selected, setSelected, ranks }: { selected: number; setSelected: (n: number) => void; ranks: Record<number, number> }) {
  const selectedPage = webpages.find(p => p.id === selected)!
  const incoming = incomingLinks(webpages, selected)
  const positions = [
    [170, 70], [370, 70], [520, 210], [370, 350], [170, 350], [60, 210],
  ]
  return (
    <section className="graph-page">
      <div className="section-heading"><div><p className="eyebrow">Link Explorer</p><h1>Web Graph</h1></div><span className="legend"><i className="blue" />Incoming <i className="green" />Outgoing</span></div>
      <div className="graph-layout">
        <div className="network">
          <svg viewBox="0 0 600 420" role="img" aria-label="Webpage link graph">
            <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#aab4c3" /></marker></defs>
            {webpages.flatMap(source => source.links.map(target => {
              const [x1,y1] = positions[source.id - 1]; const [x2,y2] = positions[target - 1]
              const selectedEdge = source.id === selected || target === selected
              return <line key={`${source.id}-${target}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={selectedEdge ? '#4d7cfe' : '#cbd3df'} strokeWidth={selectedEdge ? 2.5 : 1.5} markerEnd="url(#arrow)" />
            }))}
            {webpages.map(page => {
              const [x,y] = positions[page.id - 1]; const radius = 22 + ranks[page.id] * 75
              return <g key={page.id} className="graph-node" onClick={() => setSelected(page.id)}>
                <circle cx={x} cy={y} r={radius} fill={page.id === selected ? '#4d7cfe' : '#edf2fb'} stroke={page.id === selected ? '#315fd1' : '#c7d2e5'} strokeWidth="2" />
                <text x={x} y={y - 2} textAnchor="middle" className="node-number">{page.id}</text>
                <text x={x} y={y + 13} textAnchor="middle" className="node-score">{ranks[page.id].toFixed(3)}</text>
              </g>
            })}
          </svg>
        </div>
        <aside className="node-details">
          <p className="eyebrow">Selected page</p><h2>{selectedPage.title}</h2><a>{selectedPage.url}</a>
          <div className="detail-stats"><div><b>{ranks[selected].toFixed(5)}</b><span>PageRank</span></div><div><b>{incoming.length}</b><span>Incoming</span></div><div><b>{selectedPage.links.length}</b><span>Outgoing</span></div></div>
          <h3>Page text</h3><p>{selectedPage.text}</p>
          <h3>Incoming from</h3><div className="tag-row">{incoming.map(p => <span key={p.id}>Page {p.id}</span>)}</div>
          <h3>Links to</h3><div className="tag-row">{selectedPage.links.map(id => <span key={id}>Page {id}</span>)}</div>
        </aside>
      </div>
    </section>
  )
}

function LabPage({ damping, setDamping, iteration, setIteration, rankData }: {
  damping: number; setDamping: (n: number) => void; iteration: number; setIteration: (n: number) => void; rankData: any
}) {
  const chartData = [...webpages].sort((a,b) => rankData.ranks[b.id]-rankData.ranks[a.id]).map(p => ({ name: `Page ${p.id}`, rank: rankData.ranks[p.id] }))
  return (
    <section className="lab-page">
      <div className="section-heading"><div><p className="eyebrow">Algorithm Lab</p><h1>PageRank Explorer</h1></div></div>
      <div className="lab-controls">
        <button onClick={() => setIteration(20)}>Run to convergence</button>
        <button onClick={() => setIteration(Math.max(0, iteration - 1))}>Step back</button>
        <button onClick={() => setIteration(Math.min(20, iteration + 1))}>Step forward</button>
        <button onClick={() => setIteration(0)}>Reset</button>
        <label>Damping factor <b>{damping.toFixed(2)}</b><input type="range" min=".5" max=".95" step=".05" value={damping} onChange={e => setDamping(Number(e.target.value))} /></label>
      </div>
      <div className="lab-grid">
        <div className="chart-card"><h2>PageRank scores</h2><div style={{height: 280}}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0, 'dataMax']} /><YAxis type="category" dataKey="name" width={55}/><Tooltip/><Bar dataKey="rank" fill="#4d7cfe" radius={[0,5,5,0]}/></BarChart></ResponsiveContainer></div></div>
        <div className="rank-table-card"><h2>Rank table</h2><table><thead><tr><th>Rank</th><th>Page</th><th>Score</th><th>In</th><th>Out</th></tr></thead><tbody>{[...webpages].sort((a,b)=>rankData.ranks[b.id]-rankData.ranks[a.id]).map((p,i)=><tr key={p.id}><td>{i+1}</td><td><b>Page {p.id}</b><small>{p.url}</small></td><td>{rankData.ranks[p.id].toFixed(5)}</td><td>{incomingLinks(webpages,p.id).length}</td><td>{p.links.length}</td></tr>)}</tbody></table></div>
      </div>
      <div className="iteration-card"><h2>Iteration history <span>Iteration {iteration}</span></h2><div className="table-scroll"><table><thead><tr><th>Page</th>{Array.from({length: Math.min(iteration, 5)},(_,i)=><th key={i}>Iter. {i}</th>)}<th>Final</th></tr></thead><tbody>{webpages.map(p=><tr key={p.id}><td>Page {p.id}</td>{Array.from({length: Math.min(iteration,5)},(_,i)=><td key={i}>{rankData.history[i]?.[p.id]?.toFixed(4) ?? '—'}</td>)}<td><b>{rankData.ranks[p.id].toFixed(4)}</b></td></tr>)}</tbody></table></div></div>
    </section>
  )
}

function DatasetPage({ filter, setFilter, ranks }: { filter: string; setFilter: (v:string)=>void; ranks: Record<number,number> }) {
  const [selectedWord, setSelectedWord] = useState('')
  const filtered = webpages.filter(p => (`${p.title} ${p.url} ${p.text}`).toLowerCase().includes(filter.toLowerCase()))
  return (
    <section className="dataset-page">
      <div className="section-heading"><div><p className="eyebrow">Search Index</p><h1>Dataset Explorer</h1></div></div>
      <div className="dataset-toolbar"><div><Search size={18}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter indexed pages"/></div><span>{filtered.length} of {webpages.length} pages</span></div>
      <div className="dataset-grid">{filtered.map(page => {
        const words = page.text.toLowerCase().match(/[a-z0-9]+/g) ?? []
        const counts = Object.entries(words.reduce<Record<string,number>>((acc,w)=>{acc[w]=(acc[w]??0)+1;return acc},{})).sort((a,b)=>b[1]-a[1]).slice(0,5)
        return <article className="dataset-card" key={page.id}>
          <div className="dataset-card-head"><span>Page {page.id}</span><b>PR #{[...webpages].sort((a,b)=>ranks[b.id]-ranks[a.id]).findIndex(p=>p.id===page.id)+1}</b></div>
          <h2>{page.title}</h2><a>{page.url}</a><p>{page.text}</p>
          <div className="dataset-stats"><div><b>{words.length}</b><span>Words</span></div><div><b>{ranks[page.id].toFixed(4)}</b><span>PageRank</span></div><div><b>{incomingLinks(webpages,page.id).length}</b><span>Incoming</span></div><div><b>{page.links.length}</b><span>Outgoing</span></div></div>
          <div className="word-stats">{counts.map(([word,count])=>{const active=selectedWord===word;return <button className={active?'active':''} key={word} onClick={()=>setSelectedWord(active?'':word)}>{word}<b>{count}</b></button>})}</div>
        </article>
      })}</div>
    </section>
  )
}

export default App
