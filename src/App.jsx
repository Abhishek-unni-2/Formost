import React, { useState, useEffect } from 'react';
import {
  ROLE_ACCESS,
  STEPS,
  CUSTOMER_MSGS,
  DISTRICTS,
  USERS,
  LEADS,
  LOGO_SRC
} from './data/mockData';
import * as db from './services/supabaseService';

// Import subcomponents
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MyWork from './components/MyWork';
import Leads from './components/Leads';
import Flow from './components/Flow';
import Quotations from './components/Quotations';
import Team from './components/Team';
import WhatsAppNotify from './components/WhatsAppNotify';
import Users from './components/Users';
import Districts from './components/Districts';
import Profile from './components/Profile';
import CustNotifyPanel from './components/CustNotifyPanel';
import Settings from './components/Settings';
import Reports from './components/Reports';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global DB states (in-memory)
  const [leads, setLeads] = useState(LEADS);
  const [users, setUsers] = useState(USERS);
  const [districts, setDistricts] = useState(DISTRICTS);
  const [steps, setSteps] = useState(STEPS);
  const [quotations, setQuotations] = useState([]);
  
  // Auth state — restored from localStorage on refresh
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fmsUser')) || null; }
    catch { return null; }
  });
  
  // Routing & filtering states
  const [currentPage, setCurrentPage] = useState('dash');
  
  // Custom alerts (toasts)
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  // Modal open states
  const [modalType, setModalType] = useState(null); // 'lead' | 'stage' | 'step' | 'user' | 'district' | 'quote'
  const [editId, setEditId] = useState(null); // ID of entity being edited
  const [stageLeadId, setStageLeadId] = useState(null); // Lead ID being updated in stage modal
  const [selStageVal, setSelStageVal] = useState(null); // Selected step index in stage modal
  const [stageNotes, setStageNotes] = useState('');
  const [editStepIndex, setEditStepIndex] = useState(null); // Step index being edited in flow modal

  // Form input states (modals)
  // Lead Form
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fLocation, setFLocation] = useState('');
  const [fSystem, setFSystem] = useState('');
  const [fSource, setFSource] = useState('Meta Ad');
  const [fStage, setFStage] = useState('1');
  const [fNotes, setFNotes] = useState('');
  
  // Step Form
  const [stTitle, setStTitle] = useState('');
  const [stRole, setStRole] = useState('Telecaller');
  const [stDept, setStDept] = useState('');
  const [stDesc, setStDesc] = useState('');
  const [stIcon, setStIcon] = useState('');

  // User Form
  const [uName, setUName] = useState('');
  const [uPass, setUPass] = useState('');
  const [uRole, setURole] = useState('Telecaller');
  const [uCustomRole, setUCustomRole] = useState('');
  const [uDist, setUDist] = useState('1');

  // District Form
  const [dName, setDName] = useState('');
  const [dLoc, setDLoc] = useState('');

  // Quotation Form
  const [qCustomer, setQCustomer] = useState('');
  const [qPlace, setQPlace] = useState('');
  const [qPhone, setQPhone] = useState('');
  const [qKw, setQKw] = useState('3');
  const [qInverterKw, setQInverterKw] = useState('5');
  const [qCustomMode, setQCustomMode] = useState(false);
  const [qAmount, setQAmount] = useState('');
  const [qNotes, setQNotes] = useState('');
  const [qDate, setQDate] = useState('');

  // Slide-up WhatsApp Notification state
  const [slideNotification, setSlideNotification] = useState(null);

  // Global increment variables
  const [nextDID, setNextDID] = useState(5);
  const [nextUID, setNextUID] = useState(12);
  const [nextLID, setNextLID] = useState(6);
  const [nextQID, setNextQID] = useState(1);

  // Permission helpers
  const isHead = () => currentUser && currentUser.role === 'Head Admin';
  const isAdmin = () => currentUser && (currentUser.role === 'Head Admin' || currentUser.role === 'District Admin');
  
  const canAccessStage = (idx) => {
    if (!currentUser) return false;
    if (isAdmin()) return true;
    // Check step's actual role from Supabase first
    if (steps[idx]?.role === currentUser.role) return true;
    // Fallback to hardcoded ROLE_ACCESS
    const access = ROLE_ACCESS[currentUser.role];
    if (!access) return false;
    if (access === 'all') return true;
    return access.includes(idx);
  };

  const canAddLead = () => {
    return currentUser && (isAdmin() || currentUser.role === 'Telecaller' || currentUser.role === 'Sales Executive');
  };

  const canEditFlow = () => {
    return isHead() || (currentUser && currentUser.role === 'District Admin');
  };

  const distName = (id) => {
    if (!id || id === 0) return 'HQ';
    const d = districts.find(x => x.id === id);
    return d ? d.name : 'Unknown';
  };

  const getStageClass = (s) => {
    if (s <= 4) return 'e';
    if (s <= 9) return 'm';
    if (s <= 12) return 'l';
    return 'd';
  };

  const showToast = (msg, type = '') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3200);
  };

  // Fetch data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      if (!db.isConfigured()) {
        showToast('Running in local/offline backup mode with mock data.', 'error');
        return;
      }
      
      const resDist = await db.fetchDistricts();
      const resUsers = await db.fetchUsers();
      const resSteps = await db.fetchSteps();
      const resLeads = await db.fetchLeads();
      const resQuotes = await db.fetchQuotations();
      
      let errorOccurred = false;
      
      if (resDist.error) errorOccurred = true;
      else if (resDist.data) setDistricts(resDist.data);

      if (resUsers.error) errorOccurred = true;
      else if (resUsers.data) setUsers(resUsers.data);

      if (resSteps.error) errorOccurred = true;
      else if (resSteps.data && resSteps.data.length > 0) setSteps(resSteps.data);

      if (resLeads.error) errorOccurred = true;
      else if (resLeads.data) setLeads(resLeads.data);

      if (resQuotes.error) errorOccurred = true;
      else if (resQuotes.data) setQuotations(resQuotes.data);
      
      if (errorOccurred) {
        showToast('Error syncing with Supabase. Check database tables.', 'error');
      } else {
        showToast('Synced with Supabase successfully!');
      }
    }
    loadData();
  }, []);

  // Login handler
  const handleLoginSuccess = (user) => {
    const { pass, ...safeUser } = user;
    localStorage.setItem('fmsUser', JSON.stringify(safeUser));
    setCurrentUser(user);
    if (user.role === 'Head Admin' || user.role === 'District Admin') {
      setCurrentPage('dash');
    } else {
      setCurrentPage('mywork');
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  // Sign out handler
  const handleLogout = () => {
    localStorage.removeItem('fmsUser');
    setCurrentUser(null);
    setSlideNotification(null);
  };

  // Profile save
  const handleSaveProfile = (profileData) => {
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const updatedUser = {
          ...u,
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email,
          photo: profileData.photo
        };
        if (profileData.password) {
          updatedUser.pass = profileData.password;
        }
        db.saveUser(updatedUser).catch(err => console.error(err));
        return updatedUser;
      }
      return u;
    });
    setUsers(updatedUsers);
    
    // Sync current user context
    setCurrentUser(prev => ({
      ...prev,
      name: profileData.name,
      photo: profileData.photo
    }));
    
    showToast('Profile saved!');
  };

  // Districts management CRUD
  const handleSaveDistrict = (e) => {
    e.preventDefault();
    if (!dName.trim()) {
      showToast('Enter district name!', 'error');
      return;
    }

    if (editId) {
      const updated = { id: editId, name: dName.trim(), location: dLoc.trim() };
      setDistricts(districts.map(d => d.id === editId ? updated : d));
      db.saveDistrict(updated).catch(err => console.error(err));
      showToast('District updated!');
    } else {
      const newD = { name: dName.trim(), location: dLoc.trim() };
      if (!db.isConfigured()) {
        setDistricts([...districts, { ...newD, id: nextDID }]);
        setNextDID(nextDID + 1);
      } else {
        db.saveDistrict(newD).then(res => {
          if (res.data) setDistricts(prev => [...prev, res.data]);
        }).catch(err => console.error(err));
      }
      showToast('District added!');
    }
    closeModal();
  };

  const handleDeleteDistrict = (id, leadsCount) => {
    if (!window.confirm(`Delete this district?${leadsCount ? ` (${leadsCount} leads exist)` : ''}`)) return;
    setDistricts(districts.filter(d => d.id !== id));
    db.deleteDistrict(id).catch(err => console.error(err));
    showToast('District deleted.');
  };

  // Users management CRUD
  const handleSaveUser = (e) => {
    e.preventDefault();
    const name = uName.trim();
    const pwd = uPass.trim();
    let role = uRole;
    if (role === 'Custom') role = uCustomRole.trim();
    const did = role === 'Head Admin' ? 0 : (isHead() ? parseInt(uDist) : currentUser.districtId);

    if (!name || !pwd || !role) {
      showToast('Fill all fields!', 'error');
      return;
    }

    if (editId) {
      const existing = users.find(u => u.id === editId) || {};
      // Merge onto the existing record so phone/email/photo aren't wiped in the DB
      const updated = { ...existing, id: editId, name, pass: pwd, role, districtId: did };
      setUsers(users.map(u => u.id === editId ? updated : u));
      if (currentUser.id === editId) {
        setCurrentUser(prev => ({ ...prev, name, role }));
      }
      db.saveUser(updated).catch(err => console.error(err));
      showToast('User updated!');
    } else {
      const newUser = { name, pass: pwd, role, districtId: did, phone: '', email: '', photo: '' };
      if (!db.isConfigured()) {
        setUsers([...users, { ...newUser, id: nextUID }]);
        setNextUID(nextUID + 1);
      } else {
        db.saveUser(newUser).then(res => {
          if (res.data) setUsers(prev => [...prev, res.data]);
        }).catch(err => console.error(err));
      }
      showToast('User added!');
    }
    closeModal();
  };

  const handleDeleteUser = (id) => {
    const u = users.find(x => x.id === id);
    if (!isHead() && u && u.districtId !== currentUser.districtId) {
      showToast('Cannot delete users from another district.', 'error');
      return;
    }
    if (u && u.role === 'Head Admin' && !isHead()) {
      showToast('Only Head Admin can remove another Head Admin.', 'error');
      return;
    }
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    setUsers(users.filter(x => x.id !== id));
    db.deleteUser(id).catch(err => console.error(err));
    showToast('User deleted.');
  };

  // Lead stages update & notify
  const checkStageNotify = (stg, name, phone) => {
    const templateMsg = CUSTOMER_MSGS[stg];
    if (!templateMsg) return;

    const message = templateMsg.replace('{name}', name);
    setSlideNotification({
      name,
      phone,
      message,
      stage: stg
    });
  };

  const handleApplyStage = (e) => {
    e.preventDefault();
    if (!selStageVal) return;

    let targetLead = null;
    const updatedLeads = leads.map(l => {
      if (l.id === stageLeadId) {
        const status = selStageVal === steps.length ? 'closed' : selStageVal <= 3 ? 'pending' : 'active';
        
        // Trigger slide notification async
        checkStageNotify(selStageVal, l.name, l.phone);

        const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
        const noteEntry = stageNotes.trim()
          ? `[Step ${selStageVal} – ${timestamp} – ${currentUser.name}] ${stageNotes.trim()}`
          : null;
        targetLead = {
          ...l,
          stage: selStageVal,
          status: status,
          notes: noteEntry
            ? (l.notes ? l.notes + '\n' + noteEntry : noteEntry)
            : l.notes
        };
        return targetLead;
      }
      return l;
    });

    setLeads(updatedLeads);
    if (targetLead) {
      db.saveLead(targetLead).catch(err => console.error(err));
    }
    showToast(`Stage updated to Step ${selStageVal}`);
    closeModal();
  };

  // Leads CRUD
  const handleSaveLead = (e) => {
    e.preventDefault();
    const name = fName.trim();
    const phone = fPhone.trim();
    const location = fLocation.trim();

    if (!name || !phone || !location) {
      showToast('Fill required fields!', 'error');
      return;
    }

    const stageNum = parseInt(fStage);
    const districtId = currentUser.districtId === 0
      ? (editId ? leads.find(l => l.id === editId).districtId : 1)
      : currentUser.districtId;

    const leadData = {
      name,
      phone,
      location,
      system: fSystem.trim(),
      source: fSource,
      stage: stageNum,
      status: stageNum === steps.length ? 'closed' : stageNum <= 3 ? 'pending' : 'active',
      notes: fNotes.trim(),
      districtId
    };

    const prevStage = editId ? leads.find(l => l.id === editId)?.stage : null;
    const stageChanged = !editId || stageNum !== prevStage;

    if (editId) {
      const updated = { ...leadData, id: editId };
      setLeads(leads.map(l => l.id === editId ? { ...l, ...updated } : l));
      db.saveLead(updated).catch(err => console.error(err));
      showToast('Lead updated!');
    } else {
      const newLead = {
        ...leadData,
        date: new Date().toISOString().split('T')[0]
      };
      if (!db.isConfigured()) {
        setLeads([...leads, { ...newLead, id: nextLID }]);
        setNextLID(nextLID + 1);
      } else {
        db.saveLead(newLead).then(res => {
          if (res.data) setLeads(prev => [...prev, res.data]);
        }).catch(err => console.error(err));
      }
      showToast('Lead added!');
    }

    // Trigger the customer WhatsApp notification only when the stage actually
    // changed (or on a brand-new lead) — not on every minor edit.
    if (stageChanged) {
      checkStageNotify(stageNum, name, phone);
    }
    closeModal();
  };

  const handleDeleteLead = (id) => {
    const l = leads.find(x => x.id === id);
    if (!isHead() && l && l.districtId !== currentUser.districtId) {
      showToast("Cannot delete another district's lead.", 'error');
      return;
    }
    if (!window.confirm('Delete this lead?')) return;
    setLeads(leads.filter(x => x.id !== id));
    db.deleteLead(id).catch(err => console.error(err));
    showToast('Lead deleted.');
  };

  // Flow steps CRUD
  const handleSaveStep = (e) => {
    e.preventDefault();
    const title = stTitle.trim();
    if (!title) {
      showToast('Enter step title!', 'error');
      return;
    }

    const stepData = {
      icon: stIcon.trim() || 'fa-circle-dot',
      title,
      role: stRole,
      dept: stDept.trim() || 'General',
      desc: stDesc.trim()
    };

    if (editStepIndex !== null) {
      const updatedStep = {
        ...steps[editStepIndex],
        ...stepData
      };
      const updatedSteps = [...steps];
      updatedSteps[editStepIndex] = updatedStep;
      setSteps(updatedSteps);
      db.saveStep(updatedStep).catch(err => console.error(err));
      showToast('Step updated!');
    } else {
      const nextNum = String(steps.length + 1).padStart(2, '0');
      const newStep = { ...stepData, num: nextNum };
      setSteps([...steps, newStep]);
      db.saveStep(newStep).catch(err => console.error(err));
      showToast('Step added!');
    }
    closeModal();
  };

  const handleDeleteStep = (index) => {
    if (!window.confirm('Delete this step?')) return;
    const targetStep = steps[index];
    const filteredSteps = steps.filter((_, idx) => idx !== index);
    // Re-index steps sequence numbers
    const reindexedSteps = filteredSteps.map((s, idx) => ({
      ...s,
      num: String(idx + 1).padStart(2, '0')
    }));
    setSteps(reindexedSteps);

    // Keep lead stages aligned with the renumbered steps: the deleted step is
    // step number `index + 1` (1-based). Leads past it shift down one; leads
    // sitting on it fall back to the previous step (min 1).
    const deletedNum = index + 1;
    const newLen = reindexedSteps.length;
    const remapStage = (stage) => {
      if (stage > deletedNum) return stage - 1;
      if (stage === deletedNum) return Math.max(1, deletedNum - 1);
      return stage;
    };
    const remappedLeads = leads.map(l => {
      const newStage = remapStage(l.stage);
      if (newStage === l.stage) return l;
      const status = newStage === newLen ? 'closed' : newStage <= 3 ? 'pending' : 'active';
      const updated = { ...l, stage: newStage, status };
      db.saveLead(updated).catch(err => console.error(err));
      return updated;
    });
    setLeads(remappedLeads);

    db.deleteStep(targetStep.num)
      .then(() => {
        reindexedSteps.forEach(s => db.saveStep(s).catch(err => console.error(err)));
      })
      .catch(err => console.error(err));
    showToast('Step deleted.');
  };

  // Quotations CRUD
  const handleSaveQuotation = (e) => {
    e.preventDefault();
    const cName = qCustomer.trim();
    const amtStr = qAmount.trim();

    if (!cName || !amtStr) {
      showToast('Fill required fields!', 'error');
      return;
    }

    const parsedAmount = parseInt(amtStr.replace(/,/g, ''));
    
    const quoteData = {
      customerName: cName,
      place: qPlace.trim(),
      phone: qPhone.trim(),
      kw: qCustomMode ? `${qKw}|${qInverterKw}` : qKw,
      amount: parsedAmount,
      date: qDate,
      notes: qNotes.trim(),
      createdBy: currentUser.name,
      districtId: currentUser.districtId
    };

    if (editId) {
      const updated = { ...quoteData, id: editId };
      setQuotations(quotations.map(q => q.id === editId ? updated : q));
      db.saveQuotation(updated).catch(err => console.error(err));
      showToast('Quotation updated!');
    } else {
      if (!db.isConfigured()) {
        const newQuote = { ...quoteData, id: nextQID };
        setQuotations([...quotations, newQuote]);
        setNextQID(nextQID + 1);
      } else {
        db.saveQuotation(quoteData).then(res => {
          if (res.data) setQuotations(prev => [...prev, res.data]);
        }).catch(err => console.error(err));
      }
      showToast('Quotation created!');
    }
    closeModal();
  };

  const handleDeleteQuote = (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    setQuotations(quotations.filter(q => q.id !== id));
    db.deleteQuotation(id).catch(err => console.error(err));
    showToast('Quotation deleted.');
  };

  // Modal handlers
  const openModal = (type, id = null, extraIdx = null) => {
    setModalType(type);
    setEditId(id);

    if (type === 'lead') {
      if (id) {
        const l = leads.find(x => x.id === id);
        setFName(l.name);
        setFPhone(l.phone);
        setFLocation(l.location);
        setFSystem(l.system || '');
        setFSource(l.source || 'Meta Ad');
        setFStage(String(l.stage));
        setFNotes(l.notes || '');
      } else {
        setFName('');
        setFPhone('');
        setFLocation('');
        setFSystem('');
        setFSource('Meta Ad');
        setFStage('1');
        setFNotes('');
      }
    } else if (type === 'stage') {
      const l = leads.find(x => x.id === id);
      setStageLeadId(id);
      setSelStageVal(l.stage);
    } else if (type === 'step') {
      if (extraIdx !== null) {
        setEditStepIndex(extraIdx);
        const s = steps[extraIdx];
        setStTitle(s.title);
        setStRole(s.role);
        setStDept(s.dept);
        setStDesc(s.desc);
        setStIcon(s.icon);
      } else {
        setEditStepIndex(null);
        setStTitle('');
        setStRole('Telecaller');
        setStDept('');
        setStDesc('');
        setStIcon('');
      }
    } else if (type === 'user') {
      if (id) {
        const u = users.find(x => x.id === id);
        setUName(u.name);
        setUPass(u.pass);
        const stdRoles = ["Head Admin", "District Admin", "Telecaller", "Sales Executive", "Accounts", "Finance", "Purchase", "Supervisor", "Technical Chief"];
        if (stdRoles.includes(u.role)) {
          setURole(u.role);
          setUCustomRole('');
        } else {
          setURole('Custom');
          setUCustomRole(u.role);
        }
        setUDist(String(u.districtId));
      } else {
        setUName('');
        setUPass('');
        setURole('Telecaller');
        setUCustomRole('');
        setUDist('1');
      }
    } else if (type === 'district') {
      if (id) {
        const d = districts.find(x => x.id === id);
        setDName(d.name);
        setDLoc(d.location);
      } else {
        setDName('');
        setDLoc('');
      }
    } else if (type === 'quote') {
      if (id) {
        const q = quotations.find(x => x.id === id);
        setQCustomer(q.customerName);
        setQPlace(q.place || '');
        setQPhone(q.phone || '');
        setQAmount(String(q.amount));
        setQDate(q.date);
        setQNotes(q.notes || '');
        if (q.kw && q.kw.includes('|')) {
          const [pKw, iKw] = q.kw.split('|');
          setQKw(pKw);
          setQInverterKw(iKw);
          setQCustomMode(true);
        } else {
          setQKw(q.kw || '3');
          setQInverterKw('5');
          setQCustomMode(false);
        }
      } else {
        setQCustomer('');
        setQPlace('');
        setQPhone('');
        setQKw('3');
        setQInverterKw('5');
        setQCustomMode(false);
        setQAmount('');
        setQDate(new Date().toISOString().split('T')[0]);
        setQNotes('');
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditId(null);
    setStageLeadId(null);
    setSelStageVal(null);
    setEditStepIndex(null);
    setStageNotes('');
    setQCustomMode(false);
    setQInverterKw('5');
  };

  const handleFilterLeadsByDistrict = (distId, name) => {
    setCurrentPage('leads');
    showToast(`Showing ${name} leads`);
  };

  return (
    <React.Fragment>
      {!currentUser ? (
        <Login
          users={users}
          onLoginSuccess={handleLoginSuccess}
          distName={distName}
        />
      ) : (
        <div id="appScreen" className="visible">
          <Sidebar
            currentUser={currentUser}
            currentPage={currentPage}
            setCurrentPage={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
            onLogout={handleLogout}
            distName={distName}
            isHead={isHead}
            isAdmin={isAdmin}
            canAddLead={canAddLead}
            openAddLeadModal={() => { openModal('lead'); setSidebarOpen(false); }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="mainArea">
            <div className="topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="hamburgerBtn" onClick={() => setSidebarOpen(true)}>
                  <i className="fa-solid fa-bars"></i>
                </button>
                <div className="topbarTitle" id="pageTitle">
                  {currentPage === 'dash' && 'DASHBOARD'}
                  {currentPage === 'mywork' && 'MY WORK'}
                  {currentPage === 'districts' && 'ALL DISTRICTS'}
                  {currentPage === 'flow' && 'FLOW OVERVIEW'}
                  {currentPage === 'leads' && 'ALL LEADS'}
                  {currentPage === 'team' && 'TEAM'}
                  {currentPage === 'notify' && 'WHATSAPP NOTIFY'}
                  {currentPage === 'quotations' && 'QUOTATIONS'}
                  {currentPage === 'users' && 'MANAGE USERS'}
                  {currentPage === 'distmgr' && 'MANAGE DISTRICTS'}
                  {currentPage === 'profile' && 'MY PROFILE'}
                  {currentPage === 'settings' && 'SETTINGS'}
                  {currentPage === 'reports' && 'REPORTS'}
                </div>
              </div>
              <div>
                {canAddLead() && (
                  <button className="btnSm red" onClick={() => openModal('lead')}>
                    <i className="fa-solid fa-plus"></i> New lead
                  </button>
                )}
              </div>
            </div>

            <div className="pageContent">
              {currentPage === 'dash' && (
                <Dashboard
                  leads={leads}
                  isAdmin={isAdmin}
                  distName={distName}
                  stepsLength={steps.length}
                  getStageClass={getStageClass}
                  onOpenStageModal={(id) => openModal('stage', id)}
                  canAccessStage={canAccessStage}
                />
              )}

              {currentPage === 'mywork' && (
                <MyWork
                  leads={leads}
                  currentUser={currentUser}
                  distName={distName}
                  steps={steps}
                  onOpenStageModal={(id) => openModal('stage', id)}
                  roleAccess={ROLE_ACCESS}
                />
              )}

              {currentPage === 'districts' && (
                <Districts
                  districts={districts}
                  leads={leads}
                  users={users}
                  isHead={isHead}
                  managerMode={false}
                  onFilterLeadsByDistrict={handleFilterLeadsByDistrict}
                />
              )}

              {currentPage === 'flow' && (
                <Flow
                  steps={steps}
                  currentUser={currentUser}
                  isHead={isHead}
                  canEditFlow={canEditFlow}
                  onOpenAddStepModal={() => openModal('step')}
                  onOpenEditStepModal={(idx) => openModal('step', null, idx)}
                  onDeleteStep={handleDeleteStep}
                />
              )}

              {currentPage === 'leads' && (
                <Leads
                  leads={leads}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  isHead={isHead}
                  distName={distName}
                  steps={steps}
                  getStageClass={getStageClass}
                  onOpenStageModal={(id) => openModal('stage', id)}
                  onOpenEditLeadModal={(id) => openModal('lead', id)}
                  onDeleteLead={handleDeleteLead}
                  canAccessStage={canAccessStage}
                />
              )}

              {currentPage === 'team' && (
                <Team
                  users={users}
                  currentUser={currentUser}
                  steps={steps}
                  isHead={isHead}
                  distName={distName}
                />
              )}

              {currentPage === 'notify' && (
                <WhatsAppNotify
                  leads={leads}
                  currentUser={currentUser}
                  isHead={isHead}
                  distName={distName}
                  steps={steps}
                />
              )}

              {currentPage === 'quotations' && (
                <Quotations
                  quotations={quotations}
                  currentUser={currentUser}
                  distName={distName}
                  onOpenAddQuoteModal={() => openModal('quote')}
                  onOpenEditQuoteModal={(id) => openModal('quote', id)}
                  onDeleteQuote={handleDeleteQuote}
                />
              )}

              {currentPage === 'users' && (
                <Users
                  users={users}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  isHead={isHead}
                  distName={distName}
                  onOpenAddUserModal={() => openModal('user')}
                  onOpenEditUserModal={(id) => openModal('user', id)}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {currentPage === 'distmgr' && (
                <Districts
                  districts={districts}
                  leads={leads}
                  users={users}
                  isHead={isHead}
                  managerMode={true}
                  onOpenAddDistrictModal={() => openModal('district')}
                  onOpenEditDistrictModal={(id) => openModal('district', id)}
                  onDeleteDistrict={handleDeleteDistrict}
                />
              )}

              {currentPage === 'profile' && (
                <Profile
                  currentUser={currentUser}
                  distName={distName}
                  onSaveProfile={handleSaveProfile}
                />
              )}

              {currentPage === 'settings' && (
                <Settings
                  showToast={showToast}
                  districts={districts}
                />
              )}

              {currentPage === 'reports' && (
                <Reports
                  leads={leads}
                  steps={steps}
                  users={users}
                  currentUser={currentUser}
                  isHead={isHead}
                  distName={distName}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-up WhatsApp Notification panel */}
      <CustNotifyPanel
        slideNotification={slideNotification}
        onClose={() => setSlideNotification(null)}
        steps={steps}
      />

      {/* Toast Alert */}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type === 'error' ? 'error' : ''}`} id="toast">
        <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
        <span id="toastMsg">{toast.msg}</span>
      </div>

      {/* ==================================== */}
      {/* OVERLAY MODALS REGISTRY              */}
      {/* ==================================== */}
      
      {/* 1. Add / Edit Lead Modal */}
      {modalType === 'lead' && (
        <div className="modal open" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal open' && closeModal()}>
          <div className="modalBox">
            <div className="modalHead">
              <div className="modalTitle">{editId ? 'Edit lead' : 'Add lead'}</div>
              <button className="modalClose" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <form onSubmit={handleSaveLead}>
              <div className="formRow">
                <div className="formGroup">
                  <label>Full name *</label>
                  <input
                    type="text"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    placeholder="Rajesh Kumar"
                    required
                  />
                </div>
                <div className="formGroup">
                  <label>Phone *</label>
                  <input
                    type="text"
                    value={fPhone}
                    onChange={(e) => setFPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
              <div className="formRow">
                <div className="formGroup">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={fLocation}
                    onChange={(e) => setFLocation(e.target.value)}
                    placeholder="Malappuram town"
                    required
                  />
                </div>
                <div className="formGroup">
                  <label>System size</label>
                  <input
                    type="text"
                    value={fSystem}
                    onChange={(e) => setFSystem(e.target.value)}
                    placeholder="3 kW"
                  />
                </div>
              </div>
              <div className="formRow">
                <div className="formGroup">
                  <label>Lead source</label>
                  <select value={fSource} onChange={(e) => setFSource(e.target.value)}>
                    <option value="Meta Ad">Meta Ad</option>
                    <option value="Google Ad">Google Ad</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Referral">Referral</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label>Current stage</label>
                  <select value={fStage} onChange={(e) => setFStage(e.target.value)}>
                    {steps.map((s, idx) => (
                      <option key={s.num} value={String(idx + 1)}>
                        {s.num} - {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="formGroup">
                <label>Notes</label>
                <textarea
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  placeholder="Any extra info..."
                />
              </div>
              <div className="modalFoot">
                <button type="button" className="btnCancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btnSave">Save lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Update Stage Modal */}
      {modalType === 'stage' && (
        <div className="modal open" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal open' && closeModal()}>
          <div className="modalBox sm">
            <div className="modalHead">
              <div className="modalTitle">Update stage</div>
              <button className="modalClose" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <form onSubmit={handleApplyStage}>
              {!isAdmin() && (
                <div className="alertBox">
                  <i className="fa-solid fa-circle-info"></i> You can only access your assigned stages.
                </div>
              )}
              <div className="stageGrid">
                {steps.map((s, i) => {
                  const locked = !canAccessStage(i);
                  const stepVal = i + 1;
                  return (
                    <div
                      key={s.num}
                      className={`stageOpt ${selStageVal === stepVal ? 'sel' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => !locked && setSelStageVal(stepVal)}
                    >
                      <div className="stageOptNum">Step {stepVal}</div>
                      <div className="stageOptName">{s.title}</div>
                    </div>
                  );
                })}
              </div>
              <div className="formGroup" style={{ marginTop: '16px' }}>
                <label>Call / stage notes (optional)</label>
                <textarea
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="e.g. Customer interested, callback scheduled for tomorrow..."
                  rows={3}
                />
              </div>
              <div className="modalFoot">
                <button type="button" className="btnCancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btnSave">Update stage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add / Edit Flow Step Modal */}
      {modalType === 'step' && (
        <div className="modal open" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal open' && closeModal()}>
          <div className="modalBox sm">
            <div className="modalHead">
              <div className="modalTitle">{editStepIndex !== null ? 'Edit flow step' : 'Add flow step'}</div>
              <button className="modalClose" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <form onSubmit={handleSaveStep}>
              <div className="formGroup">
                <label>Step title *</label>
                <input
                  type="text"
                  value={stTitle}
                  onChange={(e) => setStTitle(e.target.value)}
                  placeholder="e.g. Quality Check"
                  required
                />
              </div>
              <div className="formGroup">
                <label>Responsible role *</label>
                <select value={stRole} onChange={(e) => setStRole(e.target.value)}>
                  <option value="Telecaller">Telecaller</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Finance">Finance</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Technical Chief">Technical Chief</option>
                  <option value="District Admin">District Admin</option>
                </select>
              </div>
              <div className="formGroup">
                <label>Department</label>
                <input
                  type="text"
                  value={stDept}
                  onChange={(e) => setStDept(e.target.value)}
                  placeholder="e.g. Technical"
                />
              </div>
              <div className="formGroup">
                <label>Description</label>
                <textarea
                  value={stDesc}
                  onChange={(e) => setStDesc(e.target.value)}
                  placeholder="What happens in this step..."
                />
              </div>
              <div className="formGroup">
                <label>Font Awesome icon (optional)</label>
                <input
                  type="text"
                  value={stIcon}
                  onChange={(e) => setStIcon(e.target.value)}
                  placeholder="fa-check"
                />
              </div>
              <div className="modalFoot">
                <button type="button" className="btnCancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btnSave">Save step</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add / Edit User Modal */}
      {modalType === 'user' && (
        <div className="modal open" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal open' && closeModal()}>
          <div className="modalBox sm">
            <div className="modalHead">
              <div className="modalTitle">{editId ? 'Edit user' : 'Add user'}</div>
              <button className="modalClose" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="formRow">
                <div className="formGroup">
                  <label>Full name *</label>
                  <input
                    type="text"
                    value={uName}
                    onChange={(e) => setUName(e.target.value)}
                    placeholder="Mohammed Razal"
                    required
                  />
                </div>
                <div className="formGroup">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={uPass}
                    onChange={(e) => setUPass(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                  />
                </div>
              </div>
              <div className="formGroup">
                <label>Role *</label>
                <select value={uRole} onChange={(e) => setURole(e.target.value)}>
                  {isHead() && <option value="Head Admin">Head Admin</option>}
                  <option value="District Admin">District Admin</option>
                  <option value="Telecaller">Telecaller</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Finance">Finance</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Technical Chief">Technical Chief</option>
                  <option value="Custom">Custom role...</option>
                </select>
              </div>
              {uRole === 'Custom' && (
                <div className="formGroup">
                  <label>Custom role name</label>
                  <input
                    type="text"
                    value={uCustomRole}
                    onChange={(e) => setUCustomRole(e.target.value)}
                    placeholder="Enter role"
                    required
                  />
                </div>
              )}
              {isHead() && uRole !== 'Head Admin' && (
                <div className="formGroup">
                  <label>District *</label>
                  <select value={uDist} onChange={(e) => setUDist(e.target.value)}>
                    {districts.map(d => (
                      <option key={d.id} value={String(d.id)}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modalFoot">
                <button type="button" className="btnCancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btnSave">Save user</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add / Edit District Modal */}
      {modalType === 'district' && (
        <div className="modal open" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal open' && closeModal()}>
          <div className="modalBox sm">
            <div className="modalHead">
              <div className="modalTitle">{editId ? 'Edit district' : 'Add district'}</div>
              <button className="modalClose" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <form onSubmit={handleSaveDistrict}>
              <div className="formGroup">
                <label>District name *</label>
                <input
                  type="text"
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="e.g. Malappuram"
                  required
                />
              </div>
              <div className="formGroup">
                <label>Office location</label>
                <input
                  type="text"
                  value={dLoc}
                  onChange={(e) => setDLoc(e.target.value)}
                  placeholder="e.g. Tirur"
                />
              </div>
              <div className="modalFoot">
                <button type="button" className="btnCancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btnSave">Save district</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add / Edit Quotation Modal */}
      {modalType === 'quote' && (
        <div className="modal open" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal open' && closeModal()}>
          <div className="modalBox">
            <div className="modalHead">
              <div className="modalTitle">{editId ? 'Edit Quotation' : 'New Quotation'}</div>
              <button className="modalClose" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <form onSubmit={handleSaveQuotation}>
              {/* Custom config toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '10px 14px', background: qCustomMode ? '#fff8f0' : '#f5f5f3', borderRadius: '8px', border: `1px solid ${qCustomMode ? '#E8161B33' : '#e4e2dd'}` }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  <input type="checkbox" checked={qCustomMode} onChange={(e) => setQCustomMode(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#E8161B' }} />
                  Custom config (different panel & inverter kW)
                </label>
              </div>

              {qCustomMode ? (
                /* CUSTOM MODE — minimal fields */
                <>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Customer name *</label>
                      <input type="text" value={qCustomer} onChange={(e) => setQCustomer(e.target.value)} placeholder="Rajesh Kumar" required />
                    </div>
                    <div className="formGroup">
                      <label>Phone *</label>
                      <input type="text" value={qPhone} onChange={(e) => setQPhone(e.target.value)} placeholder="+91 98765 43210" required />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Panel size (kW) *</label>
                      <select value={qKw} onChange={(e) => setQKw(e.target.value)}>
                        <option value="3">3 kW panels</option>
                        <option value="5">5 kW panels</option>
                        <option value="8">8 kW panels</option>
                        <option value="10">10 kW panels</option>
                      </select>
                    </div>
                    <div className="formGroup">
                      <label>Inverter size (kVA) *</label>
                      <select value={qInverterKw} onChange={(e) => setQInverterKw(e.target.value)}>
                        <option value="3">3 kVA inverter</option>
                        <option value="5">5 kVA inverter</option>
                        <option value="8">8 kVA inverter</option>
                        <option value="10">10 kVA inverter</option>
                      </select>
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Total amount (Rs.) *</label>
                    <input type="number" value={qAmount} onChange={(e) => setQAmount(e.target.value)} placeholder="175000" required />
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', padding: '8px 12px', background: '#f0f0ee', borderRadius: '6px' }}>
                    Quotation will use <b>{qKw} kW</b> panel BOM with a <b>{qInverterKw} kVA</b> inverter. Date auto-set to today.
                  </div>
                </>
              ) : (
                /* STANDARD MODE */
                <>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Customer name *</label>
                      <input type="text" value={qCustomer} onChange={(e) => setQCustomer(e.target.value)} placeholder="Rajesh Kumar" required />
                    </div>
                    <div className="formGroup">
                      <label>Location</label>
                      <input type="text" value={qPlace} onChange={(e) => setQPlace(e.target.value)} placeholder="Tirur, Malappuram" />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Phone</label>
                      <input type="text" value={qPhone} onChange={(e) => setQPhone(e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                    <div className="formGroup">
                      <label>System size *</label>
                      <select value={qKw} onChange={(e) => setQKw(e.target.value)}>
                        <option value="3">3 kW</option>
                        <option value="5">5 kW</option>
                        <option value="8">8 kW</option>
                        <option value="10">10 kW</option>
                      </select>
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Total amount (Rs.) *</label>
                      <input type="number" value={qAmount} onChange={(e) => setQAmount(e.target.value)} placeholder="175000" required />
                    </div>
                    <div className="formGroup">
                      <label>Date</label>
                      <input type="date" value={qDate} onChange={(e) => setQDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Notes</label>
                    <textarea value={qNotes} onChange={(e) => setQNotes(e.target.value)} placeholder="Any special notes..." />
                  </div>
                </>
              )}
              <div className="modalFoot">
                <button type="button" className="btnCancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btnSave">Save quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
