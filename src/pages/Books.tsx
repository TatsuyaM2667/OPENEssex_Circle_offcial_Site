import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AuthorBadge from '../components/AuthorBadge';
import MemberSuggestInput from '../components/MemberSuggestInput';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  poster?: string;
  co_authors?: string;
  link?: string;
  created_at: string;
  likes?: number;
}

export default function Books() {
  const { userName, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [coAuthors, setCoAuthors] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<{[id: number]: boolean}>({});
  const [membersList, setMembersList] = useState<string[]>([]);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/books?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBooks(data as Book[]);
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
    fetchBooks();
    fetch('/api/profiles')
      .then(res => res.json())
      .then((data: any[]) => setMembersList(data.map(p => p.display_name).filter(Boolean)))
      .catch(console.error);
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
        const res = await fetch(`/api/books/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ action: 'edit', title, description, co_authors: coAuthors }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`更新失敗: ${errData?.error || res.statusText} ${errData?.detail || ''}`);
          return;
        }
        await fetchBooks();
        setEditId(null);
      } else {
        const res = await fetch('/api/books', {
          method: 'POST',
          body: JSON.stringify({ title, author: bookAuthor, description, link, poster: userName, co_authors: coAuthors }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`投稿失敗: ${errData?.error || res.statusText} ${errData?.detail || ''}`);
          return;
        }
        await fetchBooks();
      }
      setTitle('');
      setBookAuthor('');
      setDescription('');
      setLink('');
      setCoAuthors('');
      setShowForm(false);
    } catch (err: any) {
      setError(`エラー: ${err?.message || '不明なエラー'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditId(book.id);
    setTitle(book.title);
    setBookAuthor(book.author);
    setDescription(book.description);
    setLink(book.link || '');
    setCoAuthors(book.co_authors || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このおすすめ本を削除してよろしいですか？')) return;
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  const canEdit = (book: Book) => {
    if (!userName) return false;
    if (!book.poster || book.poster === userName) return true;
    if (book.co_authors && book.co_authors.split(',').map(s => s.trim()).includes(userName)) return true;
    return false;
  };

  const handleLike = async (id: number) => {
    const likedKey = `liked_books_${id}`;
    const isLiked = !!localStorage.getItem(likedKey);

    setBooks(prev => prev.map(book => book.id === id ? { ...book, likes: Math.max(0, (book.likes || 0) + (isLiked ? -1 : 1)) } : book));
    
    if (isLiked) {
      localStorage.removeItem(likedKey);
    } else {
      localStorage.setItem(likedKey, 'true');
    }

    await fetch(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return (
    <div className="page-container">
      <h1>おすすめ本</h1>
      <p className="page-subtitle">おすすめの本を共有</p>

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
          if (editId) { setEditId(null); setTitle(''); setBookAuthor(''); setDescription(''); setLink(''); setCoAuthors(''); }
        }} className="btn btn-primary" style={{ marginBottom: '2rem' }}>
          {showForm ? 'キャンセル' : '本を推薦する'}
        </button>
      ) : (
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>投稿するにはログインしてください。</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="post-form glass-panel">
          <div className="auto-author-badge" style={{ marginBottom: '1rem' }}>推薦者: {userName || '未設定'}</div>
          <input type="text" placeholder="本のタイトル" value={title} onChange={e => setTitle(e.target.value)} required className="input-field" />
          {!editId && <input type="text" placeholder="著者名" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} required className="input-field" />}
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>共同推薦者</label>
          <MemberSuggestInput
            value={coAuthors}
            onChange={setCoAuthors}
            members={membersList}
            placeholder="共同推薦者の表示名（カンマ区切り。例: user1, user2）"
            multiple
          />
          <textarea placeholder="推薦理由・説明（Markdown対応）" value={description} onChange={e => setDescription(e.target.value)} required rows={8} className="input-field" />
          {!editId && <input type="url" placeholder="関連リンク (URL)" value={link} onChange={e => setLink(e.target.value)} className="input-field" />}
          <p style={{ fontSize: '0.8rem', margin: '-0.5rem 0 1rem', color: 'var(--text-muted)' }}>※Markdown記法が使えます</p>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? '処理中...' : editId ? '変更を保存' : '推薦を投稿する'}
          </button>
        </form>
      )}

      <div className="list-container">
        {books.length === 0 ? <p>推薦された本はまだありません。</p> : books.map(book => {
          const isExpanded = !!expandedItems[book.id];
          const TRUNCATE_LENGTH = 150;
          const needsTruncation = book.description.length > TRUNCATE_LENGTH;
          const displayContent = isExpanded || !needsTruncation ? book.description : book.description.slice(0, TRUNCATE_LENGTH) + '...';

          return (
          <div key={book.id} className="card glass-panel">
            <h2>{book.title}</h2>
            <p className="meta" style={{ marginBottom: '0.5rem' }}>著者: {book.author}</p>
            <div className="meta" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>推薦者:</span>
               <AuthorBadge author={book.poster || ''} date={book.created_at} coAuthors={book.co_authors} />
            </div>
            <div className="content" style={{ padding: '1rem 0', marginBottom: '1rem' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              {needsTruncation && (
                <button 
                  onClick={() => setExpandedItems(prev => ({ ...prev, [book.id]: !isExpanded }))} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, marginTop: '0.5rem', fontWeight: 'bold' }}
                >
                  {isExpanded ? '▲ 折りたたむ' : '▼ 続きを読む'}
                </button>
              )}
            </div>

            {book.link && (
              <a href={book.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', fontSize: '0.9rem', padding: '0.6rem 1.2rem', marginBottom: '1rem' }}>
                詳細を見る 🔗
              </a>
            )}

            <div className="timeline-actions">
              <button className={`btn btn-like ${localStorage.getItem(`liked_books_${book.id}`) ? 'liked' : ''}`} onClick={() => handleLike(book.id)}>
                <span className="icon">♥</span> {book.likes || 0}
              </button>
              {canEdit(book) && (
                <>
                  <div className="spacer"></div>
                  <button className="btn btn-edit" onClick={() => handleEdit(book)}>編集</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(book.id)}>削除</button>
                </>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
