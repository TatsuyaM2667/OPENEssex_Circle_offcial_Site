import { Link } from 'react-router-dom';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/OpenEssex.png" 
            alt="Logo" 
            style={{ 
              height: '35px', 
              width: '35px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              objectPosition: 'center 15%',
              border: '2px solid var(--accent)'
            }} 
          />
          <span>Open Essex</span>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/documents">課題・資料</Link></li>
        <li><Link to="/guides">ガイド</Link></li>
        <li><Link to="/books">おすすめ本</Link></li>
        <li>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.photoURL && <img src={user.photoURL} alt="User" style={{ width: '30px', borderRadius: '50%' }} />}
              <button onClick={handleLogout} className="login-button">
                ログアウト
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="login-button">
              メンバーログイン
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
