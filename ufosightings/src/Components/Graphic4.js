import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

const Graphic4 = ({ selectedSightingID }) => {
  const [sightingData, setSightingData] = useState(null);

  useEffect(() => {
    if (!selectedSightingID) {
      setSightingData(null);
      return;
    }

    d3.csv('/cleaned/cleaned_ufo.csv', d => ({
      sighting_id: d.sighting_id,
      datetime: d.datetime,
      city: d.city,
      state: d.state,
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
        const filtered = data.filter(d => d.sighting_id === selectedSightingID);
        setSightingData(filtered);
      })
      .catch(error => {
        console.error('Error loading sightings:', error);
      });
  }, [selectedSightingID]);

  return (
    <div style={styles.box}>
      <h2>Selected sighting ID: {selectedSightingID}</h2>
      {sightingData ? (
        <pre style={styles.pre}>
          {JSON.stringify(sightingData, null, 2)}
        </pre>
      ) : (
        <p>No data found or loading...</p>
      )}
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#d4fcd4',
    borderRadius: '4px',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  pre: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    margin: 0,
    textAlign: 'left',
    padding: '10px',
    flex: 1,
    overflowY: 'auto',
  },
};

export default Graphic4;
