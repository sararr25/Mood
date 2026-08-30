import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { contrastLabel, contrastRatio } from '../core/color'
import type { Phase, Reference } from '../core/types'
import { useProjectStore } from '../store/projectStore'

const phases: { key: Phase; label: string; number: string }[] = [{ key: 'explore', label: 'Explore', number: '01' }, { key: 'direction', label: 'Direction', number: '02' }, { key: 'refine', label: 'Refine', number: '03' }, { key: 'system', label: 'System', number: '04' }]
const links: Record<Phase, string> = { explore: '/explore', direction: '/direction', refine: '/refine', system: '/system' }
const icon = (symbol: string) => <span aria-hidden="true" className="symbol">{symbol}</span>

export function App() {
  return <Routes><Route path="/" element={<Navigate to="/explore" replace />} />{phases.map((phase) => <Route key={phase.key} path={links[phase.key]} element={<Workspace phase={phase.key} />} />)}<Route path="*" element={<Navigate to="/explore" replace />} /></Routes>
}

function Workspace({ phase }: { phase: Phase }) {
  const setPhase = useProjectStore((state) => state.setPhase)
  const project = useProjectStore((state) => state.project)
  const location = useLocation()
  useEffect(() => { if (project.currentPhase !== phase) setPhase(phase) }, [phase, project.currentPhase, setPhase])
  return <div className={`app phase-${phase}`}>
    <header className="topbar"><a className="brand" href="/explore">MOOD</a><nav aria-label="Workflow stages">{phases.map((item) => <NavLink key={item.key} to={links[item.key]} className={({ isActive }) => `phase-link ${isActive ? 'active' : ''}`}><small>{item.number}</small>{item.label}</NavLink>)}</nav><div className="top-actions"><span>Support</span>{icon('notifications')}{icon('settings')}<span className="avatar">AW</span></div></header>
    <div className="workspace"><Sidebar phase={phase} /><main className="stage" key={location.pathname}>{phase === 'explore' && <Explore />}{phase === 'direction' && <Direction />}{phase === 'refine' && <Refine />}{phase === 'system' && <System />}</main></div>
  </div>
}

function Sidebar({ phase }: { phase: Phase }) {
  const project = useProjectStore((state) => state.project)
  const nav = phase === 'explore' ? [['explore', 'Explore'], ['folder', 'References'], ['description', 'Notes'], ['palette', 'Colors'], ['text_fields', 'Type'], ['category', 'Assets']] : [['image', 'References'], ['description', 'Notes'], ['palette', 'Colors'], ['text_fields', 'Type'], ['inventory_2', 'Assets']]
  return <aside className="sidebar"><div className="project-mark"><span className="mini-art">⌁</span><div><b>PROJECT ALPHA</b><strong>{project.title}</strong><small>Outdoor Travel Brand</small></div></div><div className="side-nav">{nav.map(([symbol, label]) => <button className={(phase === 'explore' && label === 'Explore') || (phase !== 'explore' && ((phase === 'direction' && label === 'References') || (phase === 'refine' && label === 'Colors') || (phase === 'system' && label === 'Assets'))) ? 'selected' : ''} key={label}>{icon(symbol)}{label}{label === 'References' && <em>{project.references.length}</em>}</button>)}</div><div className="side-bottom"><button className="solid">＋ Add Asset</button><small>{icon('archive')} Archive</small><small>{icon('delete')} Trash</small></div></aside>
}

