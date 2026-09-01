import React from 'react';

export default function Users({
  users,
  currentUser,
  isAdmin,
  isHead,
  distName,
  onOpenAddUserModal,
  onOpenEditUserModal,
  onDeleteUser
}) {
  if (!isAdmin()) {
    return (
      <div className="accessDenied">
        <i className="fa-solid fa-lock"></i>
        <h3>Admin access only</h3>
        <p>User management is restricted to administrators.</p>
      </div>
    );
  }

  // Filter users visible to active admin
  const visibleUsers = isHead()
    ? users
    : users.filter(u => u.districtId === currentUser.districtId);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div id="page-users">
      <div className="sectionHead">
        <div className="sectionTitle">Manage users</div>
        <button className="btnSm red" onClick={onOpenAddUserModal}>
          <i className="fa-solid fa-plus"></i> Add user
        </button>
      </div>

      <div className="teamGrid" id="usersGrid">
        {visibleUsers.map(u => {
          const initials = getInitials(u.name);
          const dBadge = (u.districtId && u.role !== 'Head Admin')
            ? <span style={{ fontSize: '10px', background: '#e8f0fb', color: '#1a5fa8', padding: '2px 7px', borderRadius: '20px', marginLeft: '6px', fontWeight: '600' }}>{distName(u.districtId)}</span>
            : null;
          
          // Head Admin can edit all users. District Admin can edit their own district's users (except Head Admin).
          const canEditUser = isHead() || (currentUser.role === 'District Admin' && u.districtId === currentUser.districtId && u.role !== 'Head Admin');

          // Head Admin can delete other Head Admins (but not themselves). District Admin cannot delete Head Admins.
          const canDeleteUser = canEditUser && u.id !== currentUser.id && (u.role !== 'Head Admin' || isHead());

          return (
            <div key={u.id} className="teamCard">
              <div className="teamAvatar">
                {u.photo ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundImage: `url(${u.photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="teamName">
                {u.name}
                {dBadge}
              </div>
              <div className="teamRole">{u.role}</div>
              
              {canEditUser && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button className="actBtn" onClick={() => onOpenEditUserModal(u.id)}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  {canDeleteUser && (
                    <button
                      className="actBtn"
                      style={{ color: '#E8161B' }}
                      onClick={() => onDeleteUser(u.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
