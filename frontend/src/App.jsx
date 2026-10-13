import { useState } from 'react';
import CollectionFinder from './pages/CollectionFinder.jsx';
import ReportIssue from './pages/ReportIssue.jsx';

export default function App() {
  const [tab, setTab] = useState('finder');

  return (
    <>
      <header className="header">
        <h1>♻️ Clean Lanka</h1>
        <p>Find your garbage collection route, time and fee — or report a problem.</p>
        <nav>
          <button className={tab === 'finder' ? 'active' : ''} onClick={() => setTab('finder')}>
            Collection Finder
          </button>
          <button className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>
            Report Issue
          </button>
        </nav>
      </header>
      <main className="container">{tab === 'finder' ? <CollectionFinder /> : <ReportIssue />}</main>
      <footer className="footer">Clean Lanka · Waste Management System</footer>
    </>
  );
}
