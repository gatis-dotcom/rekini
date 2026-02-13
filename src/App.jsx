import React, { useState, useCallback, useRef, useEffect } from 'react';

// Real client database from past invoices
const clientDatabase = [
  // Companies (SIA)
  { name: 'SIA Latvian Online', regNr: '40203695497', pvnNr: 'LV40203695497', address: 'Graudu iela 43-34, Liepāja, LV-3401', type: 'company' },
  { name: 'SIA LUCID DREAM', regNr: '40103863660', pvnNr: '', address: 'Dadzīšu iela 16, Ādaži, Ādažu pag., Ādažu nov., LV-2164', type: 'company' },
  { name: 'SIA J&M LEGENDS', regNr: '40203466570', pvnNr: '', address: 'Rīga, Balvu iela 13 - 23, LV-1003', type: 'company' },
  { name: 'EDV AROMA SIA', regNr: '44103140263', pvnNr: 'LV44103140263', address: 'Bauskas iela 29 k-2 -21, Rīga, LV-1004', type: 'company' },
  { name: 'Ekvilibria SIA', regNr: '40203201182', pvnNr: 'LV40203201182', address: 'Ogres nov., Ogre, Brīvības iela 22, LV-5001', type: 'company' },
  { name: 'SIA DiCreator', regNr: '40203439483', pvnNr: 'LV40203439483', address: 'Bebru iela 22-11, Jēkabpils, Jēkabpils nov., LV-5201', type: 'company' },
  { name: 'SIA Cherie Lingerie', regNr: '50203644331', pvnNr: '', address: 'Briežu iela 9 - 158, Rīga, LV-1034', type: 'company' },
  { name: 'NRG Art House SIA', regNr: '40203166296', pvnNr: 'LV40203166296', address: 'Hospitāļu iela 2-3, Rīga, LV-1013', type: 'company' },
  { name: 'SIA Īsiunkonkrēti', regNr: '44103119520', pvnNr: '', address: 'Rīga, Ūnijas iela 1 - 6, LV-1039', type: 'company' },
  { name: 'SIA PODGROW', regNr: '40203386896', pvnNr: '', address: 'Vanagu iela 5-6, Valmiermuiža, LV-4219', type: 'company' },
  { name: 'SIA MagicMoney', regNr: '40203606041', pvnNr: '', address: 'Rīga, Gustava Zemgala gatve 60 - 2, LV-1039', type: 'company' },
  { name: 'SIA SHORTCUT', regNr: '40203664073', pvnNr: 'LV40203664073', address: 'Avotu iela 1 - 22, Lielvārde, Ogres novads, LV-5071', type: 'company' },
  { name: 'SIA Integral Grands', regNr: '40203539836', pvnNr: 'LV40203539836', address: 'Centra iela 5, Sēlija, Sēlpils pag., Jēkabpils nov., LV-5232', type: 'company' },
  // Individuals (fiziskas personas)
  { name: 'Inga Borenkova', regNr: '060279-10811', pvnNr: '', address: 'Daugavas 3-86, Liepāja', type: 'person' },
  { name: 'Maija Līne-Buce', regNr: '160489-10801', pvnNr: '', address: 'Caunu iela 11, Liepāja', type: 'person' },
  { name: 'Nelda Zelmene', regNr: '081092-11570', pvnNr: '', address: 'Rīga, Latvija', type: 'person' },
  { name: 'Linda Zeltkalna', regNr: '271187-12338', pvnNr: '', address: 'Rīga, Latvija', type: 'person' },
  { name: 'Ieva Vīgante', regNr: '301184-11284', pvnNr: '', address: 'Kaupo iela 17, Sigulda, LV-2150', type: 'person' },
  { name: 'Silvija Ābele', regNr: '15016910511', pvnNr: 'LV15016910511', address: 'Kr. Valdemāra 106-156, Rīga, LV-1013', type: 'person' },
];

// Common services/products
const commonServices = [
  { name: 'Kurss DOMĀ KĀ NAUDA biznesā', price: 49 },
  { name: 'Biznesa mentoringa sesija', price: 100 },
  { name: '1:1 sesija', price: 100 },
  { name: 'Rezervācija - Biznesa Vakariņas', price: 55 },
  { name: 'Online Meistarklase - LAIKS IR NAUDA', price: 25 },
];

