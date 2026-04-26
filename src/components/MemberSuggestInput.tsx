import { useState, useRef, useEffect } from 'react';

interface MemberSuggestInputProps {
  value: string;
  onChange: (val: string) => void;
  members: string[];
  placeholder?: string;
  multiple?: boolean;
}

export default function MemberSuggestInput({ value, onChange, members, placeholder, multiple }: MemberSuggestInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // For multiple, we only suggest for the last comma-separated part
  const currentPart = multiple ? value.split(',').pop()?.trim() || '' : value;
  
  const suggestions = currentPart 
    ? members.filter(m => m.toLowerCase().includes(currentPart.toLowerCase()) && m !== currentPart)
    : members;

  // Do not show suggestions if the current part exactly matches a member
  const shouldShow = showSuggestions && suggestions.length > 0;

  const handleSelect = (member: string) => {
    if (multiple) {
      const parts = value.split(',');
      parts.pop(); // remove the currently typing part
      const newParts = parts.map(p => p.trim()).filter(Boolean);
      newParts.push(member);
      onChange(newParts.join(', ') + ', ');
    } else {
      onChange(member);
    }
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!shouldShow) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => (i < suggestions.length - 1 ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => (i > 0 ? i - 1 : -1));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setFocusedIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        style={{ marginBottom: shouldShow ? 0 : '1rem' }}
      />
      {shouldShow && (
        <ul className="suggestions-list glass-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 10,
          margin: 0,
          padding: '0.5rem 0',
          listStyle: 'none',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((m, i) => (
            <li
              key={m}
              onClick={() => handleSelect(m)}
              onMouseEnter={() => setFocusedIndex(i)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background: i === focusedIndex ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: 'var(--text)'
              }}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
