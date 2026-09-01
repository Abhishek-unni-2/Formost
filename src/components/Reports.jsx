import React, { useMemo } from 'react';

const ROLE_COLORS = {
  'Telecaller': '#4F8EF7',
  'Sales Executive': '#E8161B',
  'Supervisor': '#F5A623',
  'Accounts': '#27AE60',
  'Finance': '#8E44AD',
  'Purchase': '#16A085',
  'Technical Chief': '#2C3E50',
  'District Admin': '#E67E22',
  'Head Admin': '#C0392B',
};

function BarChart({ data, height = 140 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = 32;
  const gap = 12;
  const padL = 36;
  const padB = 28;
  const width = padL + data.length * (barW + gap);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + padB}`} style={{ display: 'block' }}>
      {/* Y gridlines */}
      {[0.25, 0.5, 0.75, 1].map(f => {
        const y = height - height * f;
        return (
          <g key={f}>
            <line x1={padL} y1={y} x2={width} y2={y} stroke="#e4e2dd" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#aaa">{Math.round(max * f)}</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * height, 2);
        const x = padL + i * (barW + gap);
        const y = height - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="4" fill={d.color || '#E8161B'} opacity="0.85" />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={d.color || '#E8161B'}>{d.value}</text>
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize="9" fill="#888">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: '12px', padding: '16px 20px', minWidth: '120px', flex: 1 }}>
      <div style={{ fontSize: '24px', fontWeight: 800, color: color || '#111' }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default function Reports({ leads, steps, users, currentUser, isHead, distName }) {
  const now = new Date();

  // Monthly labels — last 6 months
  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en-IN', { month: 'short' }),
      };
    });
  }, []);

  // Monthly lead counts (by creation date)
  const monthlyData = useMemo(() => {
    return months.map(m => ({
      label: m.label,
      value: leads.filter(l => (l.date || '').startsWith(m.key)).length,
      color: '#E8161B',
    }));
  }, [leads, months]);

  // This month stats
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthLeads = leads.filter(l => (l.date || '').startsWith(thisMonthKey));
  const activeLeads = leads.filter(l => l.status === 'active');
  const closedLeads = leads.filter(l => l.status === 'closed');
  const pendingLeads = leads.filter(l => l.status === 'pending');

  // Per-role workload: count leads currently at each role's steps
  const roleWorkload = useMemo(() => {
    const roleMap = {};
    leads.forEach(l => {
      if (l.status === 'closed') return;
      const step = steps[l.stage - 1];
      if (!step) return;
      const role = step.role || 'Unassigned';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });
    return Object.entries(roleMap)
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ label: role.split(' ')[0], value: count, color: ROLE_COLORS[role] || '#888', fullRole: role }));
  }, [leads, steps]);

  // District performance (Head Admin only)
  const districtData = useMemo(() => {
    if (!isHead()) return [];
    const distMap = {};
    leads.forEach(l => {
      const dn = distName(l.districtId) || 'HQ';
      distMap[dn] = (distMap[dn] || 0) + 1;
    });
    return Object.entries(distMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        label: name.length > 8 ? name.slice(0, 8) + '…' : name,
        fullName: name,
        value: count,
        color: ['#E8161B', '#4F8EF7', '#F5A623', '#27AE60', '#8E44AD', '#16A085'][i % 6],
      }));
  }, [leads, isHead, distName]);

  // User's own role stats (for non-admins)
  const myRoleLeads = useMemo(() => {
    if (!currentUser || isHead()) return [];
    return leads.filter(l => {
      if (l.status === 'closed') return false;
      const step = steps[l.stage - 1];
      return step && step.role === currentUser.role;
    });
  }, [leads, steps, currentUser, isHead]);

  const myMonthly = useMemo(() => {
    return months.map(m => ({
      label: m.label,
      value: leads.filter(l => {
        if (!(l.date || '').startsWith(m.key)) return false;
        const step = steps[l.stage - 1];
        return step && step.role === currentUser?.role;
      }).length,
      color: ROLE_COLORS[currentUser?.role] || '#E8161B',
    }));
  }, [leads, steps, currentUser, months]);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div className="sectionHead">
        <div className="sectionTitle">Reports</div>
        <div style={{ fontSize: '13px', color: '#888' }}>Auto-generated • {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
      </div>

      {/* Overview cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <StatCard label="This Month" value={thisMonthLeads.length} sub="new leads" color="#E8161B" />
        <StatCard label="Active" value={activeLeads.length} sub="in pipeline" color="#4F8EF7" />
        <StatCard label="Completed" value={closedLeads.length} sub="all time" color="#27AE60" />
        <StatCard label="Pending" value={pendingLeads.length} sub="on hold" color="#F5A623" />
        <StatCard label="Total" value={leads.length} sub="all leads" color="#888" />
      </div>

      {/* Monthly trend */}
      <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Monthly Lead Intake — Last 6 Months</div>
        <BarChart data={monthlyData} height={130} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isHead() ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Role workload */}
        <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: '12px', padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Active Leads by Role</div>
          {roleWorkload.length === 0 ? (
            <div style={{ color: '#aaa', fontSize: '13px' }}>No active leads.</div>
          ) : (
            <>
              <BarChart data={roleWorkload} height={120} />
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {roleWorkload.map(r => (
                  <span key={r.fullRole} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: r.color, display: 'inline-block' }}></span>
                    {r.fullRole}: <b>{r.value}</b>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* District performance (Head Admin only) */}
        {isHead() && (
          <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Leads by District</div>
            {districtData.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: '13px' }}>No district data.</div>
            ) : (
              <>
                <BarChart data={districtData} height={120} />
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {districtData.map(d => (
                    <span key={d.fullName} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color, display: 'inline-block' }}></span>
                      {d.fullName}: <b>{d.value}</b>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* My role section (non-admin users) */}
      {!isHead() && currentUser && (
        <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
            My Workload — {currentUser.role}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>Leads currently assigned to your role</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <StatCard label="My Active" value={myRoleLeads.length} sub="leads in my queue" color={ROLE_COLORS[currentUser.role] || '#E8161B'} />
            <StatCard label="This Month" value={myMonthly[5]?.value || 0} sub="leads this month" color="#4F8EF7" />
          </div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>Monthly Trend</div>
          <BarChart data={myMonthly} height={110} />
        </div>
      )}

      {/* Lead status breakdown table */}
      <div style={{ background: '#fff', border: '1px solid #e4e2dd', borderRadius: '12px', padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Pipeline Stage Breakdown</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f5f5f3' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e4e2dd' }}>Stage</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e4e2dd' }}>Step</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e4e2dd' }}>Role</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e4e2dd' }}>Leads</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, i) => {
                const count = leads.filter(l => l.stage === i + 1 && l.status !== 'closed').length;
                if (count === 0) return null;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0ee' }}>
                    <td style={{ padding: '8px 12px', color: '#E8161B', fontWeight: 700 }}>Step {i + 1}</td>
                    <td style={{ padding: '8px 12px' }}>{step.title}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', background: `${ROLE_COLORS[step.role] || '#888'}18`, color: ROLE_COLORS[step.role] || '#888', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {step.role}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
