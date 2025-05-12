import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graphic2 = ({ selectedState }) => {
  const svgRef = useRef();

  /* muted / desaturated palette */
  const SHAPE_COLOR = {
    light: '#d9d66b',
    circle: '#7da6d8',
    triangle: '#c4879a',
    sphere: '#8fbc8f',
    disk: '#b59dc9',
    fireball: '#d59a73',
    cigar: '#a78c7b',
    formation: '#7fbfc4',
    default: '#b0b0b0'
  };

  useEffect(() => {
    /* wipe SVG if nothing selected */
    if (!selectedState) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    /* dims */
    const W = 400;
    const H = 350;
    const M = { top: 40, right: 20, bottom: 60, left: 50 };
    const T_WIDTH = 140;
    const T_HEIGHT = 40;

    /* scaffold */
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%');

    const g = svg.selectAll('g.chart').data([null]).join('g').attr('class', 'chart');

    const xAxisG = g.selectAll('g.x-axis').data([null]).join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${H - M.bottom})`);

    /* x-axis label (static) */
    svg.selectAll('text.x-label').data([null]).join('text')
      .attr('class', 'x-label')
      .attr('x', W / 2)  // Centered horizontally
      .attr('y', H - 10)  // Positioned just below the x-axis
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('UFO Shape');

    const yAxisG = g.selectAll('g.y-axis').data([null]).join('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${M.left},0)`);

    /* y-axis label */
    yAxisG.selectAll('text.label').data([null]).join('text')
      .attr('class', 'label')
      .attr('x', -H / 2)
      .attr('y', -M.left + 12)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '12px')
      .text('Percentage of total sightings');

    /* data load */
    d3.csv(`${process.env.PUBLIC_URL}/cleaned/cleaned_ufo.csv`, d => ({
      state_full: d.state_full,
      shape: d.shape
    })).then(raw => {
      /* counts per shape */
      const countsArr = d3.rollups(
        raw.filter(r => r.state_full === selectedState && r.shape),
        v => v.length,
        r => r.shape.toLowerCase()
      );

      const total = d3.sum(countsArr, d => d[1]);

      const top8 = countsArr
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([shape, count]) => ({
          shape,
          count,
          percent: count / total
        }));

      /* scales */
      const x = d3.scaleBand()
        .domain(top8.map(d => d.shape))
        .range([M.left, W - M.right])
        .padding(0.2);

      const maxPerc = d3.max(top8, d => d.percent);
      const y = d3.scaleLinear()
        .domain([0, maxPerc * 1.1]).nice()
        .range([H - M.bottom, M.top]);

      /* axes */
      xAxisG.call(d3.axisBottom(x).tickSize(0));
      yAxisG.call(d3.axisLeft(y).tickFormat(d3.format('.0%')));

      /* bars */
      const bars = g.selectAll('rect.bar').data(top8, d => d.shape);

      bars.exit().remove();

      bars.enter().append('rect')
        .attr('class', 'bar')
        .merge(bars)
        .attr('x', d => x(d.shape))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.percent))
        .attr('height', d => y(0) - y(d.percent))
        .attr('fill', d => SHAPE_COLOR[d.shape] || SHAPE_COLOR.default);
    });
  }, [selectedState]);

  return (
    <div style={styles.box}>
      {!selectedState && (
        <p style={styles.placeholder}>
          Select a state to view its UFO shape distribution.
        </p>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

/* simple styles */
const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    textAlign: 'center',
    flex: 1,
    padding: '10px',
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: '0.95rem',
  },
};

export default Graphic2;
