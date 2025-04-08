import React from 'react';

const Graphic2 = ({ selectedState }) => {
  return (
    <div style={styles.box}>
      <h2>Graphic 2: {selectedState}</h2>
      <p>This is the bottom-right graphic. It will probably be a histogram.</p>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#d4fcd4',
    borderRadius: '4px',
    textAlign: 'center',
    flex: 1,
  },
};

export default Graphic2;
