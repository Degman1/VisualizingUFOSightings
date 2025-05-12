import React from 'react';

const InfoPage = () => {
  return (
    <div style={styles.box}>
      <img 
        src="https://media-cldnry.s-nbcnews.com/image/upload/newscms/2018_01/2280531/180103-ufo-illustration-mn-1015.jpg" 
        alt="Embedded Image" 
        style={styles.image} 
      />
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: '0',
    flex: 2,
    fontSize: '1vw',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',  // Ensures the image covers the entire container
  },
};

export default InfoPage;
