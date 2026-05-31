import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

interface ProfileData {
  uid: string;
  display_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  role: string;
  skills: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  created_at: string;
}

export default function Profile() {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uid) return;
    fetch(`/api/profiles/${uid}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          setIsLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data as ProfileData);
        setIsLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setIsLoading(false);
      });
  }, [uid]);

  if (isLoading)
    return (
      <div className="page-container">
        <p>読み込み中...</p>
      </div>
    );
  if (notFound || !profile) {
    return (
      <div className="page-container" style={{ textAlign: "center" }}>
        <h2>プロフィールが見つかりません</h2>
        <p>このユーザーはまだプロフィールを作成していません。</p>
        <Link
          to="/members"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          メンバー一覧へ
        </Link>
      </div>
    );
  }

  const skillsList = profile.skills
    ? profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="page-container profile-page">
      <div className="profile-header glass-panel">
        <div className="profile-banner"></div>
        <div className="profile-main-info">
          <div className="profile-avatar-large-wrapper">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="profile-avatar-large"
              />
            ) : (
              <div className="profile-avatar-large-placeholder">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-identity">
            <h1>{profile.display_name}</h1>
            <span className="profile-role-badge">{profile.role}</span>
            <p className="profile-join-date">
              参加日: {new Date(profile.created_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>
      </div>

      <div className="profile-body">
        {profile.bio && (
          <div className="profile-section glass-panel">
            <h3>自己紹介</h3>
            <p>{profile.bio}</p>
          </div>
        )}

        {skillsList.length > 0 && (
          <div className="profile-section glass-panel">
            <h3>スキル（資格やプログラミング言語など）</h3>
            <div className="profile-skills">
              {skillsList.map((skill, i) => (
                <span key={i} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {(profile.linkedin_url ||
          profile.github_url ||
          profile.website_url) && (
          <div className="profile-section glass-panel">
            <h3>リンク</h3>
            <div className="profile-links">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link-btn"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link-btn"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link-btn"
                >
                  🌐 Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/members" className="btn outline-btn">
          ← メンバー一覧に戻る
        </Link>
      </div>
    </div>
  );
}
