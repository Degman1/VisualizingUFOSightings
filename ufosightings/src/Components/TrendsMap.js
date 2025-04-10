import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const TrendsMap = ({ onStateClick, selectedVariable }) => {
  const svgRef = useRef();
  // We'll store the D3 selection for state paths here so we can update fill colors later.
  const statesRef = useRef(null);

  useEffect(() => {
    const width = 975;
    const height = 610;
    
    // Variable to keep track of the currently zoomed/selected state.
    let currentSelected = null;

    // Create the SVG container.
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .style('maxWidth', '100%')
      .style('height', 'auto');

    // Set up zoom.
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);

    // Create the projection and path generator.
    const projection = d3.geoAlbersUsa()
      .fitSize([width, height], topojson.feature(us, us.objects.states));
    const path = d3.geoPath().projection(projection);

    // Append the main group.
    const g = svg.append('g');

    // Draw US states from TopoJSON.
    const geoData = topojson.feature(us, us.objects.states).features;
    const statesGroup = g.append('g')
      .attr('fill', '#ccc')  // Initial placeholder fill; will be updated below.
      .attr('cursor', 'pointer');

    const states = statesGroup.selectAll('path')
      .data(geoData)
      .join('path')
      .attr('d', path)
      .on('click', (event, d) => {
        // Toggle zoom: if the same state is clicked, reset zoom.
        if (currentSelected === d.properties.name) {
          svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.pointer(event, svg.node())
          );
          currentSelected = null;
          if (onStateClick) onStateClick(null);
          return;
        }
        
        // Otherwise, zoom in on the clicked state.
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        event.stopPropagation();
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        );
        currentSelected = d.properties.name;
        if (onStateClick) onStateClick(d.properties.name);
      });

    // Append tooltips.
    states.append('title')
      .text(d => d.properties.name);

    // Draw state borders.
    g.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

    svg.call(zoom);

    // Save the D3 selection of states for later updates.
    statesRef.current = states;

    function zoomed(event) {
      const { transform } = event;
      g.attr('transform', transform);
      g.attr('stroke-width', 1 / transform.k);
    }

    return () => {
      svg.selectAll('*').remove();
    };
  }, [onStateClick]);

  // NEW: Load both the sightings CSV and the population CSV, aggregate sightings,
  // and update state fill colors by sightings per capita.
  useEffect(() => {
    if (!statesRef.current) return;
    
    // Load UFO sightings CSV and population CSV concurrently.
    Promise.all([
      d3.csv('/cleaned/cleaned_ufo.csv', d => ({
        state_full: d.state_full, // full state name (as used on the map)
      })),
      d3.csv('/cleaned/cleaned_population.csv', d => ({
        Area_Name: d.Area_Name, 
        CENSUS_2020_POP: +d.CENSUS_2020_POP, // convert population to a number
      }))
    ]).then(([ufoData, popData]) => {
      // Aggregate sightings counts by state.
      const aggregated = d3.rollup(
        ufoData,
        v => v.length,
        d => d.state_full.trim()
      );
      const aggregatedData = Object.fromEntries(aggregated);

      // Create a population lookup.
      const popLookup = {};
      popData.forEach(d => {
        popLookup[d.Area_Name.trim()] = d.CENSUS_2020_POP;
      });

      // Compute sightings per capita for each state.
      // We'll compute perCapita as: count / population.
      const perCapita = {};
      Object.keys(aggregatedData).forEach(state => {
        if (popLookup[state]) {
          perCapita[state] = aggregatedData[state] / popLookup[state];
        } else {
          perCapita[state] = 0;
        }
      });

      // Get the min and max per capita rates.
      const rates = Object.values(perCapita);
      const minRate = d3.min(rates) || 0;
      const maxRate = d3.max(rates) || 1;

      // Create a color scale mapping per capita rate to a color.
      const colorScale = d3.scaleLinear()
        .domain([minRate, maxRate])
        .range(["#f7fbff", "#08306b"]);

      // Update each state's fill based on the per capita value.
      statesRef.current.transition().duration(750)
        .style("fill", d => {
          const stateName = d.properties.name;
          const rate = perCapita[stateName] || 0;
          return colorScale(rate);
        });

    }).catch(error => {
      console.error("Error loading or processing CSV data:", error);
    });
  }, [selectedVariable]); // Re-run aggregation if selectedVariable changes (if needed).

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

export default React.memo(TrendsMap);
