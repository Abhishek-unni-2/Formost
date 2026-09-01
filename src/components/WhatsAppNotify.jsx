import React, { useState } from 'react';

export default function WhatsAppNotify({
  leads,
  currentUser,
  isHead,
  distName,
  steps
}) {
  const [copiedId, setCopiedId] = useState(null);

  // Filter leads based on district visibility
  const myLeads = isHead()
    ? leads
    : leads.filter(l => l.districtId === currentUser.districtId);

  // 1. Balance payment pending (Step 13)
  const balanceNotifications = myLeads.filter(
    l => l.stage === 13 && l.status !== 'closed'
  );

  // 2. Active leads updating their current step
  const activeLeads = myLeads.filter(l => l.status !== 'closed');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getCleanPhone = (phone) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = '91' + clean;
    return clean;
  };

  return (
    <div id="page-notify">
      <div className="sectionHead">
        <div className="sectionTitle">WhatsApp notification center</div>
      </div>

      <div id="notifyCards">
        {/* Render Balance payments */}
        {balanceNotifications.map(l => {
          const msg = `Hi Accounts,\n\nBalance payment pending for ${l.name} (${l.location}).\n\nPlease collect the balance amount.\n\n- Formost Ops - ${distName(l.districtId)}`;
          const cardId = `bal-${l.id}`;
          const cleanPhone = getCleanPhone(l.phone);
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

          return (
            <div key={cardId} className="notifyCard">
              <div className="notifyHead">
                <div className="notifyIco" style={{ background: 'rgba(232, 22, 27, 0.1)', color: '#E8161B' }}>
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                </div>
                <div>
                  <div className="notifyTitle">{l.name} - Balance payment pending</div>
                </div>
              </div>
              <div className="notifyMsg">{msg}</div>
              <div className="notifyActs">
                <a href={waUrl} target="_blank" rel="noreferrer">
                  <button className="btnWA">
                    <i className="fa-brands fa-whatsapp"></i> Send on WhatsApp
                  </button>
                </a>
                <button className="btnCopy" onClick={() => handleCopy(msg, cardId)}>
                  {copiedId === cardId ? (
                    <>
                      <i className="fa-solid fa-check"></i> Copied!
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy"></i> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Render Active Stage Updates */}
        {activeLeads.map(l => {
          const s = steps[l.stage - 1];
          if (!s) return null;
          const nx = l.stage < steps.length ? steps[l.stage] : null;
          
          const msg = `Hi ${s.role},\n\nLead update: ${l.name} (${l.location})\n\nCurrent: Step ${l.stage} - ${s.title}${
            nx ? `\nNext: Step ${l.stage + 1} - ${nx.title}\nPlease take necessary action.` : ''
          }\n\n- Formost Ops - ${distName(l.districtId)}`;
          
          const cardId = `upd-${l.id}`;
          const cleanPhone = getCleanPhone(l.phone);
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

          return (
            <div key={cardId} className="notifyCard">
              <div className="notifyHead">
                <div className="notifyIco" style={{ background: 'rgba(37, 211, 102, 0.13)', color: '#25d366' }}>
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <div className="notifyTitle">{l.name} - Step {l.stage}: {s.title}</div>
                </div>
              </div>
              <div className="notifyMsg">{msg}</div>
              <div className="notifyActs">
                <a href={waUrl} target="_blank" rel="noreferrer">
                  <button className="btnWA">
                    <i className="fa-brands fa-whatsapp"></i> Send on WhatsApp
                  </button>
                </a>
                <button className="btnCopy" onClick={() => handleCopy(msg, cardId)}>
                  {copiedId === cardId ? (
                    <>
                      <i className="fa-solid fa-check"></i> Copied!
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy"></i> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {balanceNotifications.length === 0 && activeLeads.length === 0 && (
          <p style={{ color: 'var(--text-muted)', padding: '20px' }}>No active leads requiring notifications.</p>
        )}
      </div>
    </div>
  );
}
