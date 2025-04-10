import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graphic2 = ({ selectedState }) => {
  const svgRef = useRef();

  useEffect(() => {
    d3.select(svgRef.current).selectAll('*').remove();
    if (!selectedState) return;

    const width = 400;
    const height = 350;
    const margin = { top: 40, right: 20, bottom: 60, left: 50 };

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    d3.csv('/cleaned/cleaned_ufo.csv', d => ({
      state_full: d.state_full,
      shape: d.shape
    }))
      .then(data => {
        const filtered = data.filter(d => d.state_full === selectedState && d.shape);

        const counts = d3.rollups(
          filtered,
          v => v.length,
          d => d.shape.toLowerCase()
        );

        const top8 = counts
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);

        const x = d3
          .scaleBand()
          .domain(top8.map(d => d[0]))
          .range([margin.left, width - margin.right])
          .padding(0.2);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(top8, d => d[1])])
          .nice()
          .range([height - margin.bottom, margin.top]);

        svg
          .append('g')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x))
          .selectAll('text')
          .attr('text-anchor', 'end')
          .attr('transform', 'rotate(-35)')
          .attr('x', -5)
          .attr('y', 10)
          .style('font-size', '11px');

        svg
          .append('g')
          .attr('transform', `translate(${margin.left}, 0)`)
          .call(d3.axisLeft(y))
          .selectAll('text')
          .style('font-size', '11px');

        svg
          .selectAll('rect')
          .data(top8)
          .join('rect')
          .attr('x', d => x(d[0]))
          .attr('y', d => y(d[1]))
          .attr('width', x.bandwidth())
          .attr('height', d => y(0) - y(d[1]))
          .attr('fill', '#72ba72');

        svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', margin.top - 10)
          .attr('text-anchor', 'middle')
          .style('font-weight', 'bold')
          .style('font-size', '16px')
          .text(`Top 8 UFO Shapes in ${selectedState}`);
      })
      .catch(error => {
        console.error('Error loading or processing CSV data:', error);
      });
  }, [selectedState]);

  return (
    <div style={styles.box}>
      {!selectedState && (
        <p style={styles.placeholder}>Select a state to view it's UFO shape distribution.</p>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

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
