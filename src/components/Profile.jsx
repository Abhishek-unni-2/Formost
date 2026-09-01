import React, { useState } from 'react';

export default function Profile({
  currentUser,
  distName,
  onSaveProfile
}) {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState(currentUser.photo || '');

  const getInitials = (nameStr) => {
    return nameStr
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Name cannot be empty.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    onSaveProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photo,
      password: newPassword ? newPassword.trim() : null
    });

    // Clear passwords
    setNewPassword('');
    setConfirmPassword('');
  };

  const initials = getInitials(name);

  return (
    <div id="page-profile" style={{ maxWidth: '560px' }}>
      <form onSubmit={handleSubmit}>
        {/* Avatar card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#fff',
                  backgroundImage: photo ? `url(${photo})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0
                }}
              >
                {!photo && initials}
              </div>
              <label
                htmlFor="photoInput"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '28px',
                  height: '28px',
                  background: 'var(--red)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid #fff'
                }}
              >
                <i className="fa-solid fa-camera" style={{ fontSize: '11px', color: '#fff' }}></i>
              </label>
              <input
                type="file"
                accept="image/*"
                id="photoInput"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '3px' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {currentUser.role}
                {currentUser.districtId && currentUser.districtId > 0 ? ` - ${distName(currentUser.districtId)}` : ''}
              </div>
              <label
                htmlFor="photoInput"
                style={{
                  fontSize: '11px',
                  color: 'var(--red)',
                  cursor: 'pointer',
                  border: '1.5px solid var(--red)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontWeight: '600'
                }}
              >
                Change photo
              </label>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '14px' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: '700', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Personal info
          </div>
          <div className="formGroup">
            <label>Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="formGroup">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
          </div>
        </div>

        {/* Password card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', marginBottom: '14px' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: '700', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Change password
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="formGroup">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </div>
        </div>

        <button className="btnSave" type="submit" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
          <i className="fa-solid fa-floppy-disk"></i> &nbsp;Save profile
        </button>
      </form>
    </div>
  );
}
