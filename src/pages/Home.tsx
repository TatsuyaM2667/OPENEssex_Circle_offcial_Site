import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <div className="brand-logo-placeholder">OE</div>
        </div>
        <div>
          <h1>Welcome to Open Essex</h1>
          <p>The exclusive platform for knowledge sharing and community growth.</p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Member Sections</h2>
          <p>Explore our exclusive content</p>
          <ul className="member-nav-links">
            <li><Link to="/documents" className="link-button">Document Portal</Link></li>
            <li><Link to="/guides" className="link-button">Expert Guides</Link></li>
            <li><Link to="/books" className="link-button">Book Club</Link></li>
          </ul>
        </div>
      </section>
    </>
  );
}
