import React from 'react';

const Header = () => {
  return (
    <div style={styles.box}>
      <h2>Header</h2>
      <p>Jacob Sweet, David Gerard, Josh Daniel.</p>
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
