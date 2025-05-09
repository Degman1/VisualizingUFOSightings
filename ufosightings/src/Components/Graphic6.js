import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';


const Graphic6 = ({ statesList }) => {
  

  return (
    <div style={styles.box}>
      <p style={styles.placeholder}>Choose any amount of states in the interactive map above. You can select an x-axis variable in the scatter plot on the left to look for trends or patterns between those states.</p>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: '24px 48px 24px 48px',
    flex: 2,
    fontSize: '1vw',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholder: {
    fontStyle: 'italic',
    fontSize: '1.15rem',
  },
  
};

export default Graphic6;
