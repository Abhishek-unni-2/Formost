import React, { useState } from 'react';
import { LOGO_SRC, KW_TEMPLATES } from '../data/mockData';

export default function Quotations({
  quotations,
  currentUser,
  distName,
  onOpenAddQuoteModal,
  onOpenEditQuoteModal,
  onDeleteQuote
}) {
  const [previewQuote, setPreviewQuote] = useState(null);

  const formatAmount = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getLocalDateStr = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Resolves template for both standard ("3") and custom ("3|5") kw formats
  const resolveTemplate = (kw) => {
    if (kw && kw.includes('|')) {
      const [panelKw, inverterKw] = kw.split('|');
      const panelT = KW_TEMPLATES[panelKw] || KW_TEMPLATES["3"];
      const inverterT = KW_TEMPLATES[inverterKw] || KW_TEMPLATES["5"];
      return {
        ...panelT,
        inverter: inverterT.inverter,
        inverterKw,
        isCustom: true,
        heading: `${panelKw} KW SOLAR PANELS + ${inverterKw} KVA ON-GRID POWER PLANT`,
        systemDesc: `${panelKw} kW solar panel system (half cut bi-facial topcon) of ADANI/WAREE/SAATVIK (30 year Performance Warranty) with ${inverterKw} KVA on-grid SOLIS/UTL/SOLAIRE/DEYE inverter (10 year Warranty). AC-DB, DCDB = HAVELLS PREMIUM`
      };
    }
    const t = KW_TEMPLATES[kw] || KW_TEMPLATES["3"];
    return {
      ...t,
      inverterKw: t.kw,
      isCustom: false,
      heading: `${t.kw} KWA ON-GRID POWER PLANT`,
      systemDesc: `${t.kw} kW on-grid system using half cut bi-facial topcon solar panels of ADANI/WAREE/SAATVIK (30 year Performance Warranty).\nAnd ${t.kw} kW on-grid SOLIS/UTL/SOLAIRE/DEYE inverter (10 year Warranty).\nAC-DB, DCDB = HAVELLS PREMIUM`
    };
  };

  const buildQuoteBody = (q, t, dateStr) => {
    const amt = formatAmount(q.amount);
    return `
      <div style="text-align:center;margin-bottom:20px">
        <img src="${LOGO_SRC}" style="height:60px;object-fit:contain;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto" alt="Formost">
        <div style="font-size:11px;color:#888;letter-spacing:1px;margin-top:2px;font-family:Arial,sans-serif">FOR THE FUTURE</div>
      </div>
      <p style="font-weight:700;margin-bottom:16px;font-family:Arial,sans-serif">Greetings from FORMOST Power Systems!</p>
      <p style="margin-bottom:6px;font-family:Arial,sans-serif"><b>Atte : ${q.customerName}</b>${q.place ? ", " + q.place : ""}</p>
      <p style="margin-bottom:6px;font-family:Arial,sans-serif"><b>Date:</b> ${dateStr}</p><br>
      <p style="font-style:italic;margin-bottom:20px;line-height:1.6;font-family:Arial,sans-serif"><b>Dear Sir/Madam,</b> &nbsp; At the outset I would like to thank you for the interest you have shown in our company & its range of products. The price for the products you have enquired are mentioned below.</p>

      <div style="border:2px solid #333;padding:20px;margin-bottom:20px;font-family:Arial,sans-serif">
        <div style="text-align:center;font-size:16px;font-weight:900;text-decoration:underline;margin-bottom:14px">${t.heading}</div>
        <p style="font-weight:700;line-height:1.8;margin-bottom:16px">${t.systemDesc.replace(/\n/g, '<br>')}</p>
        <div style="text-align:center;font-size:18px;font-weight:900;letter-spacing:2px;margin:20px 0;padding:12px;border:1px solid #333">AMOUNT = Rs. ${amt}/-</div>
        
        <p style="font-weight:700;text-decoration:underline;margin-bottom:6px">Payment schedule :-</p>
        <div style="margin-left:16px;line-height:1.8;margin-bottom:14px">
          &bull; 65% payment advance<br>
          &bull; 20% after panel installation<br>
          &bull; 15% after commissioning
        </div>
        <p style="font-weight:700;line-height:1.6;margin-bottom:8px">Quote is including supply of materials, AC-DB, DCDB, transportation, solar energy meter & GST.</p>
        <p style="text-align:center;font-style:italic;border-top:1px solid #ccc;padding-top:8px"><i>Quotation is valid upto one month from the issued date</i></p>
      </div>
      
      <p style="font-style:italic;margin:16px 0;line-height:1.6;font-family:Arial,sans-serif"><i>Thanking you, we assure you of our commitment for quality products, timely delivery & excellent service support.</i></p>
      <p style="font-weight:700;font-family:Arial,sans-serif">Thanking you,</p><br><hr style="margin:16px 0"><br>
      
      <h3 style="text-align:center;margin-bottom:16px;text-decoration:underline;font-family:Arial,sans-serif">${t.heading} - BILL OF MATERIALS</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-family:Arial,sans-serif">
        <thead>
          <tr style="background:#f0f0f0">
            <th style="padding:7px 8px;border:1px solid #ccc;font-size:12px;text-align:left">Sl.No</th>
            <th style="padding:7px 8px;border:1px solid #ccc;font-size:12px;text-align:left">Product</th>
            <th style="padding:7px 8px;border:1px solid #ccc;font-size:12px;text-align:left">Description</th>
            <th style="padding:7px 8px;border:1px solid #ccc;font-size:12px;text-align:left">Qty</th>
          </tr>
        </thead>
        <tbody style="font-size:12px">
          <tr><td style="padding:6px 8px;border:1px solid #ccc">1</td><td style="padding:6px 8px;border:1px solid #ccc">Solar Grid Inverter</td><td style="padding:6px 8px;border:1px solid #ccc">On-Grid ${t.inverter} with WiFi Monitoring</td><td style="padding:6px 8px;border:1px solid #ccc">1</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">2</td><td style="padding:6px 8px;border:1px solid #ccc">Solar Panel</td><td style="padding:6px 8px;border:1px solid #ccc">Half Cut Bi-Facial Topcon ADANI/SAATVIK/WAREE - ${t.panels} (IEC & BIS Certified)</td><td style="padding:6px 8px;border:1px solid #ccc">${t.panels.split('(')[1] ? t.panels.split('(')[1].replace(')', '') : 'As required'}</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">3</td><td style="padding:6px 8px;border:1px solid #ccc">ACDB</td><td style="padding:6px 8px;border:1px solid #ccc">${t.acdb}</td><td style="padding:6px 8px;border:1px solid #ccc">1</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">4</td><td style="padding:6px 8px;border:1px solid #ccc">DCDB</td><td style="padding:6px 8px;border:1px solid #ccc">${t.dcdb}</td><td style="padding:6px 8px;border:1px solid #ccc">1</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">5</td><td style="padding:6px 8px;border:1px solid #ccc">AC Cable</td><td style="padding:6px 8px;border:1px solid #ccc">AC 10 SQ MM, Red & Black, IEC Standard (POLYCAB)</td><td style="padding:6px 8px;border:1px solid #ccc">As reqd.</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">6</td><td style="padding:6px 8px;border:1px solid #ccc">DC Cable</td><td style="padding:6px 8px;border:1px solid #ccc">DC 6 SQ MM, Red & Black, IEC Standard (POLYCAB)</td><td style="padding:6px 8px;border:1px solid #ccc">As reqd.</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">7</td><td style="padding:6px 8px;border:1px solid #ccc">Connectors</td><td style="padding:6px 8px;border:1px solid #ccc">Weatherproof MC4 Connectors</td><td style="padding:6px 8px;border:1px solid #ccc">As per site</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">8</td><td style="padding:6px 8px;border:1px solid #ccc">Energy Meter</td><td style="padding:6px 8px;border:1px solid #ccc">${t.meter}</td><td style="padding:6px 8px;border:1px solid #ccc">1 Set</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">9</td><td style="padding:6px 8px;border:1px solid #ccc">Lighting Arrestor</td><td style="padding:6px 8px;border:1px solid #ccc">Multy Spike Lighting Protector (EXCELERTHINGS)</td><td style="padding:6px 8px;border:1px solid #ccc">2 Set</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">10</td><td style="padding:6px 8px;border:1px solid #ccc">Copper</td><td style="padding:6px 8px;border:1px solid #ccc">10 SWG Copper for Structure, AC & DC Earthing</td><td style="padding:6px 8px;border:1px solid #ccc">As reqd.</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">11</td><td style="padding:6px 8px;border:1px solid #ccc">Structure Details</td><td style="padding:6px 8px;border:1px solid #ccc">GP APPOLO - 3x1/2 Pipe 16G, 1/2x3/4 Pipe 16G, 8MM Anchor Bolt</td><td style="padding:6px 8px;border:1px solid #ccc">As reqd.</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">12</td><td style="padding:6px 8px;border:1px solid #ccc">Earthing</td><td style="padding:6px 8px;border:1px solid #ccc">Earthing for LA, AC&DC, Copper Bounded Earthing Road (EXCELERTHINGS)</td><td style="padding:6px 8px;border:1px solid #ccc">4 Set</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">13</td><td style="padding:6px 8px;border:1px solid #ccc">Earthing Compound</td><td style="padding:6px 8px;border:1px solid #ccc">10 KG Earthing Compound (EXCELERTHINGS)</td><td style="padding:6px 8px;border:1px solid #ccc">As reqd.</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #ccc">14</td><td style="padding:6px 8px;border:1px solid #ccc">Transportation, Installation & Commissioning</td><td style="padding:6px 8px;border:1px solid #ccc">Project Cost</td><td style="padding:6px 8px;border:1px solid #ccc">-</td></tr>
        </tbody>
      </table>
      <hr style="margin:16px 0">
      <p style="font-size:14px;font-weight:700;text-decoration:underline;margin-bottom:8px;font-family:Arial,sans-serif">TERMS AND CONDITIONS</p>
      <div style="margin-left:16px;line-height:1.9;font-size:12px;font-family:Arial,sans-serif">
        &bull; Extra work: UG cabling, HT Ct meter accessories, Meter panels not included.<br>
        &bull; Complaints attended within 2 working days.<br>
        &bull; Modifications as per KSEB/Electrical Inspectorate shall be customer scope.<br>
        &bull; Customer shall support installation and KSEB approvals.<br>
        &bull; We don't take back our product after installation.<br>
        &bull; Duration of work: Approx. 1 month after KSEBL feasibility approval.<br>
        &bull; Duration of Commissioning: Approx. 1 month.*
      </div>
      <p style="font-size:13px;font-weight:700;text-decoration:underline;margin:12px 0 6px;font-family:Arial,sans-serif">WARRANTY/GUARANTEE</p>
      <div style="margin-left:16px;line-height:1.9;font-size:12px;font-family:Arial,sans-serif">
        &bull; Solar panel: 25 years limited power output warranty*<br>
        &bull; Solar panel: 10 years limited product warranty*<br>
        &bull; Solar inverter: 10 years warranty*<br>
        &bull; 5 years warranty for on-Grid Formost Power System (Free service)*<br>
        &bull; Warranty excludes: unauthorized repair, flood/earthquake/natural calamities, lightning damage.
      </div>
      <p style="font-size:13px;font-weight:700;text-decoration:underline;margin:12px 0 6px;font-family:Arial,sans-serif">MODE OF PAYMENT</p>
      <div style="margin-left:16px;line-height:1.9;font-size:12px;font-family:Arial,sans-serif">
        &bull; 65% advance, 20% after panel installation, 15% after commissioning.<br>
        &bull; Delivery: 3 weeks from date of confirmation.<br>
        &bull; Cheque/Bank Transfer/DD in favor of <b>FORMOST POWER SYSTEMS</b> payable at Ponnani.
      </div>
      <div style="background:#f9f9f9;padding:12px;border:1px solid #ddd;margin-top:12px;font-size:12px;line-height:1.8;font-family:Arial,sans-serif">
        <b>Bank Details:</b><br>Account Number: 0071073000060987<br>
        Bank: South Indian Bank &nbsp;|&nbsp; Branch: Ponnani &nbsp;|&nbsp; IFSC: SIBL0000071
      </div>
    `;
  };

  const buildShareText = (q) => {
    const t = resolveTemplate(q.kw);
    const amt = formatAmount(q.amount);
    const dateStr = getLocalDateStr(q.date);
    return `🌟 *FORMOST POWER SYSTEMS*\n\n` +
      `Quotation for Solar Plant\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer:* ${q.customerName}${q.place ? ', ' + q.place : ''}\n` +
      `📅 *Date:* ${dateStr}\n\n` +
      `⚡ *${t.heading}*\n\n` +
      `💰 *Total Amount: Rs. ${amt}/-*\n\n` +
      `*Payment Schedule:*\n` +
      `• 65% advance\n` +
      `• 20% after panel installation\n` +
      `• 15% after commissioning\n\n` +
      `📦 Includes: Supply, installation, AC-DB, DC-DB, transportation, solar energy meter & GST.\n\n` +
      `⏳ Valid for 1 month from issue date.\n\n` +
      `_Formost Power Systems — For the Future_ 🌱`;
  };

  const handleShare = async (q) => {
    const text = buildShareText(q);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Quotation — ${q.customerName}`, text });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handlePrint = (q) => {
    const t = resolveTemplate(q.kw);
    const today = getLocalDateStr(q.date || new Date().toISOString().split('T')[0]);
    const bodyHTML = buildQuoteBody(q, t, today);

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Quotation - ${q.customerName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 20mm 15mm; }
            @media print {
              @page { size: A4; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          ${bodyHTML}
        </body>
      </html>
    `;

    // Create a temporary hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(printHTML);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 600);
  };

  const handleOpenPreview = (q) => {
    setPreviewQuote(q);
  };

  const handleClosePreview = () => {
    setPreviewQuote(null);
  };

  return (
    <div id="page-quotations">
      <div className="sectionHead">
        <div className="sectionTitle">Quotations</div>
        <button className="btnSm red" onClick={onOpenAddQuoteModal}>
          <i className="fa-solid fa-plus"></i> New quotation
        </button>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>System</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length > 0 ? (
              quotations.map(q => (
                <tr key={q.id}>
                  <td className="tdBold">{q.id}</td>
                  <td>{q.customerName}</td>
                  <td>{q.kw && q.kw.includes('|') ? `${q.kw.split('|')[0]}kW + ${q.kw.split('|')[1]}kVA` : `${q.kw} kW`}</td>
                  <td>Rs. {formatAmount(q.amount)}</td>
                  <td>{q.date}</td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button className="actBtn" onClick={() => handleOpenPreview(q)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button className="actBtn" onClick={() => onOpenEditQuoteModal(q.id)}>
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      className="actBtn"
                      style={{ color: '#E8161B' }}
                      onClick={() => onDeleteQuote(q.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#99968e' }}>
                  No quotations yet. Create one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewQuote && (() => {
        const t = resolveTemplate(previewQuote.kw);
        const today = getLocalDateStr(previewQuote.date || new Date().toISOString().split('T')[0]);
        const htmlContent = buildQuoteBody(previewQuote, t, today);

        return (
          <div className="modal open" style={{ display: 'flex', zIndex: 600 }}>
            <div className="modalBox" style={{ width: '860px', maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #e4e2dd', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Quotation Preview</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btnSm" style={{ background: '#25D366', color: '#fff' }} onClick={() => handleShare(previewQuote)}>
                    <i className="fa-brands fa-whatsapp"></i> Share
                  </button>
                  <button className="btnSm red" onClick={() => handlePrint(previewQuote)}>
                    <i className="fa-solid fa-print"></i> Print / Save PDF
                  </button>
                  <button className="modalClose" onClick={handleClosePreview}>
                    <i className="fa-solid fa-x"></i>
                  </button>
                </div>
              </div>
              <div style={{ padding: 'clamp(16px, 4vw, 32px)', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#111' }} dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
