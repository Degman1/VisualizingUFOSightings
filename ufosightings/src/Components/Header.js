import React from 'react';

const Header = ( {setTab}) => {
  return (
    <div style={styles.box}>
      <h2>Header</h2>
      <p>Jacob Sweet, David Gerard, Josh Daniel.</p>
      <button onClick={()=> setTab("trends")}>Trends</button>
      <button onClick={()=> setTab("individual")}>Individual Sightings</button>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#ffe5b4',
    borderRadius: '4px',
    textAlign: 'center',
    flex: 5,
  },
};

export default Header;
