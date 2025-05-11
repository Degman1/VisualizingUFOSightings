import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const regionPresets = {
  All: [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", 
    "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", 
    "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", 
    "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", 
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ],
  None: [],
  Northern: ["Maine", "Vermont", "New Hampshire", "New York", "Michigan", "Minnesota", "Wisconsin", "North Dakota"],
  Southern: ["Texas", "Oklahoma", "Arkansas", "Louisiana", "Mississippi", "Alabama", "Tennessee", "Kentucky", "Georgia", "Florida", "South Carolina", "North Carolina", "Virginia"],
  Eastern: ["Maine", "New Hampshire", "Vermont", "Massachusetts", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia"],
  Western: ["California", "Oregon", "Washington", "Nevada", "Idaho", "Montana", "Utah", "Arizona", "New Mexico", "Hawaii", "Alaska"],
  Central: ["Illinois", "Indiana", "Iowa", "Kansas", "Missouri", "Nebraska", "North Dakota", "South Dakota", "Wisconsin", "Minnesota"]
};

const TrendsMapMini = ({ onStateClick, statesList, setStatesList }) => {
  const svgRef = useRef();
  const statesRef = useRef(null);
  const containerRef = useRef();

  useEffect(() => {
    const resizeMap = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();

      const svg = d3.select(svgRef.current)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', width)
        .attr('height', height)
        .style('maxWidth', '100%')
        .style('height', 'auto');

      const projection = d3.geoAlbersUsa()
        .fitSize([width, height], topojson.feature(us, us.objects.states));
      const path = d3.geoPath().projection(projection);

      const g = svg.append('g');

      const geoData = topojson.feature(us, us.objects.states).features;
      const statesGroup = g.append('g')
        .attr('fill', '#ccc')
        .attr('cursor', 'pointer');

      const states = statesGroup.selectAll('path')
        .data(geoData)
        .join('path')
        .attr('d', path)
        .attr('fill', d => statesList.includes(d.properties.name) ? 'green' : '#ccc')
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
          if (onStateClick) onStateClick(d.properties.name);
        });

      states.append('title').text(d => d.properties.name);

      g.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

      statesRef.current = states;

      return () => {
        svg.selectAll('*').remove();
      };
    };

    resizeMap();

    window.addEventListener('resize', resizeMap);
    return () => window.removeEventListener('resize', resizeMap);
  }, [onStateClick, statesList]);

  // Update state colors when statesList changes
  useEffect(() => {
    if (!statesRef.current) return;

    statesRef.current
      .transition().duration(500)
      .attr('fill', d => statesList.includes(d.properties.name) ? 'green' : '#ccc');
  }, [statesList]);

  // Handle preset button click
  const handlePresetClick = (preset) => {
    setStatesList(regionPresets[preset]);
  };

  return (
    <div ref={containerRef} style={styles.box}>
      <svg ref={svgRef} style={styles.svg} />
      <div style={styles.buttons}>
        {Object.keys(regionPresets).map(preset => (
          <button 
            key={preset} 
            style={styles.button} 
            onClick={() => handlePresetClick(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: '16px',
    flex: 3,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column', // Make items stack vertically
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  svg: {
    width: '100%',
    height: 'auto',
    flex: 1, // Allow the map to take available space
  },
  buttons: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap', // Wrap buttons if they exceed container width
  },
  button: {
    padding: '6px 10px',
    backgroundColor: '#72ba72',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    margin: '2px',
  }
};

export default React.memo(TrendsMapMini);
