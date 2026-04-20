import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Guides from './pages/Guides';
import Books from './pages/Books';
import './App.css';

// エラー境界用の簡易コンポーネント
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Rendering error:", error);
    return <div>表示エラーが発生しました。</div>;
  }
}

function ProtectedRoute({ children, isLoggedIn, isLoading }: { children: React.ReactNode, isLoggedIn: boolean, isLoading: boolean }) {
  if (isLoading) {
    return <div className="page-container" style={{ textAlign: 'center' }}><p>読み込み中...</p></div>;
  }
  if (!isLoggedIn) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h2>メンバー限定コンテンツ</h2>
        <p>このセクションにアクセスするにはログインが必要です。</p>
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/documents" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Documents /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Guides /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Books /></ProtectedRoute>} />
          </Routes>
        </ErrorBoundary>
      </main>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </Router>
  );
}

export default App;
