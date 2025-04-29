import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';


const Graphic6 = ({ statesList }) => {
  

  return (
    <div style={styles.box}>
      {statesList}
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: '24px',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
};

export default Graphic6;
