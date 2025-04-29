import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const StateComparisons = ({ onStateClick, statesList }) => {
  const svgRef = useRef();
  const statesRef = useRef(null);

  useEffect(() => {
    const width = 975;
    const height = 610;

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
  }, [onStateClick]);

  useEffect(() => {
    if (!statesRef.current) return;
    console.log(statesList)
    statesRef.current
      .transition().duration(500)
      .style('fill', d => {
        const stateName = d.properties.name;
        return statesList.includes(stateName) ? 'red' : '#ccc';
      });
  }, [statesList]);

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
    position: "relative"
  },
};

export default React.memo(StateComparisons);
