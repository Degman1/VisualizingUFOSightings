import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graphic1 = ({ selectedState }) => {
  const svgRef = useRef();

  useEffect(() => {
    /* clear SVG when no state selected */
    if (!selectedState) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    /* ------------ dims ------------ */
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    /* tooltip box size (smaller now) */
    const BOX_W = 80;
    const BOX_H = 24;

    /* ------------ scaffold ------------ */
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [
        0,
        0,
        width + margin.left + margin.right,
        height + margin.top + margin.bottom,
      ]);

    const g = svg
      .selectAll('g.chart')
      .data([null])
      .join('g')
      .attr('class', 'chart')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const path = g
      .selectAll('path.line-path')
      .data([[]])
      .join('path')
      .attr('class', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', '#3182bd')
      .attr('stroke-width', 2);

    const xAxisG = g
      .selectAll('g.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);

    const yAxisG = g
      .selectAll('g.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis');

    /* x-axis label */
    xAxisG.selectAll('text.label').data([null]).join('text')
      .attr('class', 'label')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 5)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Year');

    /* y-axis label */
    yAxisG.selectAll('text.label').data([null]).join('text')
      .attr('class', 'label')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 17)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '12px')
      .text('UFO Sightings');


    const tooltip = g
      .selectAll('g.tooltip')
      .data([null])
      .join((enter) => {
        const t = enter
          .append('g')
          .attr('class', 'tooltip')
          .style('display', 'none');

        t.append('circle').attr('r', 4).attr('fill', '#3182bd');

        t.append('rect')
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('width', BOX_W)
          .attr('height', BOX_H)
          .attr('x', 8)
          .attr('y', -BOX_H - 6);

        t.append('text')
          .attr('font-size', 11)
          .attr('fill', 'black')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')            // vertical centering
          .attr('y', -BOX_H / 2 - 6);

        return t;
      });

    const overlay = g
      .selectAll('rect.overlay')
      .data([null])
      .join('rect')
      .attr('class', 'overlay')
      .attr('fill', 'transparent')
      .attr('width', width)
      .attr('height', height);

    /* ------------ data load ------------ */
    d3.csv(`${process.env.PUBLIC_URL}/cleaned/cleaned_ufo.csv`, (d) => ({
      state_full: d.state_full,
      datetime: d.datetime,
    })).then((raw) => {
      const countsMap = d3.rollup(
        raw
          .filter((d) => d.state_full === selectedState && d.datetime)
          .map((d) => ({
            year: +d.datetime.split(' ')[0].split('/')[2],
          }))
          .filter((d) => !isNaN(d.year) && d.year >= 1940 && d.year <= 2013),
        (v) => v.length,
        (d) => d.year
      );

      const counts = d3.range(1940, 2014).map((year) => ({
        year,
        count: countsMap.get(year) ?? 0,
      }));

      /* scales */
      const x = d3.scaleLinear().domain([1940, 2013]).range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(counts, (d) => d.count)])
        .nice()
        .range([height, 0]);

      const line = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.count));

      const t = svg.transition().duration(750).ease(d3.easeLinear);

      path.datum(counts).transition(t).attr('d', line);
      xAxisG.transition(t).call(d3.axisBottom(x).tickFormat(d3.format('d')));
      yAxisG.transition(t).call(d3.axisLeft(y));

      /* ------------ overlay interactions ------------ */
      overlay
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', function (event) {
          const [mx] = d3.pointer(event, this);
          const yr = Math.round(x.invert(mx));
          const closest = counts[yr - 1940];

          const cx = x(closest.year);
          const cy = y(closest.count);
          tooltip.attr('transform', `translate(${cx},${cy})`);

          /* flip tooltip if near right edge */
          const dir = cx > width - BOX_W ? -1 : 1;
          tooltip
            .select('rect')
            .attr('x', dir === 1 ? 8 : -BOX_W - 8);

          const txtX = dir === 1 ? 8 + BOX_W / 2 : -8 - BOX_W / 2;
          tooltip
            .select('text')
            .attr('x', txtX)
            .text(`${closest.year}: ${closest.count}`);
        });
    });
  }, [selectedState]);

  return (
    <div style={styles.box}>
      <h2 style={styles.title}>
        Sightings Over Time: {selectedState || ''}
      </h2>
      {!selectedState && (
        <p style={styles.placeholder}>
          Select a state to view sightings over time.
        </p>
      )}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

/* styles */
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
  },
};

export default Graphic1;
