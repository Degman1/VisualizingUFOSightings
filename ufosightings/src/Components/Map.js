import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const Map = ({ onStateClick, selectedVariable }) => {
  const svgRef = useRef();
  // Store the D3 selection for state paths to update color later.
  const statesRef = useRef(null);

  // Dummy database for all states.
  const dummyDatabase = {
    'Alabama': 10,
    'Alaska': 20,
    'Arizona': 30,
    'Arkansas': 40,
    'California': 50,
    'Colorado': 60,
    'Connecticut': 70,
    'Delaware': 80,
    'Florida': 90,
    'Georgia': 100,
    'Hawaii': 110,
    'Idaho': 120,
    'Illinois': 130,
    'Indiana': 140,
    'Iowa': 150,
    'Kansas': 160,
    'Kentucky': 170,
    'Louisiana': 180,
    'Maine': 190,
    'Maryland': 200,
    'Massachusetts': 210,
    'Michigan': 220,
    'Minnesota': 230,
    'Mississippi': 240,
    'Missouri': 250,
    'Montana': 260,
    'Nebraska': 270,
    'Nevada': 280,
    'New Hampshire': 290,
    'New Jersey': 300,
    'New Mexico': 310,
    'New York': 320,
    'North Carolina': 330,
    'North Dakota': 340,
    'Ohio': 350,
    'Oklahoma': 360,
    'Oregon': 370,
    'Pennsylvania': 380,
    'Rhode Island': 390,
    'South Carolina': 400,
    'South Dakota': 410,
    'Tennessee': 420,
    'Texas': 430,
    'Utah': 440,
    'Vermont': 450,
    'Virginia': 460,
    'Washington': 470,
    'West Virginia': 480,
    'Wisconsin': 490,
    'Wyoming': 500,
  };

  useEffect(() => {
    const width = 975;
    const height = 610;
    
    // Variable to keep track of the currently zoomed/selected state.
    let currentSelected = null;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
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
      // Initial fill is a placeholder; will be updated via the second effect.
      .attr('fill', '#ccc')
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

    states.append('title')
      .text(d => d.properties.name);

    g.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

    svg.call(zoom);

    // Save the states selection for later updates.
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

  useEffect(() => {
    if (!statesRef.current) return;
    
    const data = dummyDatabase; // TODO: dynamically choose based on selectedVariable.
    const values = Object.values(data);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    const colorScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range(["#f7fbff", "#08306b"]);

    // Update every state's fill using the dummy data.
    statesRef.current.transition().duration(750)
      .style("fill", d => {
        const stateName = d.properties.name;
        return colorScale(data[stateName] || minVal);
      });
  }, [selectedVariable]);

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
    // backgroundColor: '#d1e8ff',
    borderRadius: '4px',
  },
};

export default React.memo(Map);
