import { useEffect, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { exportAiSpec, exportCodex, exportMermaid, type CodexMode } from '../exporters';
import type { SharaDocument } from '../domain/schema';
import { copyText } from '../platform/clipboard';
import { saveTextFile } from '../platform/files';

type Tab = 'mermaid' | 'ai' | 'codex';
const modeLabels: Record<CodexMode, string> = { review: '設計レビュー', plan: '実装計画', implement: '実装依頼' };

export function OutputPanel({ document, onMessage }: { document: SharaDocument; onMessage: (tone: 'info' | 'error', text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('mermaid');
  const [mode, setMode] = useState<CodexMode>('review');
  const [repository, setRepository] = useState('');
  const [request, setRequest] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const mermaidText = useMemo(() => exportMermaid(document), [document]);
  const aiText = useMemo(() => exportAiSpec(document), [document]);
  const codexText = useMemo(() => exportCodex(document, { mode, repository, request }), [document, mode, repository, request]);
  const value = tab === 'mermaid' ? mermaidText : tab === 'ai' ? aiText : codexText;

  useEffect(() => {
    if (!open || tab !== 'mermaid' || !previewRef.current) return;
    let active = true;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', flowchart: { htmlLabels: false } });
    mermaid.render(`shara-mermaid-${document.id.replace(/[^A-Za-z0-9_]/g, '_')}`, mermaidText).then(({ svg }) => { if (active && previewRef.current) previewRef.current.innerHTML = svg; }).catch(error => { if (active && previewRef.current) previewRef.current.textContent = `Mermaid描画エラー: ${String(error)}`; });
    return () => { active = false; };
  }, [open, tab, mermaidText, document.id]);

  const copy = async (text: string, label: string) => {
    try { await copyText(text); onMessage('info', `${label}をコピーしました`); } catch (error) { onMessage('error', `コピーできませんでした: ${String(error)}`); setOpen(true); }
  };

  return <section className={`output-panel ${open ? 'is-open' : ''}`}>
    <div className="output-bar">
      <button className="output-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>{open ? '出力を閉じる' : '出力を開く'}</button>
      <span>Mermaid / AI仕様 / AI依頼文</span>
      <div className="output-actions">
        <button onClick={() => copy(mermaidText, 'Mermaid')}>Mermaidをコピー</button>
        <button className="primary" onClick={() => copy(codexText, 'AI依頼文')}>AI依頼文をコピー</button>
      </div>
    </div>
    {open && <div className="output-body">
      <nav>{(['mermaid', 'ai', 'codex'] as const).map(item => <button className={tab === item ? 'is-active' : ''} key={item} onClick={() => setTab(item)}>{item === 'mermaid' ? 'Mermaid' : item === 'ai' ? 'AI仕様' : 'AI依頼文'}</button>)}</nav>
      {tab === 'codex' && <div className="codex-options"><label>依頼モード<select value={mode} onChange={event => setMode(event.target.value as CodexMode)}>{Object.entries(modeLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>対象リポジトリ<input value={repository} onChange={event => setRepository(event.target.value)} placeholder="任意" /></label><label>追加依頼<input value={request} onChange={event => setRequest(event.target.value)} placeholder="任意" /></label></div>}
      {tab === 'mermaid' && <div className="mermaid-preview" ref={previewRef} aria-label="Mermaidプレビュー" />}
      <textarea className="output-source" readOnly value={value} aria-label="生成された出力" />
      <div className="output-save"><button onClick={() => saveTextFile(`${document.semantic.title || 'SHARA'}.${tab === 'mermaid' ? 'mmd' : 'md'}`, value)}>ファイルへ保存</button>{tab === 'mermaid' && <small>ルール・未決事項を含む全文はAI仕様を参照してください。</small>}</div>
    </div>}
  </section>;
}
