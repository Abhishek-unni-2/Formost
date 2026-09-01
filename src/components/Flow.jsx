import React, { useState } from 'react';

export default function Flow({
  steps,
  currentUser,
  isHead,
  canEditFlow,
  onOpenAddStepModal,
  onOpenEditStepModal,
  onDeleteStep
}) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);

  const handleStepClick = (index) => {
    if (selectedStepIndex === index) {
      setSelectedStepIndex(null);
    } else {
      setSelectedStepIndex(index);
    }
  };

  const selectedStep = selectedStepIndex !== null ? steps[selectedStepIndex] : null;

  return (
    <div id="page-flow">
      <div className="sectionHead">
        <div className="sectionTitle">
          Flow - <span>{steps.length}</span> steps
        </div>
        {canEditFlow() && (
          <button className="btnSm red" onClick={onOpenAddStepModal}>
            <i className="fa-solid fa-plus"></i> Add step
          </button>
        )}
      </div>

      <div className="flowGrid">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`flowCard ${selectedStepIndex === idx ? 'sel' : ''}`}
            onClick={() => handleStepClick(idx)}
          >
            <div className="flowNum">{s.num}</div>
            <div className="flowIco">
              <i className={`fa-solid ${s.icon || 'fa-circle-dot'}`}></i>
            </div>
            <div className="flowName">{s.title}</div>
            <div className="flowRole">{s.role}</div>
          </div>
        ))}
      </div>

      {canEditFlow() && (
        <div className="addStepBtn" onClick={onOpenAddStepModal}>
          + Add new step
        </div>
      )}

      {selectedStep && (
        <div className="stepPanel open" style={{ display: 'flex' }}>
          <div className="stepPanelIco">
            <i className={`fa-solid ${selectedStep.icon || 'fa-circle-dot'}`}></i>
          </div>
          <div className="stepPanelInfo">
            <div className="stepPanelTitle">
              Step {selectedStep.num} - {selectedStep.title}
            </div>
            <div className="stepPanelDesc">{selectedStep.desc}</div>
            <div className="tagRow">
              <span className="tag tagDept">{selectedStep.dept}</span>
              <span className="tag tagRole">{selectedStep.role}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            <button className="actBtn" onClick={() => onOpenEditStepModal(selectedStepIndex)}>
              <i className="fa-solid fa-pen"></i> Edit
            </button>
            {isHead() && (
              <button
                className="actBtn"
                style={{ color: '#E8161B' }}
                onClick={() => {
                  onDeleteStep(selectedStepIndex);
                  setSelectedStepIndex(null);
                }}
              >
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
