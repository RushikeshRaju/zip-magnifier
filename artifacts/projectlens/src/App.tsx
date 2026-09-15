import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react';
import JSZip from 'jszip';
import {
  AlertTriangle,
  Archive,
  Binary,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  File,
  FileCode2,
  FileImage,
  Folder,
  FolderOpen,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

type AppStatus = 'empty' | 'extracting' | 'ready' | 'error';
type ViewKind = 'text' | 'image' | 'binary';

type TreeNode = {
  id: string;
  name: string;
  path: string;
  kind: 'folder' | 'file';
  children: TreeNode[];
  entry?: JSZip.JSZipObject;
  size?: number;
};

type SelectedView = {
  node: TreeNode;
  kind: ViewKind;
  text?: string;
  url?: string;
  bytes: number;
  mediaType?: string;
};

const TEXT_EXTENSIONS = new Set([
  'asm', 'astro', 'bash', 'c', 'cc', 'clj', 'cljs', 'cmake', 'config', 'cpp', 'cs', 'css',
  'csv', 'dart', 'env', 'ex', 'exs', 'fish', 'go', 'graphql', 'h', 'hbs', 'hpp', 'htm',
  'html', 'ini', 'java', 'js', 'jsx', 'json', 'jsonc', 'kt', 'less', 'lock', 'lua', 'md',
  'mjs', 'mts', 'php', 'pl', 'properties', 'py', 'rb', 'rs', 'sass', 'scss', 'sh', 'sql',
  'svelte', 'swift', 'toml', 'ts', 'tsx', 'txt', 'vue', 'xml', 'yaml', 'yml', 'zsh',
]);

const IMAGE_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

const KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default',
  'def', 'delete', 'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
  'if', 'import', 'in', 'interface', 'let', 'new', 'null', 'of', 'package', 'private',
  'protected', 'public', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true',
  'try', 'type', 'undefined', 'var', 'void', 'while', 'with', 'yield',
]);

const rootNode = (): TreeNode => ({ id: 'root', name: '', path: '', kind: 'folder', children: [] });

function cleanPath(raw: string) {
  const normalized = raw.replaceAll('\\', '/').replace(/^\/+/, '');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.some((part) => part === '..')) return null;
  return parts.join('/');
}

function makeTree(zip: JSZip) {
  const root = rootNode();
  const byPath = new Map<string, TreeNode>([['', root]]);
  let fileCount = 0;
  let totalBytes = 0;

  const isArchiveNoise = (path: string) => {
    const firstPart = path.split('/')[0]?.toLowerCase();
    return firstPart === '__macosx' || path.toLowerCase() === '.ds_store';
  };

  const ensureFolder = (path: string) => {
    if (byPath.has(path)) return byPath.get(path) as TreeNode;
    const parts = path.split('/');
    const parentPath = parts.slice(0, -1).join('/');
    const parent = ensureFolder(parentPath);
    const node: TreeNode = { id: `folder:${path}`, name: parts.at(-1) ?? path, path, kind: 'folder', children: [] };
    parent.children.push(node);
    byPath.set(path, node);
    return node;
  };

  (Object.values(zip.files) as JSZip.JSZipObject[]).forEach((entry) => {
    const path = cleanPath(entry.name);
    if (!path || isArchiveNoise(path)) return;
    const isFolder = entry.dir || entry.name.endsWith('/');
    if (isFolder) {
      ensureFolder(path);
      return;
    }
    const parts = path.split('/');
    const parent = ensureFolder(parts.slice(0, -1).join('/'));
    const node: TreeNode = {
      id: `file:${path}`,
      name: parts.at(-1) ?? path,
      path,
      kind: 'file',
      children: [],
      entry,
    };
    parent.children.push(node);
    byPath.set(path, node);
    fileCount += 1;
    totalBytes += entrySize(entry);
  });

  const sortTree = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    node.children.forEach(sortTree);
  };
  sortTree(root);
  return { root, fileCount, totalBytes };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes > 100 * 1024 ? 0 : 1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(name: string) {
  return name.includes('.') ? name.split('.').at(-1)?.toLowerCase() ?? '' : '';
}

