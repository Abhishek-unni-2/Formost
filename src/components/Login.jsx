import React, { useState, useRef, useEffect } from 'react';
import { LOGO_SRC } from '../data/mockData';

export default function Login({ users, onLoginSuccess, distName }) {
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const suggestionsRef = useRef(null);

  // Setup initial suggestions or filter them based on query
  useEffect(() => {
    const query = nameInput.toLowerCase().trim();
    if (!query) {
      setSuggestions(users);
    } else {
      setSuggestions(users.filter(u => u.name.toLowerCase().includes(query)));
    }
  }, [nameInput, users]);

  // Click outside listener for suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
    setSelectedUserId(null); // Reset selection on manual typing
    setShowSuggestions(true);
  };

  const handleSelectUser = (user) => {
    setNameInput(user.name);
    setSelectedUserId(user.id);
    setShowSuggestions(false);
    setErrorMsg('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedUserId) {
      // Try to find exact match if typed name matches exactly
      const exactMatch = users.find(u => u.name.toLowerCase().trim() === nameInput.toLowerCase().trim());
      if (exactMatch) {
        setSelectedUserId(exactMatch.id);
        proceedWithAuth(exactMatch.id, passwordInput);
      } else {
        setErrorMsg('Select your name from the list.');
        return;
      }
    } else {
      proceedWithAuth(selectedUserId, passwordInput);
    }
  };

  const proceedWithAuth = (userId, pwd) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      setErrorMsg('User not found.');
      return;
    }
    
    if (!pwd) {
      setErrorMsg('Enter your password.');
      return;
    }

    if (user.pass !== pwd) {
      setErrorMsg('Wrong password. Try again.');
      setPasswordInput('');
      return;
    }

    onLoginSuccess(user);
  };

  return (
    <div id="loginScreen">
      <div className="loginBox">
        <img src={LOGO_SRC} alt="Formost Logo" />
        <h2>Welcome back</h2>
        <p>Sign in to Formost Ops</p>
        
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ position: 'relative' }}>
            <label className="flabel">Your name</label>
            <input
              className="finput"
              type="text"
              value={nameInput}
              onChange={handleNameChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Start typing your name..."
              required
            />
            
            {showSuggestions && (
              <div className="suggestWrap" ref={suggestionsRef}>
                <div className="suggestList" style={{ display: 'block' }}>
                  {suggestions.length > 0 ? (
                    suggestions.map(u => {
                      const d = u.districtId && u.districtId > 0 ? ` - ${distName(u.districtId)}` : '';
                      return (
                        <div
                          key={u.id}
                          className="suggestItem"
                          onMouseDown={() => handleSelectUser(u)}
                        >
                          <strong>{u.name}</strong>
                          <span>({u.role}{d})</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="suggestItem" style={{ color: '#999', cursor: 'default' }}>
                      No matches found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <label className="flabel">Password</label>
          <input
            className="finput"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {errorMsg && (
            <div className="loginErr">
              <i className="fa-solid fa-triangle-exclamation"></i>
              {errorMsg}
            </div>
          )}

          <button className="loginBtn" type="submit">
            Sign in &nbsp;<i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
