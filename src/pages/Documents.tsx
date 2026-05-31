import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AuthorBadge from '../components/AuthorBadge';

interface Document {
  id: number;
  title: string;
  content: string;
  author: string;
  co_authors?: string;
  created_at: string;
  likes?: number;
}

export default function Documents() {
  const { userName, user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coAuthors, setCoAuthors] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<{[id: number]: boolean}>({});
  const [availableProfiles, setAvailableProfiles] = useState<{uid: string, display_name: string}[]>([]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/documents?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data as Document[]);
      } else {
        console.error('API returned non-array:', data);
        setError(`データ取得エラー: ${data?.error || '不明なエラー'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('データの取得に失敗しました。');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => setAvailableProfiles(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!userName) {
      setError('投稿するにはログインしてプロフィールを設定してください。');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (editId) {
        const res = await fetch(`/api/documents/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ action: 'edit', title, content, co_authors: coAuthors }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`更新失敗: ${errData?.error || res.statusText} ${errData?.detail || ''}`);
          return;
        }
        await fetchDocuments();
        setEditId(null);
      } else {
        const res = await fetch('/api/documents', {
          method: 'POST',
          body: JSON.stringify({ title, content, author: userName, co_authors: coAuthors }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`投稿失敗: ${errData?.error || res.statusText} ${errData?.detail || ''}`);
          return;
        }
        await fetchDocuments();
      }
      setTitle('');
      setContent('');
      setCoAuthors('');
      setShowForm(false);
    } catch (err: any) {
      setError(`エラー: ${err?.message || '不明なエラー'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setCoAuthors(doc.co_authors || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この投稿を削除してよろしいですか？')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    fetchDocuments();
  };

  const canEdit = (doc: Document) => {
    if (!userName) return false;
    if (!doc.author || doc.author === userName) return true;
    if (doc.co_authors && doc.co_authors.split(',').map(s => s.trim()).includes(userName)) return true;
    return false;
  };

  const handleLike = async (id: number) => {
    const likedKey = `liked_documents_${id}`;
    const isLiked = !!localStorage.getItem(likedKey);

    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, likes: Math.max(0, (doc.likes || 0) + (isLiked ? -1 : 1)) } : doc));
    
    if (isLiked) {
      localStorage.removeItem(likedKey);
    } else {
      localStorage.setItem(likedKey, 'true');
    }

    await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return (
    <div className="page-container">
      <h1>課題・資料</h1>
      <p className="page-subtitle">課題や公開資料の共有</p>

      {error && (
        <div className="mypage-message error" style={{ marginBottom: '1rem' }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {user ? (
        <button onClick={() => {
          setShowForm(!showForm);
          setError('');
          if (editId) { setEditId(null); setTitle(''); setContent(''); setCoAuthors(''); }
        }} className="btn btn-primary" style={{ marginBottom: '2rem' }}>
          {showForm ? 'キャンセル' : '新規投稿'}
        </button>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>投稿するにはログインしてください。</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="post-form glass-panel">
          <div className="form-group row">
            <input type="text" placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} required className="input-field" />
            <div className="auto-author-badge">投稿者: {userName || '未設定'}</div>
          </div>
          <input type="text" placeholder="共同投稿者の表示名（カンマ区切り。例: user1, user2）" value={coAuthors} onChange={e => setCoAuthors(e.target.value)} className="input-field" style={{ marginBottom: '0.5rem' }} />
          {availableProfiles.length > 0 && (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>追加できるユーザー:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                {availableProfiles
                  .filter(p => p.display_name !== userName && !coAuthors.split(',').map(s=>s.trim()).includes(p.display_name))
                  .filter(p => {
                     const parts = coAuthors.split(',');
                     const currentInput = parts[parts.length - 1].trim().toLowerCase();
                     return currentInput ? p.display_name.toLowerCase().includes(currentInput) : true;
                  })
                  .map(p => (
                  <button
                    key={p.uid}
                    type="button"
                    onClick={() => {
                      const parts = coAuthors.split(',');
                      parts.pop();
                      const newCoAuthors = [...parts.map(s => s.trim()).filter(Boolean), p.display_name].join(', ');
                      setCoAuthors(newCoAuthors ? newCoAuthors + ', ' : newCoAuthors);
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', cursor: 'pointer' }}
                  >
                    + {p.display_name}
                  </button>
                ))}
              </div>
            </>
          )}
          <textarea placeholder="内容・説明（Markdown対応）" value={content} onChange={e => setContent(e.target.value)} required rows={10} className="input-field" />
          <p style={{ fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>※Markdown記法（# 見出し, * リスト, **太字** など）が使えます</p>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? '処理中...' : editId ? '変更を保存' : '投稿する'}
          </button>
        </form>
      )}

      <div className="list-container">
        {documents.length === 0 ? <p>投稿はまだありません。</p> : documents.map(doc => {
          const isExpanded = !!expandedItems[doc.id];
          const TRUNCATE_LENGTH = 150;
          const needsTruncation = doc.content.length > TRUNCATE_LENGTH;
          const displayContent = isExpanded || !needsTruncation ? doc.content : doc.content.slice(0, TRUNCATE_LENGTH) + '...';

          return (
          <div key={doc.id} className="card glass-panel">
            <h2>{doc.title}</h2>
            <div className="meta" style={{ marginBottom: '1rem' }}>
              <AuthorBadge author={doc.author} date={doc.created_at} coAuthors={doc.co_authors} />
            </div>
            <div className="content" style={{ padding: '1rem 0' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              {needsTruncation && (
                <button 
                  onClick={() => setExpandedItems(prev => ({ ...prev, [doc.id]: !isExpanded }))} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, marginTop: '0.5rem', fontWeight: 'bold' }}
                >
                  {isExpanded ? '▲ 折りたたむ' : '▼ 続きを読む'}
                </button>
              )}
            </div>

            <div className="timeline-actions">
              <button className={`btn btn-like ${localStorage.getItem(`liked_documents_${doc.id}`) ? 'liked' : ''}`} onClick={() => handleLike(doc.id)}>
                <span className="icon">♥</span> {doc.likes || 0}
              </button>
              {canEdit(doc) && (
                <>
                  <div className="spacer"></div>
                  <button className="btn btn-edit" onClick={() => handleEdit(doc)}>編集</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(doc.id)}>削除</button>
                </>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
