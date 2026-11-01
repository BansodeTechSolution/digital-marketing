import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DEMO_LOGIN, sampleAds, seedRegistrations } from './data/demoData.js';
import './styles.css';

const topics = ['WhatsApp Business', 'Social media content', 'Facebook and Instagram ads', 'Local listings and website options', 'Measuring results'];
const checklist = [
  'Add your business name, description and category',
  'Add address, opening hours and contact details',
  'Upload a clear profile photo or logo',
  'Create a product or service catalogue',
  'Set a greeting message and quick replies',
  'Label customers and enquiries',
  'Agree who replies, and how fast',
  'Only message people who have agreed to hear from you',
];
const sessions = [
  ['Understanding digital marketing goals', 'choose a target customer and one measurable goal.', 'a clear purpose for your marketing.'],
  ['WhatsApp Business', 'review your profile, catalogue, quick replies and customer etiquette.', 'better customer communication.'],
  ['Social media content', 'draft three posts and create a one-week calendar.', 'more consistent content.'],
  ['Facebook and Instagram advertising basics', 'build a sample campaign plan without publishing it.', 'a better grasp of budget and targeting.'],
  ['Local visibility and website options', 'check your business details and list what a website would need to do.', 'accurate online information.'],
  ['Measuring results', 'fill in a simple enquiry and sales tracking sheet.', 'decisions based on evidence.'],
];
const faqs = [
  ['Do I need a website?', 'Not to begin. You can start with accurate social profiles and local listings, then consider a simple website once it has a clear purpose.'],
  ['Do I need a big budget?', 'No. We start with free and low-cost methods and only plan paid ads with a clear goal and spending limit.'],
  ['How much time will it take?', 'The weekly routine is designed for busy owners: a few short, planned tasks rather than daily work.'],
  ['Will my customer information be safe?', 'Yes. Sessions use sample material, and we teach permission-based messaging that respects customer privacy.'],
];
const navItems = [['home', 'Home'], ['courses', 'Course'], ['toolkit', 'Toolkit'], ['ads', 'Ads'], ['join', 'Join'], ['about', 'About'], ['organiser', 'Organiser']];