function Explore() {
  const project = useProjectStore((state) => state.project)
  const keep = useProjectStore((state) => state.keepReference)
  const reject = useProjectStore((state) => state.rejectReference)
  const apply = useProjectStore((state) => state.applySuggestion)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(project.references.map((reference) => reference.id))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const references = useMemo(() => order.map((id) => project.references.find((reference) => reference.id === id)!).filter((reference) => reference.status !== 'rejected' && reference.title.toLowerCase().includes(query.toLowerCase())), [order, project.references, query])
  const onDragEnd = ({ active, over }: DragEndEvent) => { if (!over || active.id === over.id) return; setOrder((old) => { const from = old.indexOf(String(active.id)); const to = old.indexOf(String(over.id)); const next = [...old]; next.splice(from, 1); next.splice(to, 0, String(active.id)); return next }) }
  return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><section className="explore-shell"><div className="explore-intro"><p className="eyebrow">EXPLORE / MOODBOARD</p><h1>{project.title}</h1><p>{project.brief}</p><label className="search">{icon('search')}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search references…" /></label></div><section className="canvas pattern"><div className="observation"><span>OBSERVATION</span><h2>The focus is shifting towards natural textures and soft, diffuse lighting.</h2><button onClick={() => setShowSuggestions(true)}>Lean in</button><button className="quiet">Dismiss</button></div><div className="canvas-head"><div><span className="eyebrow">CURATED REFERENCES</span><h2>Hygge home, with more edge.</h2></div><span className="canvas-count">{references.length} pieces</span></div><div className="reference-grid">{references.map((reference, index) => <ReferenceCard key={reference.id} reference={reference} index={index} onKeep={() => keep(reference.id)} onReject={() => reject(reference.id)} />)}</div></section>{showSuggestions && <aside className="suggestions"><button className="close" onClick={() => setShowSuggestions(false)} aria-label="Close suggestions">×</button><p className="eyebrow cobalt">✦ AI SUGGESTIONS</p>{project.suggestions.map((suggestion) => <article className={`suggestion ${suggestion.applied ? 'applied' : ''}`} key={suggestion.id}>{suggestion.image && <img src={suggestion.image} alt="" />}<h3>{suggestion.title}</h3><p>{suggestion.detail}</p><button onClick={() => apply(suggestion.id)}>{suggestion.applied ? 'Applied to canvas' : 'Apply to Canvas'}</button></article>)}<button className="regenerate">↻ Regenerate suggestions</button></aside>}</section></DndContext>
}

function ReferenceCard({ reference, index, onKeep, onReject }: { reference: Reference; index: number; onKeep: () => void; onReject: () => void }) {
  return <article className={`reference-card card-${index % 6}`} data-id={reference.id} style={{ transform: `rotate(${reference.rotation ?? 0}deg)` }}><span className="pin" /><img src={reference.image} alt={reference.title} /><div className="reference-copy"><small>{reference.group}</small><h3>{reference.title}</h3><p>{reference.notes}</p></div><div className="card-actions"><button onClick={onKeep} className={reference.status === 'kept' ? 'kept' : ''}>{icon('check')} Keep</button><button onClick={onReject}>{icon('close')} Reject</button></div></article>
}

