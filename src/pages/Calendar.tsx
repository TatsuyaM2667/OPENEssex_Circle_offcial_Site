import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  color: string;
  author_uid: string;
  author_name: string;
  author_avatar: string;
  created_at: string;
}

const EVENT_COLORS = [
  { value: '#ff4766', label: 'レッド' },
  { value: '#ff8e52', label: 'オレンジ' },
  { value: '#6366f1', label: 'パープル' },
  { value: '#10b981', label: 'グリーン' },
  { value: '#3b82f6', label: 'ブルー' },
  { value: '#f59e0b', label: 'イエロー' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#8b5cf6', label: 'ヴァイオレット' },
];

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Calendar() {
  const { user, userName, userAvatar } = useAuth();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventColor, setEventColor] = useState('#ff4766');

  // Animation state
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const fetchEvents = async (year: number, month: number) => {
    try {
      const res = await fetch(
        `/api/calendar?year=${year}&month=${month + 1}&t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data as CalendarEvent[]);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    }
  };

  useEffect(() => {
    fetchEvents(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.event_date]) map[ev.event_date] = [];
      map[ev.event_date].push(ev);
    });
    return map;
  }, [events]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setSlideDirection('right');
    setTimeout(() => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
      setSelectedDate(null);
      setSlideDirection(null);
    }, 200);
  };

  const nextMonth = () => {
    setSlideDirection('left');
    setTimeout(() => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
      setSelectedDate(null);
      setSlideDirection(null);
    }, 200);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day);
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
    setShowForm(false);
    setEditId(null);
  };

  const openNewEventForm = (dateStr?: string) => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setEventDate(dateStr || selectedDate || formatDate(currentYear, currentMonth, 1));
    setStartTime('');
    setEndTime('');
    setEventColor('#ff4766');
    setShowForm(true);
    setError('');
  };

  const handleEdit = (ev: CalendarEvent) => {
    setEditId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description);
    setEventDate(ev.event_date);
    setStartTime(ev.start_time);
    setEndTime(ev.end_time);
    setEventColor(ev.color || '#ff4766');
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この予定を削除してよろしいですか？')) return;
    try {
      await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
      fetchEvents(currentYear, currentMonth);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!user || !userName) {
      setError('投稿するにはログインしてプロフィールを設定してください。');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editId) {
        const res = await fetch(`/api/calendar/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            color: eventColor,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`更新失敗: ${errData?.error || res.statusText}`);
          return;
        }
      } else {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            color: eventColor,
            author_uid: user.uid,
            author_name: userName,
            author_avatar: userAvatar || '',
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(`投稿失敗: ${errData?.error || res.statusText}`);
          return;
        }
      }

      await fetchEvents(currentYear, currentMonth);
      setShowForm(false);
      setEditId(null);
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
    } catch (err: any) {
      setError(`エラー: ${err?.message || '不明なエラー'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !userName) {
      setError('ログインしてプロフィールを設定してください。');
      return;
    }
    if (!confirm(`${currentYear}年${currentMonth + 1}月の火・木曜日に、午前授業(10:00-12:00)と午後授業(13:00-15:00)の予定を一括で追加しますか？\n(既に登録されている日はスキップされます)`)) return;

    setIsGenerating(true);
    setError('');
    
    try {
      const res = await fetch('/api/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: currentYear,
          month: currentMonth + 1,
          author_uid: user.uid,
          author_name: userName,
          author_avatar: userAvatar || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '一括登録に失敗しました');
      
      alert(`${data.count > 0 ? `${data.count}件の授業予定を追加しました！` : '追加する予定はありませんでした（既に登録済みの場合など）'}`);
      await fetchEvents(currentYear, currentMonth);
    } catch (err: any) {
      setError(`エラー: ${err?.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  // Build calendar grid cells
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="cal-cell cal-cell-empty" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(currentYear, currentMonth, day);
    const dayEvents = eventsByDate[dateStr] || [];
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    // Get unique avatars for this day (max 4 shown)
    const uniqueAuthors = dayEvents.reduce<{ uid: string; name: string; avatar: string }[]>(
      (acc, ev) => {
        if (!acc.find((a) => a.uid === ev.author_uid)) {
          acc.push({ uid: ev.author_uid, name: ev.author_name, avatar: ev.author_avatar });
        }
        return acc;
      },
      []
    );

    calendarCells.push(
      <div
        key={day}
        className={`cal-cell ${isToday ? 'cal-today' : ''} ${isSelected ? 'cal-selected' : ''} ${dayEvents.length > 0 ? 'cal-has-events' : ''} ${isSunday ? 'cal-sunday' : ''} ${isSaturday ? 'cal-saturday' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <span className="cal-day-number">{day}</span>
        {uniqueAuthors.length > 0 && (
          <div className="cal-avatars">
            {uniqueAuthors.slice(0, 4).map((author) => (
              <div key={author.uid} className="cal-avatar-dot" title={author.name}>
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} />
                ) : (
                  <span>{author.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            ))}
            {uniqueAuthors.length > 4 && (
              <div className="cal-avatar-dot cal-avatar-more">
                +{uniqueAuthors.length - 4}
              </div>
            )}
          </div>
        )}
        {dayEvents.length > 0 && (
          <div className="cal-event-dots">
            {dayEvents.slice(0, 3).map((ev) => (
              <span
                key={ev.id}
                className="cal-event-dot"
                style={{ background: ev.color }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container calendar-container">
      <h1>カレンダー</h1>
      <p className="page-subtitle">メンバーの予定を共有しよう</p>

      {error && (
        <div className="mypage-message error" style={{ marginBottom: '1rem' }}>
          ⚠️ {error}
          <button
            onClick={() => setError('')}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Calendar Header */}
      <div className="cal-header glass-panel">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label="前月">
          ‹
        </button>
        <div className="cal-header-center">
          <h2 className="cal-month-title">
            {currentYear}年 {currentMonth + 1}月
          </h2>
          <button className="cal-today-btn" onClick={goToToday}>
            今日
          </button>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label="翌月">
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={`cal-grid-wrapper ${slideDirection ? `cal-slide-${slideDirection}` : ''}`}>
        <div className="cal-weekdays">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`cal-weekday ${i === 0 ? 'cal-sunday' : ''} ${i === 6 ? 'cal-saturday' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="cal-grid">{calendarCells}</div>
      </div>

      {/* Add Event Button */}
      {user && !showForm && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', margin: '2rem 0' }}>
          <button
            className="btn btn-primary"
            onClick={() => openNewEventForm()}
          >
            ＋ 予定を追加する
          </button>
          <button
            className="btn outline-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
            title="火曜日と木曜日に午前授業・午後授業を一括登録します"
          >
            {isGenerating ? '⏳ 処理中...' : '📅 通常授業(午前/午後)を一括登録'}
          </button>
        </div>
      )}

      {/* Event Form */}
      {showForm && user && (
        <form onSubmit={handleSubmit} className="cal-form glass-panel">
          <h3>{editId ? '予定を編集' : '新しい予定を追加'}</h3>

          <div className="form-group">
            <label>タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ミーティング、勉強会など..."
              required
              className="input-field"
              maxLength={100}
            />
          </div>

          <div className="cal-form-row">
            <div className="form-group">
              <label>日付 *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>開始時間</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>終了時間</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label>説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="予定の詳細を書いてください..."
              rows={3}
              className="input-field"
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>カラー</label>
            <div className="cal-color-picker">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`cal-color-swatch ${eventColor === c.value ? 'cal-color-active' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setEventColor(c.value)}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div className="cal-form-actions">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? '処理中...' : editId ? '変更を保存' : '予定を追加'}
            </button>
            <button
              type="button"
              className="btn outline-btn"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* Selected Date Event List */}
      {selectedDate && (
        <div className="cal-event-list">
          <div className="cal-event-list-header">
            <h3>
              {selectedDate.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_m, y, mo, d) => `${y}年${parseInt(mo)}月${parseInt(d)}日`)}
              の予定
            </h3>
            {user && (
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                onClick={() => openNewEventForm(selectedDate)}
              >
                ＋ 追加
              </button>
            )}
          </div>

          {selectedEvents.length === 0 ? (
            <p className="cal-no-events">この日の予定はまだありません。</p>
          ) : (
            selectedEvents.map((ev) => (
              <div key={ev.id} className="cal-event-card glass-panel">
                <div className="cal-event-color-bar" style={{ background: ev.color }} />
                <div className="cal-event-card-body">
                  <div className="cal-event-card-header">
                    <div className="cal-event-author">
                      {ev.author_avatar ? (
                        <img
                          src={ev.author_avatar}
                          alt={ev.author_name}
                          className="cal-event-author-img"
                        />
                      ) : (
                        <div className="cal-event-author-placeholder">
                          {ev.author_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="cal-event-author-name">{ev.author_name}</span>
                    </div>
                    {ev.start_time && (
                      <span className="cal-event-time">
                        🕐 {ev.start_time}
                        {ev.end_time ? ` 〜 ${ev.end_time}` : ''}
                      </span>
                    )}
                  </div>
                  <h4 className="cal-event-title">{ev.title}</h4>
                  {ev.description && (
                    <p className="cal-event-desc">{ev.description}</p>
                  )}
                  {user && user.uid === ev.author_uid && (
                    <div className="cal-event-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(ev)}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(ev.id)}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