function App() {
  const [page, setPage] = useState(location.hash.slice(1) || 'home');
  const [theme, setTheme] = useState(localStorage.getItem('dm-theme') || 'light');
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wa-checks') || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ name: '', business: '', topic: topics[0] });
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [statusTone, setStatusTone] = useState('success');
  const [saving, setSaving] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('demo-organiser-session') === 'active');
  const [currentUser, setCurrentUser] = useState(() => sessionStorage.getItem('demo-organiser-user') || '');
  const [authLoading, setAuthLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [authTone, setAuthTone] = useState('success');
  const [adminRecords, setAdminRecords] = useState(() => {
    try { return [...JSON.parse(localStorage.getItem('demo-interest-records') || '[]'), ...seedRegistrations]; }
    catch { return seedRegistrations; }
  });
  const [adminStatus, setAdminStatus] = useState('');
  const [adminTone, setAdminTone] = useState('success');
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    const route = () => {
      const next = location.hash.slice(1);
      setPage(navItems.some(([key]) => key === next) ? next : 'home');
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', route);
    return () => removeEventListener('hashchange', route);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('dm-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('wa-checks', JSON.stringify(checked)); }, [checked]);

  const progress = useMemo(() => Math.round((checked.length / checklist.length) * 100), [checked]);
  const buildMessage = () => {
    const name = form.name.trim() || 'a business owner';
    const business = form.business.trim() || 'my small business';
    setMessage(`Hello, I am ${name} from ${business}. I would like to join the digital marketing training, and I would like to learn about ${form.topic} first. Please share the next session details. Thank you.`);
    setStatusTone('success');
    setStatus('');
  };
  const saveInterest = () => {
    if (!form.name.trim() || !form.business.trim()) {
      setStatusTone('error');
      setStatus('Please add your name and business before sending your interest.');
      return;
    }
    setSaving(true); setStatus(''); setStatusTone('success');
    try {
      const localEntries = JSON.parse(localStorage.getItem('demo-interest-records') || '[]');
      const record = { id: `local-${Date.now()}`, name: form.name.trim(), business: form.business.trim(), topic: form.topic, createdAt: new Date().toISOString() };
      localStorage.setItem('demo-interest-records', JSON.stringify([record, ...localEntries]));
      setAdminRecords([record, ...localEntries, ...seedRegistrations]);
      if (!message) {
        const name = form.name.trim();
        const business = form.business.trim();
        setMessage(`Hello, I am ${name} from ${business}. I would like to join the digital marketing training, and I would like to learn about ${form.topic} first. Please share the next session details. Thank you.`);
      }
      setStatus('Thanks! Your interest was added to the demo list on this browser.');
    } catch {
      setStatusTone('error');
      setStatus('We could not save the demo entry in this browser. Check your browser storage settings.');
    } finally { setSaving(false); }
  };
  const copyMessage = async () => {
    if (!message) { setStatusTone('error'); setStatus('Create a message first.'); return; }
    try { await navigator.clipboard.writeText(message); setStatusTone('success'); setStatus('Message copied.'); }
    catch { setStatusTone('error'); setStatus('Select the message and copy it from your device.'); }
  };
  const loadRegistrations = () => {
    setLoadingRecords(true); setAdminStatus(''); setAdminTone('success');
    try {
      const localEntries = JSON.parse(localStorage.getItem('demo-interest-records') || '[]');
      const records = [...localEntries, ...seedRegistrations];
      setAdminRecords(records);
      setAdminStatus(`${records.length} dummy registration${records.length === 1 ? '' : 's'} loaded from this browser.`);
      setAdminTone('success');
    } catch {
      setAdminRecords(seedRegistrations);
      setAdminTone('error');
      setAdminStatus('Could not read local demo entries. Showing the built-in sample data.');
    } finally { setLoadingRecords(false); }
  };
  const signIn = (event) => {
    event.preventDefault(); setAuthLoading(true); setAuthStatus(''); setAuthTone('success');
    if (loginForm.username === DEMO_LOGIN.username && loginForm.password === DEMO_LOGIN.password) {
      sessionStorage.setItem('demo-organiser-session', 'active');
      sessionStorage.setItem('demo-organiser-user', DEMO_LOGIN.username);
      setIsAuthenticated(true); setCurrentUser(DEMO_LOGIN.username); setLoginForm({ username: '', password: '' });
      loadRegistrations();
    } else {
      setAuthTone('error'); setAuthStatus('Username or password is incorrect.');
    }
    setAuthLoading(false);
  };
  const signOut = () => {
    sessionStorage.removeItem('demo-organiser-session');
    sessionStorage.removeItem('demo-organiser-user');
    setIsAuthenticated(false); setCurrentUser(''); setAdminRecords([]); setAdminStatus(''); setAuthStatus('');
  };

  return <div className="app-shell">
    <a className="skip-link" href="#page-content">Skip to content</a>
    <header className="site-header"><nav className="nav container" aria-label="Main navigation">
      <a className="brand" href="#home"><span className="brand-mark">📈</span><span>Digital Marketing Training</span></a>
      <div className="nav-links">{navItems.map(([key, label]) => <a key={key} href={`#${key}`} aria-current={page === key ? 'page' : undefined}>{label}</a>)}</div>
      <div className="theme-switch" role="group" aria-label="Color theme">
        <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')} aria-label="Light mode" title="Light mode" aria-pressed={theme === 'light'}><span aria-hidden="true">☀</span></button>
        <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')} aria-label="Dark mode" title="Dark mode" aria-pressed={theme === 'dark'}><span aria-hidden="true">☾</span></button>
      </div>
    </nav></header>

    {page === 'home' && <main id="page-content">
      <section className="hero"><div className="container hero-inner">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> BEGINNER-FRIENDLY · LOW-COST · HANDS-ON</div>
          <h1>Grow your small<br/><em>business online</em></h1>
          <p>Practical training in WhatsApp Business, social media and simple advertising, built for shop owners and small teams with no marketing background.</p>
          <div className="hero-actions"><a className="button button-primary" href="#join">Join a session <span>↗</span></a><a className="text-link" href="#courses">See the course <span>→</span></a></div>
        </div>
        <div className="hero-art" aria-label="Illustration of a small business growing online">
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <div className="sun-shape"/><div className="plant plant-left"><b/><b/><b/><span/></div><div className="plant plant-right"><b/><b/><b/><span/></div>
          <div className="growth-card"><div className="growth-top"><span className="growth-dot"/> YOUR BUSINESS <span className="growth-menu">···</span></div><div className="growth-number">+38% <small>this month</small></div><svg viewBox="0 0 300 106" role="img" aria-label="Rising customer enquiries chart"><path className="chart-fill" d="M0 88 C32 80 33 59 68 67 S106 80 129 49 S174 56 195 35 S232 45 251 20 S277 29 300 4 V106 H0Z"/><path className="chart-line" d="M0 88 C32 80 33 59 68 67 S106 80 129 49 S174 56 195 35 S232 45 251 20 S277 29 300 4"/></svg><div className="chart-labels"><span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span></div></div>
          <div className="float-note note-social"><span>✳</span><div><b>Show up</b><small>One post at a time</small></div></div><div className="float-note note-chat"><span>↗</span><div><b>Stay connected</b><small>Turn chats into customers</small></div></div>
          <div className="art-caption">Small steps. Stronger connections.</div>
        </div>
      </div><div className="hero-bottom"><div className="container hero-bottom-inner"><span>BUILT FOR SMALL BUSINESSES</span><div>Beginner-friendly <b>·</b> Low-cost <b>·</b> Hands-on</div></div></div></section>

      <section className="section container audience"><div className="section-heading"><div className="eyebrow">WHO IT’S FOR</div><h2>Who it’s <em>for</em></h2></div>
        <div className="audience-grid"><article className="audience-card"><span className="card-number">01 / RETAIL</span><div className="audience-icon icon-shop">🛍</div><h3>Shops and retailers</h3><p>Show products, share prices and availability, and answer customers quickly.</p></article><article className="audience-card"><span className="card-number">02 / SERVICE</span><div className="audience-icon icon-service">🍽</div><h3>Food and service businesses</h3><p>Share menus, timings, locations and bookings in one clear place.</p></article><article className="audience-card"><span className="card-number">03 / INDEPENDENT</span><div className="audience-icon icon-person">👤</div><h3>Home-based and independent</h3><p>Build trust with a professional profile and a steady posting routine.</p></article></div>
      </section>

      <section className="outcomes"><div className="container outcomes-inner"><div className="outcomes-heading"><div className="eyebrow eyebrow-light">WHAT YOU’LL LEARN</div><h2>What you’ll <em>learn</em></h2></div><div className="outcomes-list">{[['1','Reach customers','Set up WhatsApp Business, social profiles and local listings that people can find.'],['2','Post consistently','Plan a simple weekly content routine you can keep up alongside daily work.'],['3','Spend wisely','Plan ads with a clear goal, audience and budget before spending anything.'],['4','Measure what works','Track enquiries and sales so you can keep, change or stop activities.']].map(([n,t,d])=><div className="outcome-row" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><b>↗</b></div>)}</div></div></section>

      <section className="section container approach"><div className="approach-intro"><div className="eyebrow">HOW IT WORKS</div><h2>How it <em>works</em></h2></div><div className="approach-steps">{[['01','Short demos','See each tool in action, step by step.'],['02','Guided practice','Apply it to your own business, with help on hand.'],['03','Take-home checklist','Leave with a checklist, sample calendar and tracking sheet.']].map(([n,t,d])=><div className="step" key={n}><div className="step-number">{n}</div><div><h3>{t}</h3><p>{d}</p></div><span>↗</span></div>)}</div></section>

    </main>}

    {page === 'courses' && <main id="page-content" className="inner-page"><div className="container page-intro"><div className="eyebrow">SIX-SESSION COURSE</div><h1>Six-session<br/><em>course</em></h1><p>We begin with tools you already use, then add planning, advertising and measurement. Open a session for details.</p></div><div className="container course-layout"><div>{sessions.map(([title, practice, outcome], index) => <details className="session" key={title}><summary><span className="session-index">0{index + 1}</span><span>{title}</span><b>+</b></summary><div className="session-detail"><p><strong>Practice:</strong>{practice}</p><p><strong>You leave with:</strong>{outcome}</p></div></details>)}</div><aside className="course-aside"><h2>Good to <em>know</em></h2>{faqs.map(([question, answer]) => <details className="faq" key={question}><summary>{question}<b>+</b></summary><p>{answer}</p></details>)}</aside></div></main>}

    {page === 'toolkit' && <main id="page-content" className="inner-page"><div className="container page-intro"><div className="eyebrow">FREE STARTER TOOLKIT</div><h1>Free starter<br/><em>toolkit</em></h1><p>Simple tools you can use this week.</p></div><div className="container toolkit-grid"><section className="tool-panel checklist-panel"><div className="panel-overline">WHATSAPP BUSINESS</div><h2>WhatsApp Business<br/>checklist</h2><div className="progress-meta"><span>{checked.length} of {checklist.length} done</span><span>{progress}%</span></div><div className="progress-track" role="progressbar" aria-label="Checklist progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{width: `${progress}%`}}/></div><div className="checklist">{checklist.map((item, index)=><label className="check-row" key={item}><input type="checkbox" checked={checked.includes(index)} onChange={() => setChecked(checked.includes(index) ? checked.filter(i => i !== index) : [...checked, index])}/><span>{item}</span><b aria-hidden="true">✓</b></label>)}</div><p className="small-note">Your progress is saved on this device.</p></section><div className="tool-side"><section className="tool-panel"><div className="panel-overline">WEEKLY CONTENT ROUTINE</div><h2>Weekly content routine</h2><div className="week-table">{[['Mon','A product or service, with a clear photo'],['Wed','A helpful tip or frequently asked question'],['Fri','Availability or an offer, with dates checked']].map(([day,post])=><div className="week-row" key={day}><span>{day}</span><div><p>{post}</p></div></div>)}</div></section><section className="tool-panel tracker-panel"><h2>Results tracker columns</h2><p>Date · Channel · Activity · Cost · Enquiries · Orders</p></section><section className="ad-reminder"><span aria-hidden="true">✳</span><div><strong>Before you pay for ads</strong><p>Know your goal, audience, budget, duration, message and how you will measure success.</p></div></section></div></div></main>}

    {page === 'ads' && <main id="page-content" className="inner-page ads-page"><div className="container page-intro"><div className="eyebrow">AD CAMPAIGNS</div><h1>Our ads.<br/><em>Made for local growth.</em></h1><p>Explore sample campaign creatives for the training project. Each one has a clear audience, message and next step.</p><div className="sample-disclaimer ads-disclaimer">Demo showcase: these are sample ad concepts, not live or paid advertisements.</div></div><div className="container ads-grid">{sampleAds.map(ad=><article className="ad-showcase" key={ad.id}><div className={`ad-preview ${ad.style}`}><div className="ad-preview-head"><span className="ad-brand-mark">↗</span><span>{ad.platform}</span><span className="ad-sponsored">{ad.badge}</span></div><div className="ad-preview-copy"><div className="ad-kicker">DIGITAL MARKETING TRAINING</div><h2>{ad.headline}</h2><p>{ad.copy}</p><a href={`#${ad.path}`} className="ad-cta">{ad.cta} <span>↗</span></a></div><div className="ad-preview-foot">SMALL BUSINESS · PRACTICAL SKILLS · REAL GROWTH</div></div><div className="ad-details"><div><span>CAMPAIGN</span><h3>{ad.campaign}</h3></div><div className="ad-meta"><span>{ad.format}</span><span>Goal: {ad.objective}</span></div></div></article>)}</div></main>}

    {page === 'join' && <main id="page-content" className="inner-page join-page"><div className="container page-intro"><div className="eyebrow">JOIN A SESSION</div><h1>Join a<br/><em>session</em></h1><p>Fill in your details to create a ready-to-send message for the training organiser.</p></div><div className="container schedule-demo"><div><span className="panel-overline">SAMPLE SESSION DETAILS</span><h2>Six weekly, hands-on sessions</h2><p>Sample dates: Saturdays, 14 November–19 December 2026 · 10:00 am–12:00 pm IST</p></div><ul><li>Sample venue: KLE Society’s Science and Commerce College, Navi Mumbai</li><li>Sample fee: Free</li><li>No marketing background required. Bring a smartphone for guided practice.</li></ul><p className="sample-disclaimer">These are dummy details for the website preview. Confirm dates, venue and fee with the organiser before attending.</p><p className="contact-link">Questions? <a href="mailto:training@example.com">training@example.com</a> <span>(sample contact)</span></p></div><div className="container join-grid"><section className="form-panel"><label htmlFor="name">Your name</label><input id="name" autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><label htmlFor="business">Business name and type</label><input id="business" autoComplete="organization" value={form.business} onChange={e=>setForm({...form,business:e.target.value})}/><label htmlFor="topic">What would you like to learn first?</label><select id="topic" value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}>{topics.map(t=><option key={t}>{t}</option>)}</select><button className="button button-primary form-button" onClick={buildMessage}>Create message <span>↗</span></button><button className="button button-submit" onClick={saveInterest} disabled={saving}>{saving ? 'Saving…' : 'Save interest'} <span>→</span></button><div className="privacy-note"><strong>Your privacy</strong><p>Your name, business and topic are used only to manage training interest. In demo mode, registrations reset when the API stops; in SQL Server mode, they remain stored until an organiser removes them. The site does not use third-party analytics. Checklist progress and theme choice stay in this browser.</p></div></section><section className="message-panel"><label htmlFor="message-output">Your message</label><textarea id="message-output" aria-label="Your message" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Your message will appear here."/><button className="button button-outline-dark" onClick={copyMessage}>Copy message <span>↗</span></button><p className={`status-message ${statusTone}`} role="status" aria-live="polite">{status}</p></section></div></main>}

    {page === 'about' && <main id="page-content" className="inner-page about-page"><div className="container page-intro"><div className="eyebrow">ABOUT THE PROJECT</div><h1>About the<br/><em>project</em></h1></div><div className="container about-grid"><section className="about-story"><div className="panel-overline">WHY WE BUILT IT</div><h2>Why we built it</h2><p>Small businesses power local communities, but many find digital marketing confusing or hard to keep up. This project turns survey feedback from local business owners into practical, beginner-level training that starts with familiar tools and focuses on useful habits.</p></section><aside className="project-card"><div className="project-stamp">✳</div><div className="panel-overline">COMMUNITY ENGAGEMENT PROJECT</div><h3>Community<br/>Engagement Project</h3><div className="project-rule"/><p>Created by Nanda Sheshnath Gupta (Seat No. 502517224, Group 20), T.Y.B.Sc. Information Technology, A.Y. 2026–27.<br/>Guide: Asst. Prof. Shaila Bhalerao<br/>KLE Society’s Science and Commerce College, Navi Mumbai, affiliated to the University of Mumbai.</p></aside></div></main>}

    {page === 'organiser' && <main id="page-content" className="inner-page organiser-page"><div className="container page-intro"><div className="eyebrow">ORGANISER AREA</div><h1>Training<br/><em>interest list</em></h1><p>Sign in to view the sample training interest list.</p></div>{!isAuthenticated ? <form className="container organiser-panel login-panel" onSubmit={signIn}><h2>Demo organiser sign in</h2><label htmlFor="organiser-username">Username</label><input id="organiser-username" autoComplete="username" value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})} required/><label htmlFor="organiser-password">Password</label><input id="organiser-password" type="password" autoComplete="current-password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} required/><button className="button button-primary login-button" disabled={authLoading}>{authLoading ? 'Signing in…' : 'Sign in'} <span>→</span></button><p className={`admin-status ${authTone}`} role="status" aria-live="polite">{authStatus}</p><p className="demo-key-note">Sample login: <code>organizer</code> / <code>demo-admin-2026</code></p><p className="sample-disclaimer">Demo only: this frontend login is for preview and does not protect real user data.</p></form> : <section className="container organiser-dashboard"><div className="dashboard-toolbar"><div><span className="panel-overline">DEMO DASHBOARD</span><p>Welcome, <strong>{currentUser}</strong></p></div><div><button className="button button-outline-dark" onClick={loadRegistrations} disabled={loadingRecords}>{loadingRecords ? 'Refreshing…' : 'Refresh'} <span>↻</span></button><button className="button button-submit" onClick={signOut}>Log out <span>↗</span></button></div></div><p className={`admin-status ${adminTone}`} role="status" aria-live="polite">{adminStatus}</p><p className="demo-key-note">Sample rows are built-in data. New interests are saved only in this browser.</p>{adminRecords.length > 0 ? <div className="registration-table-wrap"><table className="registration-table"><caption>All sample training interest records ({adminRecords.length})</caption><thead><tr><th scope="col">Name</th><th scope="col">Business</th><th scope="col">First topic</th><th scope="col">Received</th></tr></thead><tbody>{adminRecords.map(record=><tr key={record.id}><td>{record.name}</td><td>{record.business}</td><td>{record.topic}</td><td>{new Date(record.createdAt).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div> : <div className="empty-registrations">{loadingRecords ? 'Loading registrations…' : 'No registrations yet.'}</div>}</section>}</main>}

    <footer className="footer"><div className="container footer-main"><a className="brand brand-footer" href="#home"><span className="brand-mark">📈</span><span>Digital Marketing Training for Small Businesses</span></a><p>Community Engagement Project<br/>Department of Information Technology</p><div className="footer-nav">{navItems.map(([key,label])=><a href={`#${key}`} key={key}>{label}</a>)}</div></div><div className="container footer-bottom"><span>Digital Marketing Training for Small Businesses · Community Engagement Project, Department of Information Technology, KLE Society’s Science and Commerce College, Navi Mumbai.</span></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
