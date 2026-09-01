import React from 'react';

export default function MyWork({
  leads,
  currentUser,
  distName,
  steps,
  onOpenStageModal,
  roleAccess
}) {
  // Filter leads that are assigned to the current user's role and not closed
  const getMyRoleLeads = () => {
    // If Admin, they see all active leads for their district (or all if HQ Admin)
    const isAdmin = currentUser.role === 'Head Admin' || currentUser.role === 'District Admin';
    const isHead = currentUser.role === 'Head Admin';
    
    let baseLeads = leads;
    if (!isHead) {
      baseLeads = leads.filter(l => l.districtId === currentUser.districtId);
    }
    
    if (isAdmin) {
      return baseLeads.filter(l => l.status !== 'closed');
    }
    
    return baseLeads.filter(l => {
      if (l.status === 'closed') return false;
      const step = steps[l.stage - 1];
      if (!step) return false;
      // Match by step's assigned role OR by ROLE_ACCESS fallback
      if (step.role === currentUser.role) return true;
      const allowedStages = roleAccess[currentUser.role];
      if (!allowedStages) return false;
      return allowedStages === 'all' || allowedStages.includes(l.stage - 1);
    });
  };

  const myLeads = getMyRoleLeads();

  return (
    <div id="myWorkContent">
      <div className="sectionHead">
        <div className="sectionTitle">My assigned leads</div>
      </div>
      
      {myLeads.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {myLeads.map(l => {
            const step = steps[l.stage - 1];
            const progressPct = Math.round((l.stage / steps.length) * 100);
            
            return (
              <div
                key={l.id}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{l.name}</div>
                  <span style={{ fontSize: '10px', background: '#e8f0fb', color: '#1a5fa8', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                    {distName(l.districtId)}
                  </span>
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {l.location} | {l.system || '-'}
                </div>
                
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Step {l.stage}: <b>{step ? step.title : `Stage ${l.stage}`}</b>
                </div>
                
                <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', background: 'var(--red)', borderRadius: '4px', width: `${progressPct}%` }}></div>
                </div>
                
                <button
                  className="actBtn"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => onOpenStageModal(l.id)}
                >
                  <i className="fa-solid fa-arrows-rotate"></i> Update Stage
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No active leads assigned to your role.
        </div>
      )}
    </div>
  );
}
