import { useState, useEffect } from 'react';
import { fetchSettings, saveSettings, isConfigured } from '../services/dataService';

const DEFAULT_CONFIG = {
  firebase: { apiKey: '', projectId: '', authDomain: '', appId: '' },
  whatsapp: { phoneId: '', token: '', wabaId: '' },
  meta: {
    pageId: '', pageAccessToken: '', verifyToken: 'FORMOST_VERIFY_2024',
    appId: '', appSecret: ''
  },
  teamPhones: {
    Telecaller: '', 'Sales Executive': '', Accounts: '',
    Finance: '', Purchase: '', Supervisor: '', 'Technical Chief': ''
  },
  templateStatus: {
    formost_sales_closure: 'pending',
    formost_site_visit: 'pending',
    formost_installation_done: 'pending',
    formost_payment_reminder: 'pending',
    formost_internal_alert: 'pending',
  },
  districtMap: 'tirur,1\nmalappuram,1\nkondotty,1\nperinthalmanna,1\nkochi,4\ncalicut,2\nkozhikode,2'
};

function injectFirebaseSDK(fbCfg, onStatus, showToast) {
  if (window.firebase && window.firebase.firestore) {
    showToast('Firebase already connected!');
    onStatus('connected');
    return;
  }
  const scripts = [
    'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js',
  ];
  let loaded = 0;
  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      loaded++;
      if (loaded === scripts.length) {
        try {
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp({
              apiKey: fbCfg.apiKey,
              authDomain: fbCfg.authDomain || fbCfg.projectId + '.firebaseapp.com',
              projectId: fbCfg.projectId,
              appId: fbCfg.appId,
            });
          }
          window.db = window.firebase.firestore();
          onStatus('connected');
          showToast('Firebase connected!');
        } catch (e) {
          onStatus('error');
          showToast('Firebase init error: ' + e.message, 'error');
        }
      }
    };
    s.onerror = () => {
      onStatus('error');
      showToast('Failed to load Firebase SDK', 'error');
    };
    document.head.appendChild(s);
  });
}

const TABS = [
  { id: 'firebase',  label: 'Firebase',     icon: 'fa-fire' },
  { id: 'whatsapp',  label: 'WhatsApp',      icon: 'fa-brands fa-whatsapp' },
  { id: 'meta',      label: 'Meta / Leads',  icon: 'fa-brands fa-meta' },
  { id: 'team',      label: 'Team Phones',   icon: 'fa-phone' },
  { id: 'templates', label: 'Templates',     icon: 'fa-envelope' },
  { id: 'district',  label: 'District Map',  icon: 'fa-map' },
];

