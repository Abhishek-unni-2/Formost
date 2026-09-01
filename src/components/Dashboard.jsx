import React from 'react';

export default function Dashboard({
  leads,
  isAdmin,
  distName,
  stepsLength,
  getStageClass,
  onOpenStageModal,
  canAccessStage
}) {
  if (!isAdmin()) {
    return (
      <div className="accessDenied" id="dashDenied">
        <i className="fa-solid fa-lock"></i>
        <h3>Admin access only</h3>
        <p>Dashboard visible to admins only.</p>
      </div>
    );
  }

  // Statistics calculations
  const totalLeads = leads.length;
  const closedLeads = leads.filter(l => l.status === 'closed').length;
  const activeLeads = leads.filter(l => l.status === 'active').length;
  const pendingLeads = leads.filter(l => l.stage <= 3).length; // Early stage

  // Get last 6 leads (reversed for recent first)
  const recentLeads = [...leads].slice(-6).reverse();

  return (
    <div id="dashContent">
      <div className="statsRow">
        <div className="statCard">
          <div className="statIcon red">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="statNum" id="dTotal">{totalLeads}</div>
          <div className="statLabel">Total leads</div>
        </div>
        <div className="statCard">
          <div className="statIcon green">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="statNum" id="dClosed">{closedLeads}</div>
          <div className="statLabel">Completed</div>
        </div>
        <div className="statCard">
          <div className="statIcon amber">
            <i className="fa-solid fa-spinner"></i>
          </div>
          <div className="statNum" id="dActive">{activeLeads}</div>
          <div className="statLabel">In progress</div>
        </div>
        <div className="statCard">
          <div className="statIcon blue">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <div className="statNum" id="dPending">{pendingLeads}</div>
          <div className="statLabel">Early stage</div>
        </div>
      </div>

      <div className="sectionHead">
        <div className="sectionTitle">Recent leads</div>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>District</th>
              <th>Stage</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.length > 0 ? (
              recentLeads.map(l => {
                const progressPct = Math.round((l.stage / stepsLength) * 100);
                const stageClass = getStageClass(l.stage);
                const statusDotClass = l.status === 'closed' ? 'closed' : l.status === 'pending' ? 'pending' : 'active';
                const showStageEdit = canAccessStage(l.stage - 1);

                return (
                  <tr key={l.id}>
                    <td className="tdBold">{l.name}</td>
                    <td>
                      <span style={{ fontSize: '11px', background: '#e8f0fb', color: '#1a5fa8', padding: '2px 8px', borderRadius: '20px' }}>
                        {distName(l.districtId)}
                      </span>
                    </td>
                    <td>
                      <span className={`stagePill ${stageClass}`}>
                        Step {l.stage}
                      </span>
                    </td>
                    <td>
                      <div className="progBar">
                        <div className="progFill" style={{ width: `${progressPct}%` }}></div>
                      </div>
                      <div className="tdSm">{progressPct}%</div>
                    </td>
                    <td>
                      <span className={`statusDot ${statusDotClass}`}></span>
                      <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{l.status}</span>
                    </td>
                    <td>
                      {showStageEdit && (
                        <button className="actBtn" onClick={() => onOpenStageModal(l.id)}>
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#99968e' }}>
                  No leads recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
