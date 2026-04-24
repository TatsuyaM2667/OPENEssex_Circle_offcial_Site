import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Guides from './pages/Guides';
import Books from './pages/Books';
import Timeline from './pages/Timeline';
import Projects from './pages/Projects';
import Login from './pages/Login';
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
  if (isLoading) return <div className="page-container"><p>認証状態を確認中...</p></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
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
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/documents" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Documents /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Guides /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Books /></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Timeline /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute isLoggedIn={!!user} isLoading={isLoading}><Projects /></ProtectedRoute>} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </Router>
  );
}

export default App;

