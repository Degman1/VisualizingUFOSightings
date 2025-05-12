import React from 'react';

const InfoGraphic2 = () => {
  return (
    <div style={styles.box}>
      <p>Submission Links:</p>
      <a 
        href="https://docs.google.com/document/d/16myoh6_giWauI5Ayx4XB0Byb156Lq5aGDzB4YJ-wpAU/edit?tab=t.0#heading=h.7juusdhs88j9" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.link}
      ><u>Process Book Link</u></a>
      <a 
        href="https://www.youtube.com/watch?v=Z5Z8Ox472Oc&feature=youtu.be" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.link}
      ><u>Screencast Link</u></a>
      <a 
        href="https://github.com/Degman1/VisualizingUFOSightings" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.link}
      ><u>Github Link</u></a>
      <p>Data:</p>
      <a 
        href="https://www.kaggle.com/datasets/NUFORC/ufo-sightings" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.link}
      ><u>UFO Data</u></a>
      <a 
        href="https://www.ers.usda.gov/data-products/county-level-data-sets" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.link}
      ><u>Population Data</u></a>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: '24px 48px',
    flex: 2,
    flexDirection:'column',
    fontSize: '1vw',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  link: {
    color: '#004c66',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
};

export default InfoGraphic2;
