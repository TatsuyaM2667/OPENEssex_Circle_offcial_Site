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
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/">
          <img 
            src="/OpenEssex.png" 
            alt="Logo" 
            className="navbar-logo"
          />
          <span>Open Essex</span>
        </Link>
      </div>
      <div className="navbar-scroll-area">
        <ul className="navbar-links">
          <li><Link to="/timeline">タイムライン</Link></li>
          <li><Link to="/documents">課題・資料</Link></li>
          <li><Link to="/guides">ガイド</Link></li>
          <li><Link to="/books">おすすめ本</Link></li>
        </ul>
      </div>
      <div className="navbar-auth">
        {user ? (
          <div className="user-profile">
            {user.photoURL && <img src={user.photoURL} alt="User" />}
            <button onClick={handleLogout} className="btn outline-btn">
              ログアウト
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="btn btn-primary">
            {auth ? "ログイン" : "ログイン無効"}
          </button>
        )}
      </div>
    </nav>
  );
}