function Direction() {
  const project = useProjectStore((state) => state.project)
  const updateStatement = useProjectStore((state) => state.updateStatement)
  const selectDirection = useProjectStore((state) => state.selectDirection)
  const direction = project.directions.find((item) => item.id === project.selectedDirectionId)!
  const curated = project.references.filter((reference) => direction.referenceIds.includes(reference.id))
  return <section className="direction-shell"><div className="direction-main"><p className="eyebrow cobalt">DESIGN DIRECTION</p><h1>{project.title}</h1><p className="direction-title">{direction.title}</p><div className="statement-card tape"><label htmlFor="direction-statement">Direction statement</label><textarea id="direction-statement" value={direction.statement} onChange={(event) => updateStatement(event.target.value)} /><div className="tag-row">{direction.descriptors.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="section-title"><span>SELECTED REFERENCES</span><button onClick={() => selectDirection(direction.id)}>Save direction</button></div><div className="curated-grid">{curated.map((reference) => <figure key={reference.id}><img src={reference.image} alt={reference.title} /><figcaption><small>{reference.group}</small>{reference.title}</figcaption></figure>)}</div><blockquote>“It must feel like it was made by hands, not algorithms.”<small>— Client note</small></blockquote></div><aside className="direction-tools"><p className="eyebrow">🛠 DIRECTION TOOLS</p><TokenStrip title="COLOR PALETTE" colors={direction.palette} /><div className="type-pairing"><p>TYPOGRAPHY</p><strong>𝔄𝔞 <span>Bricolage Grotesque</span></strong><strong>𝔄𝔞 <span>EB Garamond</span></strong></div><div className="decisions"><p>KEY DECISIONS</p>{project.designDecisions.map((decision) => <div key={decision.id}>{icon(decision.locked ? 'lock' : 'radio_button_unchecked')} {decision.statement}</div>)}</div><div className="agent-nudge"><b>✦ AI DIRECTION ASSISTANT</b><p>Here are ways to push this direction even further.</p><button>Increase contrast in imagery →</button><button>Lean into one graphic motif →</button></div></aside></section>
}

function Refine() {
  const project = useProjectStore((state) => state.project)
  const lock = useProjectStore((state) => state.lockDecision)
  const updateWeight = useProjectStore((state) => state.updateTypographyWeight)
  const [detail, setDetail] = useState<'overview' | 'color' | 'type'>('overview')
  const colors = project.designSystem.colors
  const primary = colors[0]?.value ?? '#9E3D00'
  const surface = colors[3]?.value ?? '#FCE3DA'
  return <section className="refine-shell pattern"><div className="refine-content"><header className="refine-hero tape"><div><p className="eyebrow olive">SYSTEM HEALTH: STRONG</p><h1>Refining<br />‘{project.title}’</h1></div><div><button className="quiet">Export Spec</button><button className="solid">{icon('lock')} Lock Direction</button></div></header><div className="refine-tabs"><button className={detail === 'overview' ? 'active' : ''} onClick={() => setDetail('overview')}>Overview</button><button className={detail === 'color' ? 'active' : ''} onClick={() => setDetail('color')}>Color & accessibility</button><button className={detail === 'type' ? 'active' : ''} onClick={() => setDetail('type')}>Typography</button></div>{detail === 'color' ? <ColorDetail colors={colors} /> : detail === 'type' ? <TypeDetail onWeight={updateWeight} /> : <div className="refine-grid"><section className="token-card tape"><h2>Color Palette &<br />Accessibility</h2><TokenStrip colors={colors.slice(0, 4).map((color) => color.value)} /><p>Contrast check: primary on surface is <b>{contrastLabel(contrastRatio(primary, surface))}</b>. Use deep forest for longer text.</p></section><section className="decision-stack"><h2>Design Decisions</h2>{project.designDecisions.map((decision) => <article className={decision.locked ? 'locked' : ''} key={decision.id}><b>{icon(decision.locked ? 'lock' : 'hourglass_top')} {decision.category}</b><p>{decision.statement}</p>{!decision.locked && <button onClick={() => lock(decision.id)}>Lock decision</button>}</article>)}</section><section className="type-preview tape"><h2>Typography<br />Specimen</h2><button onClick={() => setDetail('type')}>Inspect type →</button><div className="huge-type">The quick<br />brown fox.</div></section></div>}</div><Critique /></section>
}

function ColorDetail({ colors }: { colors: { id: string; name: string; value: string; role: string }[] }) {
  const surface = colors.find((color) => color.id === 'surface')?.value ?? '#FFF8F6'
  return <section className="detail-board tape"><div><p className="eyebrow">COLOR REVIEW</p><h2>Color Palette &<br />Accessibility</h2><p>Comprehensive contrast analysis and vision simulation for the current active palette.</p></div><table><thead><tr><th>Text / element</th><th>Background</th><th>Ratio</th><th>WCAG AA</th><th>WCAG AAA</th></tr></thead><tbody>{colors.slice(0, 3).map((color) => { const ratio = contrastRatio(color.value, surface); return <tr key={color.id}><td><i style={{ background: color.value }} />{color.name}</td><td><i style={{ background: surface }} />Surface</td><td>{ratio.toFixed(1)}:1</td><td><b className={ratio >= 4.5 ? 'pass' : 'fail'}>{ratio >= 4.5 ? 'Pass' : 'Fail'}</b></td><td><b className={ratio >= 7 ? 'pass' : 'fail'}>{ratio >= 7 ? 'Pass' : 'Fail'}</b></td></tr> })}</tbody></table></section>
}

function TypeDetail({ onWeight }: { onWeight: (id: string, weight: number) => void }) {
  return <section className="type-detail tape"><p className="eyebrow olive">DISPLAY TYPEFACE</p><h2>The quick brown<br />fox.</h2><label>Display weight <select defaultValue="800" onChange={(event) => onWeight('display', Number(event.target.value))}><option value="700">700</option><option value="800">800</option></select></label><hr /><p className="eyebrow">BODY TYPEFACE · EB GARAMOND</p><h3>The quick brown fox jumps over the lazy dog.</h3><p className="reading">Typography is the foundation of digital design. It carries both the rough confidence of the direction and the quiet detail of a real field journal.</p></section>
}

function Critique() { return <aside className="critique"><h2>Creative Critique</h2><div className="score"><small>HARMONY SCORE</small><b>92<sup>%</sup></b><span>Strong cohesive direction.</span></div><p>The olive green provides excellent grounding, but consider increasing the weight of your serif headers for better hierarchy in long-form content.</p><article><small>SUGGESTION</small><p>Bump EB Garamond to Semibold (600) for H1 and H2 tags to balance the heavy display type.</p></article><h3>Imagery & Motifs</h3><ul><li>Warm natural lighting is working perfectly.</li><li>Paper textures add necessary tactile depth.</li><li>Introduce subtle tape graphics to anchor components.</li></ul><button className="quiet">↻ Generate New Alternatives</button></aside> }

function System() {
  const project = useProjectStore((state) => state.project)
  const system = project.designSystem
  return <section className="system-shell"><div className="system-doc"><header><p className="eyebrow">MOOD WORKSPACE / SYSTEM PHASE</p><h1>From inspiration<br />to system.</h1><p>A living document translating raw inspiration into scalable, functional design components.</p></header><SystemSection number="01" title="Core Tokens: Color"><div className="system-colors">{system.colors.map((color) => <div key={color.id}><i style={{ background: color.value }} /><small>{color.role}</small><b>{color.name}</b><span>{color.value}</span></div>)}</div></SystemSection><SystemSection number="02" title="Core Tokens: Typography"><div className="system-type">{system.typography.map((type) => <div key={type.id}><small>{type.role}</small><strong style={{ fontFamily: type.family }}>Aa</strong><span>{type.family}</span></div>)}<p>The typographic scale relies on tension between a brutally heavy display and elegant, refined reading moments.</p></div></SystemSection><SystemSection number="03" title="From Inspiration to System"><div className="translation"><img src={project.references[2].image} alt="Reference poster" /><article><small>TRANSLATED COMPONENT</small><h3>Primary Action Button</h3><button className="solid">Book Journey →</button><p>{system.shapeLanguage}</p></article></div></SystemSection><SystemSection number="04" title="Photography Direction"><div className="photo-row">{project.references.slice(1, 4).map((reference) => <figure key={reference.id}><img src={reference.image} alt={reference.title} /><figcaption>{reference.title}</figcaption></figure>)}</div></SystemSection><SystemSection number="05" title="Applied System"><div className="mobile-preview"><div className="mobile-top">Wanderwell <span>☰</span></div><img src={project.references[3].image} alt="Wanderwell landscape" /><div><small>System Phase</small><h3>Explore the Redwood Trail</h3><p>A 4-day immersive journey through ancient giants.</p><b>Moderate · 4 days</b></div></div></SystemSection></div><aside className="system-status"><h3>System Status</h3><p className="olive">● ACTIVE / IN SYNC</p><hr /><small>EXPORT OPTIONS</small><button>Sync to Figma ↻</button><button>Download Brand Kit ↓</button><button>View Documentation ▣</button><hr /><small>RECENT UPDATES</small><p>✓ Updated secondary button padding to 24px.</p><p>✓ Added new “Blush” background token.</p></aside></section>
}

function SystemSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <section className="system-section"><span>{number}</span><h2>{title}</h2>{children}</section> }
function TokenStrip({ title, colors }: { title?: string; colors: string[] }) { return <div className="token-strip">{title && <p>{title}</p>}<div>{colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div>{title && <button className="link-button">View palette in context →</button>}</div> }
