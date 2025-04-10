import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const SightingsMap = ({ onSightingClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 975;
    const height = 610;

    // Create the SVG container.
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .style('maxWidth', '100%')
      .style('height', 'auto');

    // Create a zoom behavior.
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);

    // Create a projection for a US map.
    const projection = d3.geoAlbersUsa()
      .fitSize([width, height], topojson.feature(us, us.objects.states));
    const path = d3.geoPath().projection(projection);

    // Append a group for all map graphics.
    const g = svg.append('g');

    // Draw US states.
    const geoData = topojson.feature(us, us.objects.states).features;
    const statesGroup = g.append('g')
      .attr('fill', '#ccc')  // State fill (background) color.
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round');

    statesGroup.selectAll('path')
      .data(geoData)
      .join('path')
      .attr('d', path);

    // Create a layer for the sightings (points).
    const pointsGroup = g.append('g')
      .attr('class', 'sightings');

    // Load the CSV data.
    d3.csv('/cleaned/cleaned_ufo.csv', d => {
      return {
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
        state_full: d.state_full,
        sighting_id: d.sighting_id
      };
    }).then(data => {
      // Filter valid rows.
      const validData = data.filter(d => !isNaN(d.latitude) && !isNaN(d.longitude) && d.durationSeconds > 0);
      console.log("Valid points loaded:", validData.length);

      // (Optional: color mapping code here if needed)

      // Render each dot with a click handler.
      pointsGroup.selectAll('circle')
        .data(validData)
        .join('circle')
        .attr('cx', d => {
          const coords = projection([d.longitude, d.latitude]);
          return coords ? coords[0] : -100;
        })
        .attr('cy', d => {
          const coords = projection([d.longitude, d.latitude]);
          return coords ? coords[1] : -100;
        })
        .attr('r', 1.5)
        .attr('fill', d => 'red') // or whatever color logic you have
        .attr('opacity', 0.7)
        .on('click', (event, d) => {
          event.stopPropagation();
          if (onSightingClick) onSightingClick(d.sighting_id);
        });
    })
    .catch(error => {
      console.error("Error loading CSV data:", error);
    });

    // Enable zoom.
    svg.call(zoom);

    function zoomed(event) {
      const { transform } = event;
      g.attr('transform', transform);
      g.attr('stroke-width', 1 / transform.k);
    }

    return () => {
      svg.selectAll('*').remove();
    };
  }, [onSightingClick]);

  return (
    <div style={styles.box}>
      <svg ref={svgRef} />
    </div>
  );
};

const styles = {
  box: {
    flex: 25,
    height: '100%',
    overflow: 'hidden',
    borderRadius: '4px',
  },
};

export default React.memo(SightingsMap);
