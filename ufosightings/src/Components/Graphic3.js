import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

const capitalize = str =>
  str
    .split(" ")
    .map(x => x?.charAt(0).toUpperCase() + x?.slice(1).toLowerCase())
    .join(" ");

const decodeHTML = (str) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  };

const Graphic3 = ({ selectedSightingID }) => {
  const [sightingData, setSightingData] = useState(null);

  useEffect(() => {
    if (!selectedSightingID) {
      setSightingData(null);
      return;
    }

    d3.csv('/cleaned/cleaned_ufo.csv', d => ({
      sighting_id: d.sighting_id,
      datetime: d.datetime,
      city: capitalize(decodeHTML(d.city)),
      state: d.state.toUpperCase(),
      country: d.country,
      shape: d.shape,
      durationSeconds: +d["duration (seconds)"],
      duration: d["duration (hours/min)"],
      comments: d.comments,
      datePosted: d["date posted"],
      latitude: +d.latitude,
      longitude: +d.longitude,
      state_full: d.state_full
    }))
      .then(data => {
        const match = data.find(d => d.sighting_id === selectedSightingID);
        setSightingData(match || null);
      })
      .catch(error => {
        console.error('Error loading sightings:', error);
      });
  }, [selectedSightingID]);

  return (
    <div style={styles.box}>
      <h2 style={styles.title}>Sighting Metadata</h2>
      {sightingData ? (
        <div style={styles.dataContainer}>
          {Object.entries(sightingData).map(([key, value]) => {
            if (['sighting_id', 'datetime', 'comments', 'longitude', 'latitude', 'durationSeconds', 'country'].includes(key)) return null;
            return (
              <div key={key} style={styles.row}>
                <span style={styles.label}>{formatKey(key)}:</span>
                <span style={styles.value}>{String(value)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={styles.placeholder}>Select a sighting for more data.</p>
      )}
    </div>
  );
};

// Capitalize and format keys
const formatKey = (key) => {
  switch(key) {
    case "datePosted":
      return "Date Posted";
    case "state_full":
      return "State"
    default:
      return key
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}  
  

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: "2vh",
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '10px 0 0',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#004c66',
  },
  dataContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    wordBreak: 'break-word',
  },
  label: {
    fontWeight: 'bold',
    color: '#003344',
    marginRight: '8px',
    flex: '0 0 40%',
  },
  value: {
    flex: '1 0 50%',
    color: '#222',
  },
  placeholder: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '1rem',
    color: '#777',
  },
};

export default Graphic3;
