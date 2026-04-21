import { Link } from 'react-router-dom';
import { signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogin = async () => {
    if (!auth) {
      alert("Firebaseの設定が完了していないため、ログイン機能は利用できません。");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <nav className="navbar glass-panel" style={{ margin: '1rem auto', padding: '1rem 2rem', borderRadius: '100px', width: 'calc(100% - 40px)', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
      <div className="navbar-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text-h)', fontWeight: '700', fontSize: '1.2rem' }}>
          <img 
            src="/OpenEssex.png" 
            alt="Logo" 
            style={{ 
              height: '40px', 
              width: '40px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              objectPosition: 'center 15%',
              border: '2px solid var(--brand-red)'
            }} 
          />
          <span>Open Essex</span>
        </Link>
      </div>
      <ul className="navbar-links" style={{ display: 'flex', listStyle: 'none', gap: '1.5rem', alignItems: 'center', margin: 0, padding: 0 }}>
        <li><Link to="/timeline" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: '600' }}>タイムライン</Link></li>
        <li><Link to="/documents" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: '600' }}>課題・資料</Link></li>
        <li><Link to="/guides" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: '600' }}>ガイド</Link></li>
        <li><Link to="/books" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: '600' }}>おすすめ本</Link></li>
        <li>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.photoURL && <img src={user.photoURL} alt="User" style={{ width: '32px', borderRadius: '50%', border: '2px solid var(--brand-orange)' }} />}
              <button onClick={handleLogout} className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                ログアウト
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              {auth ? "ログイン" : "ログイン無効"}
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
