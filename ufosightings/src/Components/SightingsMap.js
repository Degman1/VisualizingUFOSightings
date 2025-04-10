import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const SightingsMap = ({ onSightingClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 975;
    const height = 610;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .style('maxWidth', '100%')
      .style('height', 'auto');

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);

    const projection = d3.geoAlbersUsa()
      .fitSize([width, height], topojson.feature(us, us.objects.states));
    const path = d3.geoPath().projection(projection);

    const g = svg.append('g');

    const geoData = topojson.feature(us, us.objects.states).features;
    const statesGroup = g.append('g')
      .attr('fill', '#ccc')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round');

    statesGroup.selectAll('path')
      .data(geoData)
      .join('path')
      .attr('d', path);

    const pointsGroup = g.append('g').attr('class', 'sightings');

    // Randomize mod group
    const randomMod = Math.floor(Math.random() * 5);

    d3.csv('/cleaned/cleaned_ufo.csv', d => ({
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
    })).then(data => {
      const validData = data.filter(d =>
        !isNaN(d.latitude) &&
        !isNaN(d.longitude) &&
        d.durationSeconds > 0 &&
        !isNaN(+d.sighting_id) &&
        +d.sighting_id % 5 === randomMod
      );

      console.log("Valid points loaded:", validData.length);

      const BATCH_SIZE = 200;
      let index = 0;

      function drawBatch() {
        const slice = validData.slice(index, index + BATCH_SIZE);

        pointsGroup.selectAll(null)
          .data(slice)
          .enter()
          .append('circle')
          .attr('cx', d => {
            const coords = projection([d.longitude, d.latitude]);
            return coords ? coords[0] : -100;
          })
          .attr('cy', d => {
            const coords = projection([d.longitude, d.latitude]);
            return coords ? coords[1] : -100;
          })
          .attr('r', 1.5)
          .attr('fill', 'red')
          .attr('opacity', 0.7)
          .on('mouseover', function () {
            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 4)
              .attr('fill', 'darkred');
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 1.5)
              .attr('fill', 'red');
          })
          .on('click', (event, d) => {
            event.stopPropagation();
            if (onSightingClick) onSightingClick(d.sighting_id);
          });

        index += BATCH_SIZE;
        if (index < validData.length) {
          requestAnimationFrame(drawBatch);
        }
      }

      requestAnimationFrame(drawBatch);
    })
      .catch(error => {
        console.error("Error loading CSV data:", error);
      });

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
      <div style={styles.legend}>
        <span style={styles.legendText}>*Only 20% of data rendered</span>
      </div>
    </div>
  );
};

const styles = {
  box: {
    flex: 25,
    height: '100%',
    overflow: 'hidden',
    borderRadius: '4px',
    position: 'relative',
  },
  legend: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    color: '#333',
    zIndex: 10,
  },
  legendText: {
    fontStyle: 'italic',
  },
};

export default React.memo(SightingsMap);