function entrySize(entry: JSZip.JSZipObject) {
  return (entry as JSZip.JSZipObject & { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
}

function isProbablyText(name: string, bytes: Uint8Array) {
  if (TEXT_EXTENSIONS.has(extension(name))) return true;
  const sample = bytes.subarray(0, Math.min(bytes.length, 4096));
  return !sample.some((byte) => byte === 0);
}

function tokenizeLine(line: string) {
  const tokenPattern = /("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\/\/.*$|#.*$|\/\*.*?\*\/|<\/?[A-Za-z][^>]*>|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  const chunks: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(line)) !== null) {
    if (match.index > lastIndex) chunks.push(line.slice(lastIndex, match.index));
    const token = match[0];
    let className = '';
    if (token.startsWith('//') || token.startsWith('#') || token.startsWith('/*')) className = 'tok-comment';
    else if (/^["'`]/.test(token)) className = 'tok-string';
    else if (/^<\/?[A-Za-z]/.test(token)) className = 'tok-tag';
    else if (/^\d/.test(token)) className = 'tok-number';
    else if (KEYWORDS.has(token)) className = 'tok-keyword';
    else if (/^[A-Za-z_$]/.test(token) && /\s*\(/.test(line.slice(match.index + token.length))) className = 'tok-function';
    chunks.push(className ? <span className={className} key={`${match.index}-${token}`}>{token}</span> : token);
    lastIndex = match.index + token.length;
  }
  if (lastIndex < line.length) chunks.push(line.slice(lastIndex));
  return chunks.length ? chunks : ' ';
}

function fileIcon(name: string) {
  const ext = extension(name);
  if (IMAGE_TYPES[ext]) return <FileImage size={14} strokeWidth={1.7} />;
  if (TEXT_EXTENSIONS.has(ext)) return <FileCode2 size={14} strokeWidth={1.7} />;
  return <File size={14} strokeWidth={1.7} />;
}

function hasMatch(node: TreeNode, query: string): boolean {
  if (!query) return true;
  if (node.name.toLowerCase().includes(query)) return true;
  return node.children.some((child) => hasMatch(child, query));
}

function Tree({
  node,
  depth,
  query,
  expanded,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  query: string;
  expanded: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode) => void;
}) {
  return (
    <>
      {node.children.map((child) => {
        if (!hasMatch(child, query)) return null;
        const isOpen = query.length > 0 || expanded.has(child.id);
        const isFolder = child.kind === 'folder';
        return (
          <div key={child.id}>
            <button
              className={`tree-row ${isFolder ? 'is-folder' : ''} ${selectedId === child.id ? 'is-selected' : ''}`}
              style={{ paddingLeft: 9 + depth * 14 }}
              onClick={() => (isFolder ? onToggle(child.id) : onSelect(child))}
              data-testid={`${isFolder ? 'button-folder' : 'button-file'}-${child.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
              aria-expanded={isFolder ? isOpen : undefined}
              title={child.path}
            >
              {isFolder ? (isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 13 }} />}
              {isFolder ? (isOpen ? <FolderOpen size={14} /> : <Folder size={14} />) : fileIcon(child.name)}
              <span className="tree-label">{child.name}</span>
              {!isFolder && <span className="tree-kind">{extension(child.name)}</span>}
            </button>
            {isFolder && isOpen && (
              <Tree node={child} depth={depth + 1} query={query} expanded={expanded} selectedId={selectedId} onToggle={onToggle} onSelect={onSelect} />
            )}
          </div>
        );
      })}
    </>
  );
}

function UploadPrompt({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const chooseFile = () => inputRef.current?.click();
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };
  return (
    <div
      className={`drop-zone ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      data-testid="drop-zone-upload"
    >
      <div className="drop-inner">
        <div className="drop-icon"><Upload size={20} /></div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <p className="drop-title">{dragging ? 'Release to inspect this ZIP' : 'Drop a project ZIP here'}</p>
          <p className="drop-subtitle">Everything stays in this browser tab.</p>
        </div>
        <button className="upload-button" onClick={chooseFile} data-testid="button-choose-zip">
          Choose ZIP
        </button>
      </div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
        data-testid="input-zip-file"
      />
    </div>
  );
}

function App() {
  const [status, setStatus] = useState<AppStatus>('empty');
  const [projectName, setProjectName] = useState('');
  const [tree, setTree] = useState<TreeNode>(rootNode());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<SelectedView | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [extractionPhase, setExtractionPhase] = useState('Reading archive');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ files: 0, bytes: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  const nodeMap = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const visit = (node: TreeNode) => {
      map.set(node.id, node);
      node.children.forEach(visit);
    };
    visit(tree);
    return map;
  }, [tree]);

  const reset = useCallback(() => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setStatus('empty');
    setProjectName('');
    setTree(rootNode());
    setSelectedId(null);
    setSelectedView(null);
    setExpanded(new Set());
    setQuery('');
    setError('');
    setStats({ files: 0, bytes: 0 });
    setLastFile(null);
    setDrawerOpen(false);
    setCopied(false);
  }, []);

  const extractZip = useCallback(async (file: File) => {
    setLastFile(file);
    setStatus('extracting');
    setExtractionPhase('Reading archive');
    setError('');
    setSelectedView(null);
    setSelectedId(null);
    try {
      if (!file.name.toLowerCase().endsWith('.zip')) throw new Error('Zip Magnifier only opens .zip archives.');
      const zip = await JSZip.loadAsync(file, { checkCRC32: false });
      setExtractionPhase('Building file tree');
      const result = makeTree(zip);
      if (!result.fileCount) throw new Error('This archive does not contain any files.');
      setProjectName(file.name.replace(/\.zip$/i, ''));
      setTree(result.root);
      setStats({ files: result.fileCount, bytes: result.totalBytes });
      const firstFolder = result.root.children.find((child) => child.kind === 'folder');
      setExpanded(firstFolder ? new Set([firstFolder.id]) : new Set());
      setExtractionPhase('Ready');
      setStatus('ready');
      setDrawerOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The archive could not be read.');
      setStatus('error');
    }
  }, []);

  const openNode = useCallback(async (node: TreeNode) => {
    if (!node.entry) return;
    setSelectedId(node.id);
    setDrawerOpen(false);
    setCopied(false);
    setFileLoading(true);
    try {
      const bytes = await node.entry.async('uint8array');
      const ext = extension(node.name);
      const mediaType = IMAGE_TYPES[ext];
      if (mediaType) {
        if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
        const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: mediaType }));
        imageUrlRef.current = url;
        setSelectedView({ node, kind: 'image', url, bytes: bytes.byteLength, mediaType });
      } else if (isProbablyText(node.name, bytes)) {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        setSelectedView({ node, kind: 'text', text, bytes: bytes.byteLength });
      } else {
        setSelectedView({ node, kind: 'binary', bytes: bytes.byteLength });
      }
    } catch {
      setSelectedView({ node, kind: 'binary', bytes: entrySize(node.entry) });
    } finally {
      setFileLoading(false);
    }
  }, []);

  const copyFileContent = useCallback(async () => {
    if (!selectedView?.text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selectedView.text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = selectedView.text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [selectedView]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
  }, []);

  const toggleFolder = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderReader = () => {
    if (fileLoading) {
      return (
        <div className="extracting" data-testid="status-reading-file">
          <div className="extracting-mark"><FileCode2 size={20} /></div>
          <h2>Reading file</h2>
          <p>Decoding bytes locally for a safe preview.</p>
          <div className="progress-track"><div className="progress-bar" /></div>
        </div>
      );
    }
    if (status === 'empty') {
      return (
        <div className="welcome" data-testid="state-empty">
          <div className="welcome-copy-block">
            <div className="welcome-kicker">A quiet place to inspect code</div>
            <h1>Open a project.<br /><span>See what’s inside.</span></h1>
            <p className="welcome-copy">Zip Magnifier turns a ZIP into a readable file tree, right here in your browser. No account, no setup, no surprises.</p>
          </div>
          <UploadPrompt onFile={extractZip} />
          <div className="trust-row">
            <span className="trust-item"><ShieldCheck size={13} /> Local-only processing</span>
            <span className="trust-item"><Check size={13} /> Read-only by design</span>
            <span className="trust-item"><Code2 size={13} /> Source stays intact</span>
          </div>
        </div>
      );
    }
    if (!selectedView) {
      return (
        <div className="project-ready" data-testid="state-project-ready">
          <div className="project-ready-mark"><Archive size={20} /></div>
          <div className="welcome-kicker">Project ready to explore</div>
          <h1>Select a file to read it.</h1>
          <p>Choose a file from the explorer. Its contents will open here as a read-only preview, processed locally in your browser.</p>
          <div className="project-ready-meta">
            <span><Check size={13} /> {stats.files} files indexed</span>
            <span><ShieldCheck size={13} /> Nothing uploaded</span>
          </div>
        </div>
      );
    }
    const lines = selectedView.text?.split(/\r?\n/) ?? [];
    return (
      <div className="reader-inner" data-testid={`state-selected-file-${selectedView.node.id.replace(/[^a-zA-Z0-9]/g, '-')}`}>
        <div className="file-head">
          <div className="file-heading">
            <div className="file-type">{selectedView.kind === 'text' ? `${extension(selectedView.node.name) || 'text'} source` : selectedView.kind === 'image' ? 'image preview' : 'binary file'}</div>
            <h1 className="file-title" data-testid="text-selected-filename">{selectedView.node.name}</h1>
            <div className="file-path" data-testid="text-selected-path">{selectedView.node.path}</div>
          </div>
          <div className="file-size">{formatBytes(selectedView.bytes)}</div>
        </div>
        {selectedView.kind === 'text' && (
          <div className="code-view">
            <div className="code-toolbar">
              <span>{lines.length} lines</span>
              <button className="copy-button" onClick={copyFileContent} aria-label="Copy file contents" data-testid="button-copy-file">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="code-shell" data-testid="code-preview">
              <table className="code-table">
                <tbody>
                  {lines.map((line, index) => (
                    <tr className="code-row" key={index}>
                      <td className="line-number">{index + 1}</td>
                      <td className="code-text">{tokenizeLine(line)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedView.kind === 'image' && (
          <div className="image-preview" data-testid="image-preview">
            <img src={selectedView.url} alt={`Preview of ${selectedView.node.name}`} />
          </div>
        )}
        {selectedView.kind === 'binary' && (
          <div className="binary-preview" data-testid="binary-preview">
            <Binary size={32} className="binary-icon" />
            <h3>No readable preview for this file</h3>
            <p>This binary is safe to inspect, but Zip Magnifier does not execute or modify uploaded files.</p>
          </div>
        )}
        <div className="file-footer"><ShieldCheck size={13} /> Previewed locally · never executed</div>
      </div>
    );
  };

  const explorer = (
    <aside className={`explorer ${drawerOpen ? 'is-open' : ''}`} aria-label="Project explorer">
      <div className="explorer-head">
        <div className="eyebrow">Explorer</div>
        <div className="explorer-title">
          <h2 data-testid="text-project-name">{projectName || 'No project open'}</h2>
        </div>
        {status === 'ready' && <div className="project-meta" data-testid="text-project-stats">{stats.files} files · {formatBytes(stats.bytes)}</div>}
        {status === 'ready' && (
          <label className="search-wrap">
            <Search size={14} />
            <span className="sr-only">Filter files</span>
            <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value.toLowerCase())} placeholder="Filter files" data-testid="input-filter-files" />
          </label>
        )}
      </div>
      {status === 'ready' ? (
        <div className="tree-scroll" data-testid="project-tree">
          <Tree node={tree} depth={0} query={query} expanded={expanded} selectedId={selectedId} onToggle={toggleFolder} onSelect={openNode} />
          {!tree.children.some((child) => hasMatch(child, query)) && <div className="empty-tree">No paths match “{query}”.</div>}
        </div>
      ) : (
        <div className="empty-tree">Your project tree will appear here after extraction.</div>
      )}
    </aside>
  );

  return (
    <div className="lens-app">
      <header className="topbar">
        <div className="top-actions">
          <button
            className="icon-button mobile-menu"
            onClick={() => setDrawerOpen((open) => !open)}
            aria-label={drawerOpen ? 'Close project explorer' : 'Open project explorer'}
            aria-expanded={drawerOpen}
            data-testid="button-open-explorer"
          >
            <Menu size={19} />
          </button>
          <a className="brand" href="/" data-testid="link-projectlens-home">
            <span className="brand-mark"><Archive size={15} /></span>
            <span className="brand-name">Zip Magnifier</span>
            <span className="brand-meta">browser utility</span>
          </a>
        </div>
        <div className="top-actions">
          <div className="local-badge" data-testid="status-local-only"><span className="local-dot" /> Local only</div>
          {status === 'ready' && <button className="new-zip-button" onClick={reset} data-testid="button-new-zip">New ZIP</button>}
        </div>
      </header>
      <div className="workspace">
        {explorer}
        {drawerOpen && <button className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Close explorer" data-testid="button-close-explorer" />}
        <main className="content">
          <div className="content-bar">
            <Code2 size={14} />
            {status === 'ready' ? <><span>project</span><span>/</span><span className="crumb-current">{selectedView?.node.path ?? 'select a file'}</span></> : <span>workspace / waiting for a ZIP</span>}
          </div>
          <div className="reader">
            {status === 'extracting' && (
              <div className="extracting" data-testid="state-extracting">
                <div className="extracting-mark"><Archive size={20} /></div>
                <h2>Opening your project</h2>
                <p>Reading the archive locally. Nothing is sent anywhere.</p>
                 <div className="progress-track" aria-label={extractionPhase}><div className="progress-bar" /></div>
                 <div className="file-footer" style={{ justifyContent: 'center' }}>{extractionPhase}</div>
              </div>
            )}
            {status === 'error' && (
              <div className="error-state" data-testid="state-error">
                <div className="error-mark"><AlertTriangle size={20} /></div>
                <h2>That ZIP could not be opened</h2>
                <p>Zip Magnifier reads standard ZIP archives in your browser. Try a different file or export the project again.</p>
                <div className="error-detail" data-testid="text-error-detail">{error}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 9 }}>
                  <button className="secondary-button" onClick={reset} data-testid="button-reset-error"><RotateCcw size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Try another</button>
                  {lastFile && <button className="secondary-button" onClick={() => extractZip(lastFile)} data-testid="button-retry-extraction">Retry</button>}
                </div>
              </div>
            )}
            {(status === 'empty' || status === 'ready') && renderReader()}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;