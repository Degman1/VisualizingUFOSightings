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

const Graphic4 = ({ selectedSightingID }) => {
  const [sightingData, setSightingData] = useState(null);
  const [ufoPositions, setUfoPositions] = useState([]);

  useEffect(() => {
    if (!selectedSightingID) {
      setSightingData(null);
      setUfoPositions([]);
      return;
    }

    d3.csv('/cleaned/cleaned_ufo.csv', d => ({
      sighting_id: d.sighting_id,
      comments: d.comments,
      city: d.city,
      datePosted: d["date posted"],
    }))
      .then(data => {
        const match = data.find(d => d.sighting_id === selectedSightingID);
        setSightingData(match || null);

        // Generate 2 unique corners and random positions
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        const selectedCorners = corners.sort(() => 0.5 - Math.random()).slice(0, 2);

        const randOffset = () => 50 + Math.floor(Math.random() * 41) - 20; // 50 ± 20
        const styleBase = {
          position: 'absolute',
          width: '4vh',
          height: '4vh',
        };

        const placements = selectedCorners.map(corner => {
          const flip = Math.random() < 0.5; // true means face left
          const transform = flip ? 'scaleX(-1)' : 'scaleX(1)';
          const common = { ...styleBase, transform };

          switch (corner) {
            case 'top-left': return { ...common, top: `${randOffset()}px`, left: `${randOffset()}px` };
            case 'top-right': return { ...common, top: `${randOffset()}px`, right: `${randOffset()}px` };
            case 'bottom-left': return { ...common, bottom: `${randOffset()}px`, left: `${randOffset()}px` };
            case 'bottom-right': return { ...common, bottom: `${randOffset()}px`, right: `${randOffset()}px` };
            default: return common;
          }
        });

        setUfoPositions(placements);
      })
      .catch(error => {
        console.error('Error loading sightings:', error);
      });
  }, [selectedSightingID]);

  const getYear = (datePosted) => {
    if (!datePosted) return '';
    const parts = datePosted.split('/');
    return parts[2] || '';
  };

  return (
    <div style={styles.box}>
      {ufoPositions.map((style, idx) => (
        <img key={idx} src="/ufoIcon1.png" alt="UFO" style={style} />
      ))}

      {sightingData && sightingData.comments ? (
        <div style={styles.quoteContainer}>
          <div style={styles.quoteWrapper}>
            <span style={styles.quotationMarkLeft}>&ldquo;</span>
            <blockquote style={styles.quote}>
              {decodeHTML(sightingData.comments)}
            </blockquote>
            <span style={styles.quotationMarkRight}>&rdquo;</span>
          </div>
          <div style={styles.citation}>
            — {capitalize(decodeHTML(sightingData.city)) || 'Unknown'}, {getYear(sightingData.datePosted)}
          </div>
        </div>
      ) : (
        <p style={styles.placeholder}>No comment available for this sighting.</p>
      )}
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
  quoteContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  quoteWrapper: {
    position: 'relative',
    padding: '0 20px',
  },
  quotationMarkLeft: {
    position: 'absolute',
    top: '-20px',
    left: '0',
    fontSize: '3rem',
    color: '#333',
    lineHeight: 1,
  },
  quotationMarkRight: {
    position: 'absolute',
    bottom: '-20px',
    right: '0',
    fontSize: '3rem',
    color: '#333',
    lineHeight: 1,
  },
  quote: {
    fontSize: '1.25rem',
    fontStyle: 'italic',
    color: '#333',
    lineHeight: '1.5',
    textAlign: 'center',
    margin: 0,
  },
  citation: {
    alignSelf: 'flex-end',
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '10px',
    fontStyle: 'italic',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#888',
  },
};

export default Graphic4;
