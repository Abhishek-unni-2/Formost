import React from 'react';

export default function Districts({
  districts,
  leads,
  users,
  isHead,
  managerMode,
  onOpenAddDistrictModal,
  onOpenEditDistrictModal,
  onDeleteDistrict,
  onFilterLeadsByDistrict
}) {
  if (!isHead()) {
    return (
      <div className="accessDenied">
        <i className="fa-solid fa-lock"></i>
        <h3>Head Admin access only</h3>
        <p>District office management is restricted to HQ Admin.</p>
      </div>
    );
  }

  return (
    <div id={managerMode ? "page-distmgr" : "page-districts"}>
      <div className="sectionHead">
        <div className="sectionTitle">
          {managerMode ? "Manage districts" : "All districts"}
        </div>
        {managerMode && (
          <button className="btnSm red" onClick={onOpenAddDistrictModal}>
            <i className="fa-solid fa-plus"></i> Add district
          </button>
        )}
      </div>

      <div className="distGrid">
        {districts.map(d => {
          const districtLeads = leads.filter(l => l.districtId === d.id);
          const activeCount = districtLeads.filter(l => l.status === 'active').length;
          const completedCount = districtLeads.filter(l => l.status === 'closed').length;
          const teamCount = users.filter(u => u.districtId === d.id).length;

          return (
            <div
              key={d.id}
              className="distCard"
              onClick={() => {
                if (!managerMode) {
                  onFilterLeadsByDistrict(d.id, d.name);
                }
              }}
            >
              <div className="distCardTop">
                <div className="distName">{d.name}</div>
                <span className="distLoc">{d.location || 'Headquarters'}</span>
              </div>
              <div className="distStats">
                <div className="distStat">Leads: <span>{districtLeads.length}</span></div>
                <div className="distStat">Active: <span>{activeCount}</span></div>
                <div className="distStat">Done: <span>{completedCount}</span></div>
                <div className="distStat">Team: <span>{teamCount}</span></div>
              </div>

              {managerMode && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }} onClick={(e) => e.stopPropagation()}>
                  <button className="actBtn" onClick={() => onOpenEditDistrictModal(d.id)}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button
                    className="actBtn"
                    style={{ color: '#E8161B' }}
                    onClick={() => onDeleteDistrict(d.id, districtLeads.length)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
