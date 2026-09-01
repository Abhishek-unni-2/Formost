import React, { useEffect, useRef, useState } from 'react';

export default function CustNotifyPanel({
  slideNotification,
  onClose,
  steps
}) {
  const [copied, setCopied] = useState(false);

  // Keep the latest onClose without making it an effect dependency, so a parent
  // re-render doesn't restart the auto-hide timer.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!slideNotification) return;

    // Reset copy state
    setCopied(false);

    // Auto-hide panel after 20 seconds
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 20000);

    return () => clearTimeout(timer);
  }, [slideNotification]);

  if (!slideNotification) return null;

  const { name, phone, message, stage } = slideNotification;

  const stepName = steps[stage - 1] ? steps[stage - 1].title : `Stage ${stage}`;

  // Clean phone number for WhatsApp link
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      id="custNotifyPanel"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: 'min(380px, 100vw)',
        maxWidth: '100vw',
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,.15)',
        zIndex: 800,
        transform: slideNotification ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        borderTop: '3px solid #25d366'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '15px' }}>
            <i className="fa-brands fa-whatsapp"></i>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }} id="cnpTitle">
              Step {stage} - {stepName}
            </div>
            <div style={{ fontSize: '11px', color: '#99968e' }} id="cnpName">
              {name}
            </div>
          </div>
        </div>
        <button
          id="cnpClose"
          onClick={onClose}
          style={{
            border: 'none',
            background: '#f0efed',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#55524a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="fa-solid fa-x"></i>
        </button>
      </div>
      
      <div
        id="cnpMsg"
        style={{
          margin: '0 18px 12px',
          background: '#f0efed',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '12px',
          color: '#55524a',
          lineHeight: '1.7',
          borderLeft: '3px solid #25d366',
          maxHeight: '140px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap'
        }}
      >
        {message}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', padding: '0 18px 16px' }}>
        <a id="cnpWABtn" href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
          <button
            style={{
              width: '100%',
              padding: '10px',
              background: '#25d366',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-brands fa-whatsapp"></i> Send on WhatsApp
          </button>
        </a>
        <button
          id="cnpCopyBtn"
          onClick={handleCopy}
          style={{
            padding: '10px 14px',
            background: '#fff',
            border: '1.5px solid #e4e2dd',
            borderRadius: '10px',
            color: '#55524a',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {copied ? (
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
}
