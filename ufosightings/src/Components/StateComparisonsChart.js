import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const StateComparisonsChart = ({ statesList }) => {
  const svgRef = useRef();
  const [selectedVariable, setSelectedVariable] = useState("Bachelor's degree or higher, 2019-23");
  const [educationColumns, setEducationColumns] = useState([]);
  const [scatterData, setScatterData] = useState([]);

  const permittedColumns = {
    "Percent of adults with a bachelor's degree or higher, 2019-23": "Percent of Adults With Bachelor's Degree or Higher",
    "Percent of adults completing some college or associate degree, 2019-23": "Percent of Adults Completing Some College or Associate Degree",
    "Percent of adults who are high school graduates (or equivalent), 2019-23": "Percent of Adults Who Are High School Graduates or Equivalent",
    "Percent of adults who are not high school graduates, 2019-23": "Percent of Adults With No High School Diploma",
    "PCTPOVALL_2023": "Poverty Rate (All Ages) 2023",
    "Unemployment_rate_2023": "Unemployment Rate 2023",
    "Median_Household_Income_2022": "Median Household Income",
    "R_DEATH_2023": "Deaths per 1,000 People",
  };

  useEffect(() => {
    Promise.all([
      d3.csv('/cleaned/cleaned_education.csv'),
      d3.csv('/cleaned/cleaned_poverty.csv'),
      d3.csv('/cleaned/cleaned_unemployed.csv'),
      d3.csv('/cleaned/cleaned_population.csv')
    ]).then(([eduData, povData, unemData, popData]) => {
      const eduCols  = Object.keys(eduData[0]).filter(c => c !== 'Area_Name');
      const povCols  = Object.keys(povData[0]).filter(c => c !== 'Area_Name');
      const unemCols = Object.keys(unemData[0]).filter(c => c !== 'Area_Name');
      const popCols  = Object.keys(popData[0]).filter(c => c !== 'Area_Name');
      const allCols  = [...new Set([...eduCols, ...povCols, ...unemCols, ...popCols])];
      const filtered = allCols.filter(col => permittedColumns[col]);
      setEducationColumns(filtered);
    });
  }, []);

  useEffect(() => {
    if (!statesList.length) return;

    Promise.all([
      d3.csv('/cleaned/cleaned_ufo.csv',        d => ({ state_full: d.state_full.trim() })),
      d3.csv('/cleaned/cleaned_population.csv'),
      d3.csv('/cleaned/cleaned_education.csv'),
      d3.csv('/cleaned/cleaned_poverty.csv'),
      d3.csv('/cleaned/cleaned_unemployed.csv')
    ]).then(([ufoData, popData, eduData, povData, unemData]) => {
      const agg = d3.rollup(ufoData, v => v.length, d => d.state_full);
      const aggregatedData = Object.fromEntries(agg);

      const popLookup = {};
      popData.forEach(d => {
        const name = d.Area_Name.trim();
        popLookup[name] = +d.CENSUS_2020_POP;
      });

      const perMillion = {};
      Object.keys(aggregatedData).forEach(state => {
        perMillion[state] = popLookup[state]
          ? (aggregatedData[state] / popLookup[state]) * 1e6
          : 0;
      });

      const map = new Map();
      eduData.forEach(d  => map.set(d.Area_Name.trim(), { ...d }));
      povData.forEach(d  => {
        const n = d.Area_Name.trim();
        map.set(n, { ...map.get(n), ...d });
      });
      unemData.forEach(d => {
        const n = d.Area_Name.trim();
        map.set(n, { ...map.get(n), ...d });
      });
      popData.forEach(d => {
        const n = d.Area_Name.trim();
        map.set(n, { ...map.get(n), ...d });
      });

      const combined = Array.from(map.values());

      const scatter = statesList.map(state => {
        const row = combined.find(d => d.Area_Name.trim() === state) || {};
        let x = 0;
        if (row[selectedVariable] != null) {
          const cleaned = String(row[selectedVariable]).replace(/,/g, '').trim();
          const parsed = parseFloat(cleaned);
          x = isNaN(parsed) ? 0 : parsed;
        }
        return {
          state,
          ufoSightingsPerMillion: perMillion[state] || 0,
          educationValue: x
        };
      });

      setScatterData(scatter);
    });
  }, [statesList, selectedVariable]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = 800, height = 500;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%');

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(scatterData, d => d.educationValue) || 1])
      .range([70, width - 50]);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(scatterData, d => d.ufoSightingsPerMillion) || 1])
      .range([height - 60, 50]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', 40)
      .attr('dy', '-1em')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('UFO Sightings per Million People');

    svg.append('g')
      .attr('transform', `translate(0, ${height - 60})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(70, 0)`)
      .call(yAxis);

    svg.append('foreignObject')
      .attr('x', width / 2 - 250)
      .attr('y', height - 30)
      .attr('width', 500)
      .attr('height', 30)
      .append('xhtml:div')
      .html(() => `
        <select style="width:100%;padding:5px;font-size:14px;min-width:500px">
          ${educationColumns.map(col => `
            <option value="${col}" ${col === selectedVariable ? 'selected' : ''}>
              ${permittedColumns[col]}
            </option>
          `).join('')}
        </select>
      `)
      .on('change', function() {
        setSelectedVariable(this.querySelector('select').value);
      });

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // draw circles
    svg.selectAll('circle')
      .data(scatterData)
      .enter().append('circle')
      .attr('cx', d => xScale(d.educationValue))
      .attr('cy', d => yScale(d.ufoSightingsPerMillion))
      .attr('r', 6)
      .attr('fill', d => colorScale(d.state))
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        // enlarge and raise dot
        d3.select(this).raise().attr('r', 8);

        // clear previous bg
        svg.selectAll('rect.label-bg').remove();

        // raise text label first
        const textSel = svg.selectAll('text.label')
          .filter(t => t.state === d.state)
          .raise();

        // compute bbox
        const bbox = textSel.node().getBBox();

        // append bg rect at correct z-order, then raise text
        svg.append('rect')
          .attr('class', 'label-bg')
          .attr('x', bbox.x - 3)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 6)
          .attr('height', bbox.height + 6)
          .attr('fill', 'white')
          .attr('stroke', '#72ba72')    
          .attr('stroke-width', 1)     
          .raise();

        // finally raise text above that bg
        textSel.raise();
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('r', 6);
        svg.selectAll('rect.label-bg').remove();
      });

    // draw text labels
    svg.selectAll('text.label')
      .data(scatterData)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.educationValue) + 8)
      .attr('y', d => yScale(d.ufoSightingsPerMillion) - 8)
      .text(d => d.state)
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .attr('fill', '#333');

  }, [scatterData, selectedVariable, educationColumns]);

  return (
    <div style={styles.box}>
      <svg ref={svgRef} />
    </div>
  );
};

const styles = {
  box: {
    backgroundColor: '#f0fdf4',
    border: '5px solid #72ba72',
    borderRadius: '12px',
    padding: '16px',
    flex: 25,
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    margin: '10px',
  }
};

export default React.memo(StateComparisonsChart);
