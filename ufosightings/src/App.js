import React, { useState, useCallback } from 'react';
import TrendsMap from './Components/TrendsMap';
import Graphic1 from './Components/Graphic1';
import Graphic2 from './Components/Graphic2';
import Graphic3 from './Components/Graphic3';
import Graphic4 from './Components/Graphic4';
import Header from './Components/Header';
import SightingsMap from './Components/SightingsMap';

const TwoColumnLayout = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedSightingID, setSelectedSightingID] = useState(0);
  const [tab, setTab] = useState("aggregate"); // "aggregate" or "individual" or "info"

  const handleStateClick = useCallback((stateName) => {
    setSelectedState(stateName);
  }, []);

  // Memoize the sighting click callback, so its reference stays stable.
  const onSightingClick = useCallback((id) => {
    setSelectedSightingID(id);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftColumn}>
        <Header setTab={setTab} />
        {tab === "aggregate" && (
          <TrendsMap onStateClick={handleStateClick} />
        )}
        {tab === "individual" && (
          <SightingsMap onSightingClick={onSightingClick} />
        )}
      </div>
      <div style={styles.rightColumn}>
        {tab === "aggregate" && <Graphic1 selectedState={selectedState} />}
        {tab === "aggregate" && <Graphic2 selectedState={selectedState} />}
        {tab === "individual" && <Graphic3 selectedSightingID={selectedSightingID} />}
        {tab === "individual" && <Graphic4 selectedSightingID={selectedSightingID} />}
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
    backgroundColor: '#303030',
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
