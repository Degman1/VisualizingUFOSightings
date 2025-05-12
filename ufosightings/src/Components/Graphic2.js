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


    const title = g.selectAll('text.title').data([null]).join('text')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .attr('x', W / 2)
      .attr('y', M.top - 10)
      .style('font-weight', 'bold')
      .style('font-size', '16px');

    /* tooltip (topmost) */
    const tooltip = g.selectAll('g.tooltip').data([null]).join(enter => {
      const t = enter.append('g').attr('class', 'tooltip').style('display', 'none');
      t.append('rect')
        .attr('fill', 'white')
        .attr('stroke', '#333')
        .attr('rx', 4).attr('ry', 4)
        .attr('width', T_WIDTH)
        .attr('height', T_HEIGHT)
        .attr('x', -T_WIDTH / 2)
        .attr('y', -T_HEIGHT - 10);
      t.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('y', -T_HEIGHT / 2 - 4);
      return t;
    });

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

      /* transition */
      const t = svg.transition().duration(750).ease(d3.easeLinear);

      /* axes */
      xAxisG.transition(t)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-35)')
        .attr('x', -5)
        .attr('y', 10)
        .style('font-size', '11px');

      yAxisG.transition(t)
        .call(d3.axisLeft(y).tickFormat(d3.format('.0%')))
        .selectAll('text')
        .style('font-size', '11px');

      /* bars */
      const bars = g.selectAll('rect.bar').data(top8, d => d.shape);

      bars.exit()
        .transition(t)
        .attr('y', y(0))
        .attr('height', 0)
        .style('opacity', 0)
        .remove();

      const barsEnter = bars.enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.shape))
        .attr('width', x.bandwidth())
        .attr('y', y(0))
        .attr('height', 0)
        .style('opacity', 0);

      barsEnter.merge(bars)
        .transition(t)
        .style('opacity', 1)
        .attr('x', d => x(d.shape))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.percent))
        .attr('height', d => y(0) - y(d.percent))
        .attr('fill', d => SHAPE_COLOR[d.shape] || SHAPE_COLOR.default);

      /* tooltip handlers */
      g.selectAll('rect.bar')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('stroke', '#333').attr('stroke-width', 1.5);
          tooltip.raise();
          tooltip.style('display', null)
            .select('text')
            .text(`${d.shape}: ${(d.percent * 100).toFixed(1)}% (${d.count})`);
        })
        .on('mousemove', function (event, d) {
          const [mx] = d3.pointer(event, svg.node());
          let tx = mx;
          if (tx < M.left + T_WIDTH / 2) tx = M.left + T_WIDTH / 2;
          if (tx > W - M.right - T_WIDTH / 2) tx = W - M.right - T_WIDTH / 2;
          const ty = y(d.percent) - 10;
          tooltip.attr('transform', `translate(${tx},${ty})`);
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', 'none');
          tooltip.style('display', 'none');
        });

      /* title */
      title.text(`Top 8 UFO Shapes in ${selectedState}`);
    })
      .catch(err => console.error('CSV error:', err));
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
