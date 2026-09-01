import React from 'react';
import { LOGO_SRC } from '../data/mockData';

export default function Sidebar({
  currentUser,
  currentPage,
  setCurrentPage,
  onLogout,
  distName,
  isHead,
  isAdmin,
  canAddLead,
  openAddLeadModal,
  isOpen,
  onClose
}) {
  if (!currentUser) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(currentUser.name);

  // Define nav links conditionally
  const navItems = [
    { id: 'dash', label: 'Dashboard', icon: 'fa-chart-pie', show: isAdmin },
    { id: 'mywork', label: 'My Work', icon: 'fa-list-check', show: true },
    { id: 'districts', label: 'All districts', icon: 'fa-map', show: isHead },
    { id: 'flow', label: 'Flow overview', icon: 'fa-diagram-project', show: true },
  ];

  const leadItems = [
    { id: 'leads', label: 'All leads', icon: 'fa-users', show: true },
  ];

  const toolItems = [
    { id: 'quotations', label: 'Quotations', icon: 'fa-file-invoice', show: true },
    { id: 'notify', label: 'WhatsApp notify', icon: 'fa-brands fa-whatsapp', show: true },
  ];

  const teamItems = [
    { id: 'team', label: 'Team', icon: 'fa-people-group', show: true },
    { id: 'users', label: 'Manage users', icon: 'fa-user-gear', show: isAdmin },
    { id: 'distmgr', label: 'Manage districts', icon: 'fa-building', show: isHead },
    { id: 'reports', label: 'Reports', icon: 'fa-chart-bar', show: true },
    { id: 'profile', label: 'My Profile', icon: 'fa-circle-user', show: true },
    { id: 'settings', label: 'Settings', icon: 'fa-gear', show: isHead },
  ];

  const iconClass = (icon) =>
    icon.startsWith('fa-brands') || icon.startsWith('fa-regular') ? icon : `fa-solid ${icon}`;

  const renderNavSection = (title, items) => {
    const visibleItems = items.filter(item => typeof item.show === 'boolean' ? item.show : item.show());
    if (visibleItems.length === 0) return null;

    return (
      <React.Fragment>
        <div className="navSec">{title}</div>
        {visibleItems.map(item => (
          <div
            key={item.id}
            className={`navItem ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <i className={iconClass(item.icon)}></i> {item.label}
          </div>
        ))}
      </React.Fragment>
    );
  };

  return (
    <>
      {isOpen && <div className="sidebarOverlay" onClick={onClose} />}
      <div className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sbLogo">
        <img src={LOGO_SRC} alt="Formost Logo" />
      </div>
      <div className="sbUser">
        <div
          className="sbAvatar"
          style={
            currentUser.photo
              ? { backgroundImage: `url(${currentUser.photo})` }
              : undefined
          }
        >
          {!currentUser.photo && initials}
        </div>
        <div>
          <div className="sbName">{currentUser.name}</div>
          <div className="sbRole">
            {currentUser.role}
            {currentUser.role !== 'Head Admin' && currentUser.districtId && currentUser.districtId > 0 ? ` - ${distName(currentUser.districtId)}` : ''}
          </div>
        </div>
      </div>

      {currentUser.role !== 'Head Admin' && currentUser.districtId && currentUser.districtId > 0 && (
        <div className="sbDistBadgeWrap">
          <span className="sbDistBadge">{distName(currentUser.districtId)}</span>
        </div>
      )}

      <nav className="sbNav">
        {renderNavSection('Main', navItems)}
        
        <div className="navSec">Leads</div>
        {leadItems.map(item => (
          <div
            key={item.id}
            className={`navItem ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <i className={iconClass(item.icon)}></i> {item.label}
          </div>
        ))}
        {canAddLead() && (
          <div className="navItem" onClick={openAddLeadModal}>
            <i className="fa-solid fa-user-plus"></i> Add new lead
          </div>
        )}

        {renderNavSection('Tools', toolItems)}
        {renderNavSection('Team', teamItems)}
      </nav>

      <div className="sbBottom">
        <button className="logoutBtn" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i> Sign out
        </button>
      </div>
    </div>
    </>
  );
}
