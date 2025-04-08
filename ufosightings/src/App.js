import React, { useState, useCallback } from 'react';
import Map from './Components/Map';
import Graphic1 from './Components/Graphic1';
import Graphic2 from './Components/Graphic2';
import Header from './Components/Header';

const TwoColumnLayout = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState('population');

  const handleStateClick = useCallback((stateName) => {
    setSelectedState(stateName);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftColumn}>
        <Header />
        <Map onStateClick={handleStateClick} selectedVariable={selectedVariable} />
        <input
          type="text"
          value={selectedVariable}
          onChange={(e) => setSelectedVariable(e.target.value)}
          placeholder="Enter variable name..."
        />
      </div>
      <div style={styles.rightColumn}>
        <Graphic1 selectedState={selectedState} />
        <Graphic2 selectedState={selectedState} />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  leftColumn: {
    flex: 13,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '10px 5px 10px 10px',
  },
  rightColumn: {
    flex: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '10px 10px 10px 5px',
  },
};

export default TwoColumnLayout;
