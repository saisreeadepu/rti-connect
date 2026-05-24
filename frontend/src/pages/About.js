import React from 'react';
import './About.css';

const About = () => {
  const sections = [
    { section: 'Section 6', description: 'Any citizen can submit RTI request with ₹10 fee' },
    { section: 'Section 7', description: 'PIO must respond within 30 days of receipt' },
    { section: 'Section 8', description: 'Exemptions — national security, personal privacy, etc.' },
    { section: 'Section 19', description: 'Right to appeal within 30 days of decision' },
    { section: 'Section 20', description: 'Penalty of ₹250/day for PIO non-compliance' }
  ];

  return (
    <div className="about-page" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('/images/homepage%20banner.jpg.jpeg')" }}>
      <div className="container" style={{maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem'}}>
        <h1 className="about-title" style={{fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center'}}>About Us</h1>
        
        <div className="about-content glass-container" style={{padding: '3rem', borderRadius: 'var(--radius-xl)'}}>
          <h2 style={{color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '2rem'}}>Right to Information Act, 2005</h2>
          
          <div className="about-text" style={{color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '3rem'}}>
            <p style={{marginBottom: '1rem'}}>
              The RTI Act empowers every citizen of India to question the government and its working. It was enacted on 15 June 2005 and came into force on 12 October 2005.
            </p>
            <p style={{marginBottom: '1rem'}}>
              Under Section 6, any citizen can request information from a public authority which is required to reply within 30 days. For matters concerning life and liberty, the response must come within 48 hours.
            </p>
            <p>
              The Act applies to all constitutional authorities, including the Executive, Legislature, and Judiciary, as well as any institution or body established or constituted by an act of Parliament or state legislature.
            </p>
          </div>

          <h2 style={{color: 'var(--primary-dark)', marginBottom: '2rem', textAlign: 'center', fontSize: '1.75rem'}}>Key Sections of RTI Act</h2>
          
          <div className="sections-grid" style={{display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
            {sections.map((item, index) => (
              <div key={index} className="section-card glass-card" style={{padding: '1.5rem', borderRadius: 'var(--radius-md)'}}>
                <h3 style={{color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '1.25rem'}}>{item.section}</h3>
                <p style={{color: 'var(--text-secondary)', margin: 0, fontWeight: '500'}}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
