import React from 'react';

const Header = ({ setTab }) => {
  return (
    <div style={styles.box}>
      <div style={styles.content}>
        <h1 style={styles.title}>UFO Sightings</h1>
        <p style={styles.subtitle}>Jacob Sweet, David Gerard, Josh Daniel</p>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={() => setTab("aggregate")}>Trends</button>
          <button style={styles.button} onClick={() => setTab("individual")}>Individual Sightings</button>
          <button style={styles.button} onClick={() => setTab("comparison")}>State Comparisons</button>
          <button style={styles.button} onClick={() => setTab("info")}>Info</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '3px solid #72ba72',
    borderRadius: '12px',
    padding: '16px',
    flexShrink: 0,
    height: 'auto',
    textAlign: 'center',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: '1.8rem',
    margin: '0 0 6px 0',
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: '0.95rem',
    margin: '0 0 14px 0',
    color: '#555',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '8px 14px',
    backgroundColor: '#72ba72',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
  },
};

export default Header;
