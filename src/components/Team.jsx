import React from 'react';

export default function Team({
  users,
  currentUser,
  steps,
  isHead,
  distName
}) {
  // Filter team members visible to active user
  const visibleUsers = isHead()
    ? users
    : users.filter(u => u.districtId === currentUser.districtId || u.districtId === 0);

  // Group users by role
  const usersByRole = {};
  visibleUsers.forEach(u => {
    if (!usersByRole[u.role]) {
      usersByRole[u.role] = [];
    }
    usersByRole[u.role].push(u);
  });

  // Map steps to role for pill display
  const stepsByRole = {};
  steps.forEach(s => {
    if (!stepsByRole[s.role]) {
      stepsByRole[s.role] = [];
    }
    stepsByRole[s.role].push(`${s.num} - ${s.title}`);
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="teamGrid" id="teamGrid">
      {Object.keys(usersByRole).map(role => {
        const roleUsers = usersByRole[role];
        const displayNames = roleUsers.map(u => u.name).join(', ');
        
        // Use first user's initials for card avatar
        const initials = getInitials(roleUsers[0].name);
        const pills = stepsByRole[role] || [];

        return (
          <div key={role} className="teamCard">
            <div className="teamAvatar">
              {roleUsers[0].photo ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundImage: `url(${roleUsers[0].photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div className="teamName">{displayNames}</div>
            <div className="teamRole">
              {role} {roleUsers[0].districtId ? `(${distName(roleUsers[0].districtId)})` : ''}
            </div>
            <div className="teamSteps">
              {pills.length > 0 ? (
                pills.map((p, i) => (
                  <span key={i} className="stepPill">
                    {p}
                  </span>
                ))
              ) : (
                <span className="stepPill">No steps assigned</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
