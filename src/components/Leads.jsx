import React, { useState } from 'react';

export default function Leads({
  leads,
  currentUser,
  isAdmin,
  isHead,
  distName,
  steps,
  getStageClass,
  onOpenStageModal,
  onOpenEditLeadModal,
  onDeleteLead,
  canAccessStage
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageGroupFilter, setStageGroupFilter] = useState('');

  // Get user's district leads or all if Head Admin
  const getVisibleLeads = () => {
    if (isHead()) return leads;
    return leads.filter(l => l.districtId === currentUser.districtId);
  };

  const fmtLeadId = (id) => `FMS-${String(id).padStart(4, '0')}`;

  const filteredLeads = getVisibleLeads().filter(l => {
    // 1. Search filter
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query ||
      l.name.toLowerCase().includes(query) ||
      l.location.toLowerCase().includes(query) ||
      l.phone.includes(query) ||
      fmtLeadId(l.id).toLowerCase().includes(query);

    // 2. Status filter
    const matchesStatus = !statusFilter || l.status === statusFilter;

    // 3. Stage group filter
    let matchesStage = true;
    if (stageGroupFilter === 'e') {
      matchesStage = l.stage <= 4;
    } else if (stageGroupFilter === 'm') {
      matchesStage = l.stage >= 5 && l.stage <= 9;
    } else if (stageGroupFilter === 'l') {
      matchesStage = l.stage >= 10;
    }

    return matchesQuery && matchesStatus && matchesStage;
  });

  return (
    <div className="tableWrap">
      <div className="tableToolbar">
        <input
          className="searchInp"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name, phone, location..."
        />
        
        <select
          className="filterSel"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="closed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        
        <select
          className="filterSel"
          value={stageGroupFilter}
          onChange={(e) => setStageGroupFilter(e.target.value)}
        >
          <option value="">All stages</option>
          <option value="e">Early (1-4)</option>
          <option value="m">Mid (5-9)</option>
          <option value="l">Late (10+)</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Stage</th>
            <th>Progress</th>
            <th>Assigned to</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.length > 0 ? (
            filteredLeads.map(l => {
              const progressPct = Math.round((l.stage / steps.length) * 100);
              const stageClass = getStageClass(l.stage);
              const dotClass = l.status === 'closed' ? 'closed' : l.status === 'pending' ? 'pending' : 'active';
              const step = steps[l.stage - 1];
              const showStageEdit = canAccessStage(l.stage - 1);
              const canEditLead = isAdmin();
              
              // Only Head Admin can delete, or District Admin can delete their own district's leads
              const canDeleteLead = isAdmin() && (isHead() || l.districtId === currentUser.districtId);

              return (
                <tr key={l.id}>
                  <td style={{ fontSize: '12px', fontWeight: 700, color: '#E8161B', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{fmtLeadId(l.id)}</td>
                  <td className="tdBold">{l.name}</td>
                  <td className="tdSm">{l.phone}</td>
                  <td>{l.location}</td>
                  <td>
                    <span className={`stagePill ${stageClass}`}>
                      Step {l.stage}
                    </span>
                    {step && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>{step.title}</div>}
                    {steps[l.stage] && (
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                        Next: {steps[l.stage].title}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="progBar">
                      <div className="progFill" style={{ width: `${progressPct}%` }}></div>
                    </div>
                    <div className="tdSm">{progressPct}%</div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {step ? step.role : 'Unassigned'}
                  </td>
                  <td>
                    <span className={`statusDot ${dotClass}`}></span>
                    <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{l.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    {canEditLead && (
                      <button className="actBtn" onClick={() => onOpenEditLeadModal(l.id)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                    )}
                    {showStageEdit && (
                      <button className="actBtn" onClick={() => onOpenStageModal(l.id)}>
                        <i className="fa-solid fa-arrows-rotate"></i>
                      </button>
                    )}
                    {canDeleteLead && (
                      <button
                        className="actBtn"
                        style={{ color: '#E8161B' }}
                        onClick={() => onDeleteLead(l.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#99968e' }}>
                No leads match current filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
