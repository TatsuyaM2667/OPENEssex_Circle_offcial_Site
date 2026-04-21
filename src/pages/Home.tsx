import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src="/OpenEssex.png" alt="Open Essex Logo" className="brand-logo shadow-effect" />
        </div>
        <div className="hero-text-container">
          <h1 className="gradient-text">Open Essex メンバー限定サイト</h1>
          <p className="subtitle">知識共有とコミュニティの成長のための限定プラットフォーム。</p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>セクション</h2>
          <p>コンテンツ一覧</p>
          <ul className="member-nav-links">
            <li><Link to="/timeline" className="link-button premium-button"><span className="btn-icon">📰</span>最新情報・タイムライン</Link></li>
            <li><Link to="/documents" className="link-button"><span className="btn-icon">📁</span>課題・資料ポータル</Link></li>
            <li><Link to="/guides" className="link-button"><span className="btn-icon">🧭</span>エキスパートガイド</Link></li>
            <li><Link to="/books" className="link-button"><span className="btn-icon">📚</span>おすすめ本</Link></li>
          </ul>
        </div>
      </section>
    </>
  );
}
