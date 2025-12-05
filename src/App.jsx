import React, { useState } from 'react';
import Layout from './components/Layout';
import ComplianceForm from './components/ComplianceForm';

function App() {
  return (
    <Layout>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', marginBottom: 'var(--spacing-md)' }}>
          Export Compliance Assistant
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Verify US export regulations, license exceptions (EAR/ITAR), and get agentic insights in seconds.
        </p>
      </div>

      <ComplianceForm />
    </Layout>
  );
}

export default App;
