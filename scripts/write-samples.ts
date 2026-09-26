import { mkdir, writeFile } from 'node:fs/promises';
import { exportAiSpec, exportCodex, exportMermaid } from '../src/exporters';
import { estimateFlow } from '../src/fixtures/estimateFlow';
import { serializeDocument } from '../src/domain/schema';

await mkdir('samples', { recursive: true });
await Promise.all([
  writeFile('samples/見積作成フロー.shara.json', serializeDocument(estimateFlow), 'utf8'),
  writeFile('samples/見積作成フロー.mmd', exportMermaid(estimateFlow), 'utf8'),
  writeFile('samples/見積作成フロー.ai-spec.md', exportAiSpec(estimateFlow), 'utf8'),
  writeFile('samples/見積作成フロー.codex.md', exportCodex(estimateFlow, { mode: 'review' }), 'utf8'),
]);
