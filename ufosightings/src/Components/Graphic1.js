import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graphic1 = ({ selectedState }) => {
  const svgRef = useRef();

  useEffect(() => {
    d3.select(svgRef.current).selectAll('*').remove();
    if (!selectedState) return;

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('/cleaned/cleaned_ufo.csv', d => ({
      state_full: d.state_full,
      datetime: d.datetime
    })).then(data => {
      const yearCounts = d3.rollups(
        data
          .filter(d => d.state_full === selectedState && d.datetime)
          .map(d => {
            const parts = d.datetime.split(' ');
            const date = parts[0];
            const year = +date.split('/')[2];
            return { year };
          })
          .filter(d => !isNaN(d.year) && d.year >= 1940 && d.year <= 2013),
        v => v.length,
        d => d.year
      );

      const counts = yearCounts
        .map(([year, count]) => ({ year: +year, count }))
        .sort((a, b) => a.year - b.year);

      const x = d3.scaleLinear()
        .domain(d3.extent(counts, d => d.year))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(counts, d => d.count)])
        .nice()
        .range([height, 0]);

      const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count));

      svg.append('path')
        .datum(counts)
        .attr('fill', 'none')
        .attr('stroke', '#3182bd')
        .attr('stroke-width', 2)
        .attr('d', line);

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      svg.append('g')
        .call(d3.axisLeft(y));

      const tooltip = svg.append('g')
        .style('display', 'none');

      tooltip.append('circle')
        .attr('r', 4)
        .attr('fill', '#3182bd');

      tooltip.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#333')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('width', 100)
        .attr('height', 36)
        .attr('x', 8)
        .attr('y', -30);

      const tooltipText = tooltip.append('text')
        .attr('x', 12)
        .attr('y', -12)
        .attr('font-size', 11)
        .attr('fill', 'black');

      svg.append('rect')
        .attr('fill', 'transparent')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', function (event) {
          const [mx] = d3.pointer(event, this);
          const year = Math.round(x.invert(mx));
          const closest = counts.reduce((a, b) =>
            Math.abs(b.year - year) < Math.abs(a.year - year) ? b : a
          );

          const cx = x(closest.year);
          const cy = y(closest.count);
          tooltip.attr('transform', `translate(${cx},${cy})`);

          const tooltipWidth = 100;
          const direction = cx > width - tooltipWidth ? -1 : 1;
          tooltip.select('rect').attr('x', direction === 1 ? 8 : -tooltipWidth - 8);
          tooltip.select('text').attr('x', direction === 1 ? 12 : -tooltipWidth + 4);

          tooltipText.text(`${closest.year}: ${closest.count}`);
        });
    });
  }, [selectedState]);

  return (
    <div style={styles.box}>
      <h2 style={styles.title}>Sightings Over Time: {selectedState || ''}</h2>
      {!selectedState && (
        <p style={styles.placeholder}>Select a state to view sightings over time.</p>
      )}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
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
    overflow: 'hidden',
    position: 'relative',
  },
  title: {
    fontSize: '1.1rem',
    margin: '8px 0 4px',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: '0.95rem',
  }
};

export default Graphic1;
