import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        if (window.scrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <nav className={`navbar glass-panel ${!isVisible ? 'navbar-hidden' : ''}`}>
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
          <li><Link to="/projects">企画</Link></li>
          <li><Link to="/guides">ガイド</Link></li>
          <li><Link to="/books">おすすめ本</Link></li>
          <li><Link to="/members">メンバー</Link></li>
        </ul>
      </div>
      <div className="navbar-auth">
        {user ? (
          <div className="user-profile">
            <Link to="/mypage" className="user-avatar-link">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" />
              ) : (
                <div className="user-avatar-mini">{(user.displayName || user.email || '?').charAt(0).toUpperCase()}</div>
              )}
            </Link>
            <button onClick={handleLogout} className="btn outline-btn">
              ログアウト
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">
            ログイン
          </Link>
        )}
      </div>
    </nav>
  );
}
