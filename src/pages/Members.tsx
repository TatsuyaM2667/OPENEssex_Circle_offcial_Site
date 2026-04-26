import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MemberProfile {
  uid: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  role: string;
  skills: string;
  created_at: string;
}

export default function Members() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setMembers(data as MemberProfile[]);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1>メンバー一覧</h1>
      <p className="page-subtitle">Open Essexのメンバーたち</p>

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>読み込み中...</p>
      ) : members.length === 0 ? (
        <p className="empty-state">まだメンバーが登録されていません。</p>
      ) : (
        <div className="members-grid">
          {members.map(member => (
            <Link to={`/profile/${member.uid}`} key={member.uid} className="member-card glass-panel">
              <div className="member-avatar-wrapper">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.display_name} className="member-avatar" />
                ) : (
                  <div className="member-avatar-placeholder">
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.display_name}</h3>
                <span className="member-role">{member.role}</span>
                {member.bio && <p className="member-bio">{member.bio.length > 80 ? member.bio.slice(0, 80) + '...' : member.bio}</p>}
                {member.skills && (
                  <div className="member-skills">
                    {member.skills.split(',').slice(0, 3).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
