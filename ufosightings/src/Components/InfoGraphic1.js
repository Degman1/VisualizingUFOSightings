import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';


const InfoGraphic1 = ({  }) => {
  

  return (
    <div style={styles.box}>
      <p style={styles.placeholder}>This website is our CS571 Data Visualization final project.</p>
      <p style={styles.placeholder}>Group: Jacob Sweet, David Gerard, Josh Daniel</p>
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
    flexDirection:'column',
    position: 'relative',
  },
  placeholder: {
    fontStyle: 'italic',
    fontSize: '1.15rem',
  },
  
};

export default InfoGraphic1;
