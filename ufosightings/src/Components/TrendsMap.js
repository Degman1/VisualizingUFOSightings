import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './us.json';

const TrendsMap = ({ onStateClick, selectedVariable }) => {
  const svgRef = useRef();
  const statesRef = useRef(null);

  const [minRateLabel, setMinRateLabel] = useState(0);
  const [maxRateLabel, setMaxRateLabel] = useState(1);

  useEffect(() => {
    const width = 975;
    const height = 610;
    let currentSelected = null;

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
      .attr('cursor', 'pointer');

    const states = statesGroup.selectAll('path')
      .data(geoData)
      .join('path')
      .attr('d', path)
      .on('click', (event, d) => {
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

    states.append('title').text(d => d.properties.name);

    g.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

    svg.call(zoom);

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

    Promise.all([
      d3.csv('/cleaned/cleaned_ufo.csv', d => ({
        state_full: d.state_full,
      })),
      d3.csv('/cleaned/cleaned_population.csv', d => ({
        Area_Name: d.Area_Name,
        CENSUS_2020_POP: +d.CENSUS_2020_POP,
      }))
    ]).then(([ufoData, popData]) => {
      const aggregated = d3.rollup(
        ufoData,
        v => v.length,
        d => d.state_full.trim()
      );
      const aggregatedData = Object.fromEntries(aggregated);

      const popLookup = {};
      popData.forEach(d => {
        popLookup[d.Area_Name.trim()] = d.CENSUS_2020_POP;
      });

      // Convert sightings per person to sightings per million people
      const perMillion = {};
      Object.keys(aggregatedData).forEach(state => {
        if (popLookup[state]) {
          perMillion[state] = (aggregatedData[state] / popLookup[state]) * 1_000_000;
        } else {
          perMillion[state] = 0;
        }
      });

      const values = Object.values(perMillion);
      const min = d3.min(values) || 0;
      const max = d3.max(values) || 1;

      setMinRateLabel(min);
      setMaxRateLabel(max);

      const colorScale = d3.scaleLinear()
        .domain([min, max])
        .range(["#f7fbff", "#08306b"]);

      statesRef.current.transition().duration(750)
        .style("fill", d => {
          const stateName = d.properties.name;
          const rate = perMillion[stateName] || 0;
          return colorScale(rate);
        });

    }).catch(error => {
      console.error("Error loading or processing CSV data:", error);
    });
  }, [selectedVariable]);

  return (
    <div style={styles.box}>
      <svg ref={svgRef} />
      <div style={styles.legend}>
        <div style={styles.legendTitle}>Sightings per Million People</div>
        <div style={styles.legendGradient} />
        <div style={styles.legendLabels}>
          <span>{minRateLabel.toFixed(1)}</span>
          <span>{maxRateLabel.toFixed(1)}</span>
        </div>
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
    position: "relative"
  },
  legend: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    padding: '8px 12px',
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    fontSize: '12px',
    zIndex: 10,
    width: '200px',
  },
  legendTitle: {
    marginBottom: '4px',
    fontWeight: 'bold',
    fontSize: '13px',
    textAlign: 'center',
  },
  legendGradient: {
    width: '100%',
    height: '12px',
    background: 'linear-gradient(to right, #f7fbff, #08306b)',
    borderRadius: '2px',
  },
  legendLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '11px',
  },
  
};

export default React.memo(TrendsMap);