const searchCompanies = (query) => {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return clientDatabase.filter(c => 
    c.name.toLowerCase().includes(lower) || 
    c.regNr.includes(query)
  ).slice(0, 6);
};

// Your company details (fixed)
const MY_COMPANY = {
  name: 'Transform with Laura, SIA',
  regNr: '40203640728',
  address: 'Zahārija Stopija iela 5 - 58, Upeslejas, Stopiņu pagasts, Ropažu novads, LV-2118',
  bank: 'JSC CITADELE BANKA',
  swift: 'PARXLV22',
  account: 'LV43PARX0033387070001'
};

// TODO: Replace with your actual Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaQcROVpdIIXk_-dhabWhzAQ7ofi0KQhGh-G5IeyVpYc3BjUo2juuGimeHAmpB_Mdt9w/exec';

// Generate invoice number locally (fallback)
const generateLocalInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}-001`;
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('lv-LV');
};

export default function InvoicingApp() {
  const [activeTab, setActiveTab] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const searchRef = useRef(null);
  
  const [client, setClient] = useState({
    name: '',
    regNr: '',
    pvnNr: '',
    address: '',
    type: 'company' // 'company' or 'person'
  });
  
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: '', quantity: 1, price: 0, isCustom: true }
  ]);
  
  const [showServicePicker, setShowServicePicker] = useState(null); // which item row is selecting service
  
  const [invoiceData, setInvoiceData] = useState({
    number: '',  // Will be fetched from server
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [isLoadingNumber, setIsLoadingNumber] = useState(true);

  // Fetch next invoice number on load
  useEffect(() => {
    const fetchNextNumber = async () => {
      if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        // Demo mode - use local generation
        setInvoiceData(prev => ({ ...prev, number: generateLocalInvoiceNumber() }));
        setIsLoadingNumber(false);
        return;
      }
      
      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getNextNumber' })
        });
        const data = await response.json();
        
        if (data.success && data.invoiceNumber) {
          setInvoiceData(prev => ({ ...prev, number: data.invoiceNumber }));
        } else {
          setInvoiceData(prev => ({ ...prev, number: generateLocalInvoiceNumber() }));
        }
      } catch (error) {
        console.error('Could not fetch invoice number:', error);
        setInvoiceData(prev => ({ ...prev, number: generateLocalInvoiceNumber() }));
      } finally {
        setIsLoadingNumber(false);
      }
    };
    
    fetchNextNumber();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setIsSearching(true);
      setTimeout(() => {
        setSearchResults(searchCompanies(value));
        setShowResults(true);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, []);

  const selectCompany = (company) => {
    setClient({
      name: company.name,
      regNr: company.regNr,
      pvnNr: company.pvnNr,
      address: company.address,
      type: company.type || 'company'
    });
    setSearchQuery(company.name);
    setShowResults(false);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, {
      id: Date.now(),
      description: '',
      quantity: 1,
      price: 0,
      isCustom: true
    }]);
  };

  const selectService = (itemId, service) => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === itemId ? { ...item, description: service.name, price: service.price, isCustom: false } : item
    ));
    setShowServicePicker(null);
  };

  const removeItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const total = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    const payload = {
      invoice: invoiceData,
      client: client,
      items: invoiceItems,
      total: total
    };
    
    try {
      if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('PDF ģenerēts! (Demo režīms - pievienojiet Google Apps Script URL)');
      } else {
        // Production mode
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if (data.success && data.pdfUrl) {
          window.open(data.pdfUrl, '_blank');
          
          // Fetch next number for the next invoice
          const nextResponse = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getNextNumber' })
          });
          const nextData = await nextResponse.json();
          if (nextData.success && nextData.invoiceNumber) {
            setInvoiceData(prev => ({ ...prev, number: nextData.invoiceNumber }));
          }
          
          // Clear form for next invoice
          setClient({ name: '', regNr: '', pvnNr: '', address: '', type: 'company' });
          setSearchQuery('');
          setInvoiceItems([{ id: 1, description: '', quantity: 1, price: 0, isCustom: true }]);
        } else {
          alert('Kļūda: ' + (data.error || 'Nezināma kļūda'));
        }
      }
    } catch (error) {
      alert('Kļūda ģenerējot PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = client.name && client.regNr && invoiceItems.some(item => item.description && item.price > 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #1a1f2e 0%, #252d3d 50%, #1e2433 100%)',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: '#e8edf5'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        input, select, textarea {
          font-family: inherit;
          transition: all 0.2s ease;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        
        .search-result:hover {
          background: rgba(99, 102, 241, 0.15) !important;
        }
        
        .item-row {
          animation: slideIn 0.25s ease;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'rgba(26, 31, 46, 0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '700'
          }}>
            TL
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: '600', letterSpacing: '-0.01em' }}>
              Transform with Laura
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
              Rēķinu sistēma
            </p>
          </div>
        </div>
        
        <nav style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'new', label: 'Jauns rēķins', icon: '＋' },
            { id: 'history', label: 'Vēsture', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#818cf8' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto' }}>
        {activeTab === 'new' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
            {/* Main Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* My Company Info (Read-only) */}
              <section className="card" style={{ padding: '20px 24px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#818cf8' }}>
                      {MY_COMPANY.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                      Reģ. Nr.: {MY_COMPANY.regNr}<br />
                      {MY_COMPANY.address}<br />
                      Banka: {MY_COMPANY.bank} • {MY_COMPANY.swift}<br />
                      Konts: {MY_COMPANY.account}
                    </p>
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '4px 10px', 
                    background: 'rgba(99, 102, 241, 0.15)', 
                    borderRadius: '6px',
                    color: '#818cf8'
                  }}>
                    Jūsu uzņēmums
                  </span>
                </div>
              </section>

              {/* Client Search Section */}
              <section className="card" style={{ padding: '24px', borderRadius: '14px' }}>
                <h2 style={{ 
                  marginBottom: '18px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.4)' 
                }}>
                  Saņēmējs (klients)
                </h2>
                
                <div ref={searchRef} style={{ position: 'relative', marginBottom: '18px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Meklēt uzņēmumu pēc nosaukuma vai reģ. numura..."
                      style={{
                        width: '100%',
                        padding: '14px 18px 14px 46px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '16px',
                      opacity: 0.4
                    }}>🔍</span>
                    
                    {isSearching && (
                      <div style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                    )}
                  </div>
                  
                  {showResults && searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '6px',
                      background: '#252d3d',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '8px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        Jūsu klienti
                      </div>
                      {searchResults.map((company, idx) => (
                        <div
                          key={company.regNr}
                          className="search-result"
                          onClick={() => selectCompany(company)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            borderBottom: idx < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            transition: 'background 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ 
                              fontSize: '10px', 
                              padding: '2px 6px', 
                              background: company.type === 'company' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                              color: company.type === 'company' ? '#818cf8' : '#4ade80',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}>
                              {company.type === 'company' ? 'SIA' : 'Fiziska persona'}
                            </span>
                            <span style={{ fontWeight: '500', fontSize: '14px' }}>{company.name}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                            {company.type === 'company' ? 'Reģ. Nr.' : 'P.K.'}: {company.regNr} • {company.address}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Client Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  {[
                    { label: 'Nosaukums / Vārds Uzvārds', key: 'name', full: true },
                    { label: client.type === 'person' ? 'Personas kods' : 'Reģistrācijas Nr.', key: 'regNr', mono: true },
                    { label: 'PVN Nr.', key: 'pvnNr', mono: true },
                    { label: 'Adrese', key: 'address', full: true }
                  ].map(field => (
                    <div key={field.key} style={{ gridColumn: field.full ? 'span 2' : 'span 1' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={client[field.key]}
                        onChange={(e) => setClient({ ...client, [field.key]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: client[field.key] ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${client[field.key] ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          fontFamily: field.mono ? '"JetBrains Mono", monospace' : 'inherit'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Invoice Items */}
              <section className="card" style={{ padding: '24px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h2 style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.4)' 
                  }}>
                    Pakalpojumi / Preces
                  </h2>
                  <button
                    onClick={addItem}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      color: '#818cf8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    ＋ Pievienot
                  </button>
                </div>

                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 120px 110px 36px',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <div>Apraksts</div>
                  <div style={{ textAlign: 'center' }}>Daudz.</div>
                  <div style={{ textAlign: 'right' }}>Vien. cena €</div>
                  <div style={{ textAlign: 'right' }}>Kopsumma €</div>
                  <div></div>
                </div>

                {/* Items */}
                {invoiceItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="item-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 90px 120px 110px 36px',
                      gap: '10px',
                      padding: '8px 0',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        onFocus={() => !item.description && setShowServicePicker(item.id)}
                        placeholder="Izvēlies pakalpojumu vai raksti pats..."
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px'
                        }}
                      />
                      {showServicePicker === item.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: '#252d3d',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                          zIndex: 50
                        }}>
                          <div style={{ padding: '8px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            Bieži izmantotie pakalpojumi
                          </div>
                          {commonServices.map((service, sIdx) => (
                            <div
                              key={sIdx}
                              onClick={() => selectService(item.id, service)}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                borderBottom: sIdx < commonServices.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background 0.15s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{ fontSize: '14px' }}>{service.name}</span>
                              <span style={{ fontSize: '13px', color: '#818cf8', fontFamily: '"JetBrains Mono", monospace' }}>€{service.price}</span>
                            </div>
                          ))}
                          <div
                            onClick={() => setShowServicePicker(null)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              background: 'rgba(255,255,255,0.02)',
                              fontSize: '13px',
                              color: 'rgba(255,255,255,0.5)',
                              textAlign: 'center'
                            }}
                          >
                            ✕ Aizvērt / Rakstīt pašam
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      style={{
                        padding: '11px 8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.price || ''}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      style={{
                        padding: '11px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        textAlign: 'right',
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    />
                    <div style={{
                      padding: '11px 12px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: '8px',
                      textAlign: 'right',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#a5b4fc'
                    }}>
                      {(item.quantity * item.price).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={invoiceItems.length === 1}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f87171',
                        cursor: invoiceItems.length === 1 ? 'not-allowed' : 'pointer',
                        padding: '10px',
                        fontSize: '13px',
                        opacity: invoiceItems.length === 1 ? 0.3 : 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </section>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Invoice Details */}
              <section className="card" style={{ padding: '22px', borderRadius: '14px' }}>
                <h2 style={{ 
                  marginBottom: '16px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.4)' 
                }}>
                  Rēķina dati
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Rēķina numurs
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={invoiceData.number}
                        onChange={(e) => setInvoiceData({ ...invoiceData, number: e.target.value })}
                        placeholder={isLoadingNumber ? 'Ielādē...' : ''}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: isLoadingNumber ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.1)',
                          border: `1px solid ${isLoadingNumber ? 'rgba(255,255,255,0.08)' : 'rgba(99, 102, 241, 0.3)'}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          fontFamily: '"JetBrains Mono", monospace'
                        }}
                        readOnly={isLoadingNumber}
                      />
                      {isLoadingNumber && (
                        <div style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(99, 102, 241, 0.3)',
                          borderTopColor: '#6366f1',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }} />
                      )}
                    </div>
                    {!isLoadingNumber && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                        ✓ Automātiski ģenerēts
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Rēķina datums
                    </label>
                    <input
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Apmaksas termiņš
                    </label>
                    <input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* Total */}
              <section className="card" style={{ padding: '22px', borderRadius: '14px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>Kopā apmaksai</span>
                  <span style={{ 
                    fontSize: '24px',
                    fontWeight: '700',
                    fontFamily: '"JetBrains Mono", monospace',
                    color: '#a5b4fc'
                  }}>
                    €{total.toFixed(2)}
                  </span>
                </div>
              </section>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn-primary"
                  onClick={handleGeneratePDF}
                  disabled={!isFormValid || isGenerating}
                  style={{
                    padding: '16px 24px',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      Ģenerē...
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      Ģenerēt PDF
                    </>
                  )}
                </button>
                
                <button style={{
                  padding: '14px 24px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>👁</span>
                  Priekšskatījums
                </button>
              </div>

              {/* Status */}
              <div style={{
                padding: '14px 16px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontWeight: '500', color: '#4ade80' }}>Gatavs darbam</span>
                </div>
                <p style={{ margin: 0, lineHeight: 1.4, fontSize: '11px' }}>
                  PDF tiks saglabāts jūsu Google Drive un nosūtīts uz e-pastu
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card" style={{ padding: '60px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Rēķinu vēsture</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
              Šeit tiks attēloti visi izveidotie rēķini no Google Sheets
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
