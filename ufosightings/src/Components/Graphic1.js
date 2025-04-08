import React from 'react';

const Graphic1 = ({ selectedState }) => {
  return (
    <div style={styles.box}>
      <h2>Graphic 1: {selectedState}</h2>
      <p>This is the top-right graphic. It will probably be a line graph.</p>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#ffe5b4',
    borderRadius: '4px',
    textAlign: 'center',
    flex: 1,
  },
};

export default Graphic1;