export default function Settings({ showToast, districts }) {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [tab, setTab] = useState('firebase');
  const [fbStatus, setFbStatus] = useState(() => (window.db ? 'connected' : 'idle'));

  useEffect(() => {
    async function loadCfg() {
      // Try Supabase first, fall back to localStorage
      if (isConfigured()) {
        const { data } = await fetchSettings();
        if (data && Object.keys(data).length > 0) {
          setCfg(prev => ({ ...prev, ...data }));
          setFbStatus(window.db ? 'connected' : 'idle');
          return;
        }
      }
      try {
        const saved = localStorage.getItem('formostOpsConfig');
        if (saved) setCfg(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
      setFbStatus(window.db ? 'connected' : 'idle');
    }
    loadCfg();
  }, []);

  const persist = (updated) => {
    setCfg(updated);
    // Save to localStorage (instant fallback)
    try { localStorage.setItem('formostOpsConfig', JSON.stringify(updated)); } catch (e) {}
    // Save to Supabase (persists across devices)
    if (isConfigured()) {
      saveSettings(updated).catch(err => console.error('Settings save error:', err));
    }
  };

  const set = (section, field, value) =>
    setCfg(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  // ── Firebase ──────────────────────────────────────────────
  const saveFb = () => {
    persist(cfg);
    showToast('Firebase config saved!');
    if (cfg.firebase.apiKey && cfg.firebase.projectId) {
      injectFirebaseSDK(cfg.firebase, setFbStatus, showToast);
    }
  };

  const testFb = () => {
    if (!window.db) { showToast('Firebase not connected. Save config first.', 'error'); return; }
    window.db.collection('_test').add({ test: true, t: new Date().toISOString() })
      .then(ref => { showToast('Firebase OK! Test doc: ' + ref.id); ref.delete(); })
      .catch(e => showToast('Firebase error: ' + e.message, 'error'));
  };

  // ── WhatsApp ──────────────────────────────────────────────
  const saveWa = () => { persist(cfg); showToast('WhatsApp config saved!'); };

  const testWa = () => {
    if (!cfg.whatsapp.phoneId || !cfg.whatsapp.token) {
      showToast('Save WhatsApp config first!', 'error'); return;
    }
    showToast('WhatsApp needs a backend Cloud Function — CF_BASE_URL not configured.', 'error');
  };

  // ── Meta ──────────────────────────────────────────────────
  const saveMeta = () => { persist(cfg); showToast('Meta config saved!'); };

  const checkMeta = () => {
    const { pageId, pageAccessToken } = cfg.meta;
    if (!pageId || !pageAccessToken) { showToast('Fill Meta config first!', 'error'); return; }
    fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=name,fan_count&access_token=${pageAccessToken}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) showToast('Meta error: ' + d.error.message, 'error');
        else showToast('Meta connected! Page: ' + d.name);
      })
      .catch(e => showToast('Meta check failed: ' + e.message, 'error'));
  };

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {TABS.map(t => (
          <button key={t.id}
            className={`btnSm${tab === t.id ? ' red' : ''}`}
            onClick={() => setTab(t.id)}>
            <i className={`fa-solid ${t.icon}`}></i> {t.label}
          </button>
        ))}
      </div>

      {/* ── Firebase ── */}
      {tab === 'firebase' && (
        <div className="tableWrap" style={{ padding: '24px' }}>
          <div className="sectionHead" style={{ marginBottom: '16px' }}>
            <span className="sectionTitle">
              <i className="fa-solid fa-fire" style={{ color: 'var(--red)', marginRight: '8px' }}></i>
              Firebase Configuration
            </span>
            {fbStatus === 'connected' && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green)' }}>
                Connected
              </span>
            )}
            {fbStatus === 'error' && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'var(--red-light)', color: 'var(--red)', border: '1px solid var(--red)' }}>
                Error
              </span>
            )}
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label>API Key</label>
              <input type="text" placeholder="AIzaSy..."
                value={cfg.firebase.apiKey}
                onChange={e => set('firebase', 'apiKey', e.target.value)} />
            </div>
            <div className="formGroup">
              <label>Project ID</label>
              <input type="text" placeholder="formost-ops"
                value={cfg.firebase.projectId}
                onChange={e => set('firebase', 'projectId', e.target.value)} />
            </div>
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label>Auth Domain</label>
              <input type="text" placeholder="formost-ops.firebaseapp.com"
                value={cfg.firebase.authDomain}
                onChange={e => set('firebase', 'authDomain', e.target.value)} />
            </div>
            <div className="formGroup">
              <label>App ID</label>
              <input type="text" placeholder="1:123456789:web:abc"
                value={cfg.firebase.appId}
                onChange={e => set('firebase', 'appId', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button className="btnSave" onClick={saveFb}>
              <i className="fa-solid fa-floppy-disk"></i> Save & Connect Firebase
            </button>
            <button className="btnSm" onClick={testFb}>
              <i className="fa-solid fa-bolt"></i> Test Connection
            </button>
          </div>
        </div>
      )}

      {/* ── WhatsApp ── */}
      {tab === 'whatsapp' && (
        <div className="tableWrap" style={{ padding: '24px' }}>
          <div className="sectionTitle" style={{ marginBottom: '12px' }}>
            <i className="fa-brands fa-whatsapp" style={{ color: '#25d366', marginRight: '8px' }}></i>
            WhatsApp Business API
          </div>
          <div className="alertBox" style={{ marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-info"></i>
            WhatsApp messages require a backend Cloud Function. Direct browser calls are blocked by Meta CORS policy.
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label>Phone Number ID</label>
              <input type="text" placeholder="123456789012345"
                value={cfg.whatsapp.phoneId}
                onChange={e => set('whatsapp', 'phoneId', e.target.value)} />
            </div>
            <div className="formGroup">
              <label>WABA ID</label>
              <input type="text" placeholder="987654321"
                value={cfg.whatsapp.wabaId}
                onChange={e => set('whatsapp', 'wabaId', e.target.value)} />
            </div>
          </div>
          <div className="formGroup">
            <label>Access Token</label>
            <input type="password" placeholder="EAABs..."
              value={cfg.whatsapp.token}
              onChange={e => set('whatsapp', 'token', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button className="btnSave" onClick={saveWa}>
              <i className="fa-solid fa-floppy-disk"></i> Save Config
            </button>
            <button className="btnSm" onClick={testWa}>
              <i className="fa-solid fa-paper-plane"></i> Send Test Message
            </button>
          </div>
        </div>
      )}

      {/* ── Meta ── */}
      {tab === 'meta' && (
        <div>
          {/* Setup guide */}
          <div className="tableWrap" style={{ padding: '24px', marginBottom: '16px' }}>
            <div className="sectionTitle" style={{ marginBottom: '14px' }}>
              <i className="fa-solid fa-list-check" style={{ color: 'var(--blue)', marginRight: '8px' }}></i>
              Setup Steps
            </div>
            {[
              { n: 1, text: 'Go to developers.facebook.com → My Apps → Create App → Business type' },
              { n: 2, text: 'Add "WhatsApp" and "Leads Access" products to your app' },
              { n: 3, text: 'Go to your Formost Solar Facebook Page → About → copy the Page ID below' },
              { n: 4, text: 'Get Page Access Token from Graph API Explorer (select your page → generate token)' },
              { n: 5, text: 'In your Meta App → Webhooks → Subscribe to "leadgen" events using the webhook URL below' },
              { n: 6, text: 'Add META_VERIFY_TOKEN and META_PAGE_ACCESS_TOKEN to Vercel Environment Variables' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{s.n}</div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.text}</span>
              </div>
            ))}

            {/* Webhook URL box */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Your Webhook URL (paste this in Meta)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ flex: 1, background: '#f0f0ee', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)', border: '1px solid var(--border-color)', wordBreak: 'break-all' }}>
                  https://formostsolar.com/api/meta-webhook
                </code>
                <button className="btnSm" onClick={() => { navigator.clipboard.writeText('https://formostsolar.com/api/meta-webhook'); showToast('Webhook URL copied!'); }}>
                  <i className="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Config form */}
          <div className="tableWrap" style={{ padding: '24px' }}>
            <div className="sectionTitle" style={{ marginBottom: '16px' }}>
              <i className="fa-brands fa-meta" style={{ color: '#0866ff', marginRight: '8px' }}></i>
              Meta Configuration
            </div>
            <div className="formRow">
              <div className="formGroup">
                <label>Page ID</label>
                <input type="text" placeholder="123456789"
                  value={cfg.meta.pageId}
                  onChange={e => set('meta', 'pageId', e.target.value)} />
              </div>
              <div className="formGroup">
                <label>App ID</label>
                <input type="text" placeholder="987654321"
                  value={cfg.meta.appId}
                  onChange={e => set('meta', 'appId', e.target.value)} />
              </div>
            </div>
            <div className="formGroup">
              <label>Page Access Token</label>
              <input type="password" placeholder="EAABs..."
                value={cfg.meta.pageAccessToken}
                onChange={e => set('meta', 'pageAccessToken', e.target.value)} />
            </div>
            <div className="formRow">
              <div className="formGroup">
                <label>Verify Token (must match Vercel env META_VERIFY_TOKEN)</label>
                <input type="text"
                  value={cfg.meta.verifyToken}
                  onChange={e => set('meta', 'verifyToken', e.target.value)} />
              </div>
              <div className="formGroup">
                <label>App Secret</label>
                <input type="password" placeholder="abc123..."
                  value={cfg.meta.appSecret}
                  onChange={e => set('meta', 'appSecret', e.target.value)} />
              </div>
            </div>

            <div className="alertBox" style={{ marginTop: '8px', marginBottom: '16px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              Also add <strong>META_VERIFY_TOKEN</strong> and <strong>META_PAGE_ACCESS_TOKEN</strong> to Vercel → Settings → Environment Variables, then redeploy.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btnSave" onClick={saveMeta}>
                <i className="fa-solid fa-floppy-disk"></i> Save Config
              </button>
              <button className="btnSm" onClick={checkMeta}>
                <i className="fa-solid fa-circle-check"></i> Test Page Connection
              </button>
            </div>
          </div>

          {/* Vercel env vars reminder */}
          <div className="tableWrap" style={{ padding: '24px', marginTop: '16px' }}>
            <div className="sectionTitle" style={{ marginBottom: '14px' }}>
              <i className="fa-solid fa-key" style={{ color: 'var(--amber)', marginRight: '8px' }}></i>
              Vercel Environment Variables to Add
            </div>
            {[
              { key: 'META_VERIFY_TOKEN', value: cfg.meta.verifyToken || 'FORMOST_VERIFY_2024' },
              { key: 'META_PAGE_ACCESS_TOKEN', value: '(your page access token from Meta)' },
              { key: 'SUPABASE_SERVICE_KEY', value: '(service role key from Supabase → Settings → API)' },
            ].map(v => (
              <div key={v.key} style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <code style={{ background: '#f0f0ee', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--red)' }}>{v.key}</code>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>=</span>
                <code style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{v.value}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Team Phones ── */}
      {tab === 'team' && (
        <div className="tableWrap" style={{ padding: '24px' }}>
          <div className="sectionTitle" style={{ marginBottom: '6px' }}>
            <i className="fa-solid fa-phone" style={{ color: 'var(--blue)', marginRight: '8px' }}></i>
            Team WhatsApp Numbers
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Numbers to notify when a lead enters each role's stage.
          </p>
          <div className="formRow">
            {Object.keys(cfg.teamPhones).map(role => (
              <div key={role} className="formGroup">
                <label>{role}</label>
                <input type="text" placeholder="+91 98765 43210"
                  value={cfg.teamPhones[role]}
                  onChange={e => {
                    const updated = { ...cfg, teamPhones: { ...cfg.teamPhones, [role]: e.target.value } };
                    setCfg(updated);
                  }} />
              </div>
            ))}
          </div>
          <button className="btnSave" onClick={() => { persist(cfg); showToast('Team phones saved!'); }}>
            <i className="fa-solid fa-floppy-disk"></i> Save Team Phones
          </button>
        </div>
      )}

      {/* ── Templates ── */}
      {tab === 'templates' && (
        <div className="tableWrap" style={{ padding: '24px' }}>
          <div className="sectionTitle" style={{ marginBottom: '6px' }}>
            <i className="fa-solid fa-envelope" style={{ color: 'var(--red)', marginRight: '8px' }}></i>
            WhatsApp Template Status
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Track approval status manually — check Meta Business Suite for actual status.
          </p>
          {Object.entries(cfg.templateStatus).map(([tpl, status]) => (
            <div key={tpl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'monospace' }}>{tpl}</span>
              <select className="filterSel" value={status}
                onChange={e => {
                  const updated = { ...cfg, templateStatus: { ...cfg.templateStatus, [tpl]: e.target.value } };
                  setCfg(updated);
                }}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          ))}
          <button className="btnSave" style={{ marginTop: '16px' }}
            onClick={() => { persist(cfg); showToast('Template status saved!'); }}>
            <i className="fa-solid fa-floppy-disk"></i> Save Template Status
          </button>
        </div>
      )}

      {/* ── District Map ── */}
      {tab === 'district' && (
        <div className="tableWrap" style={{ padding: '24px' }}>
          <div className="sectionTitle" style={{ marginBottom: '6px' }}>
            <i className="fa-solid fa-map" style={{ color: 'var(--blue)', marginRight: '8px' }}></i>
            District Map — City → District ID
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            One entry per line:&nbsp;
            <code style={{ background: '#f0f0ee', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>
              cityname,districtId
            </code>
            &nbsp;(lowercase city)
          </p>
          {districts && districts.length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {districts.map(d => (
                <span key={d.id} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'var(--blue-light)', color: 'var(--blue)', fontWeight: 700 }}>
                  ID {d.id} = {d.name}
                </span>
              ))}
            </div>
          )}
          <div className="formGroup">
            <textarea
              style={{ width: '100%', minHeight: '180px', fontFamily: 'monospace', fontSize: '13px', padding: '12px', border: '1.5px solid var(--border-color)', borderRadius: '8px', outline: 'none', resize: 'vertical', background: '#fbfbfa' }}
              value={cfg.districtMap}
              onChange={e => setCfg({ ...cfg, districtMap: e.target.value })}
              placeholder={'tirur,1\nmalappuram,1\nkochi,4\ncalicut,2'}
            />
          </div>
          <button className="btnSave"
            onClick={() => { persist(cfg); showToast('District map saved!'); }}>
            <i className="fa-solid fa-floppy-disk"></i> Save District Map
          </button>
        </div>
      )}
    </div>
  );
}
