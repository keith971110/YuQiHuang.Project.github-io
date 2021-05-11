window.addEventListener('load', async () => {
    const data = await d3.csv('./top50.csv');
    const Genre = Object.entries(data.reduce((acc, cur) => {
        acc[cur.Genre] = 1;
        return acc;
    }, {}));
    document.querySelector('#svg').append(renderHistograms(data, 'Energy', Genre));

    document.querySelector('#type').addEventListener('change', evt => {
        document.querySelector('#svg').removeChild(document.querySelector('svg'));
        document.querySelector('#svg').append(renderHistograms(data, evt.target.value, Genre));

    })
});


function renderHistograms(data, type, Genre) {
    const height = 500;
    const width = 900;
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    const margin = ({top: 20, right: 140, bottom: 30, left: 30});

    const y = d3.scaleLinear()
        .domain([0, d3.max(data.map(item => item[type]))]).nice()
        .range([height - margin.bottom, margin.top])
    const x = d3.scaleBand()
        .domain(data.map(item => item['Track.Name']))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const z = d3.scaleOrdinal(d3.schemeSet1.concat(d3.schemeSet3).concat(d3.schemeSet2))
        .domain(Genre.map(item => item[0]))


    svg.append("g")
        .selectAll("rect")
        .append('rect')
        .data(data)
        .join("rect")
            .attr("fill", d => z(d.Genre))

            .attr("x", (d, i) => {
            return x(d['Track.Name'])
        })
        .attr("y", d => y(d[type]))
        .attr("height", d => y(0) - y(d[type]))
        .attr("width", x.bandwidth())


    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80 ).tickSizeOuter(0))
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.x));

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y));

    svg.append("g")
        .call(xAxis)
        .selectAll('text')
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-0.5em")
    .style('transform', 'rotate(90deg)')

    svg.append("g")
        .call(yAxis);

    const legend = svg
        .selectAll('.legend')
        .data(z.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            return `translate(${width - margin.right},${0 + (i) * 30})`;
        });

    legend.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => z(d))
        .style('stroke', d => z(d));

    legend.append('text')
        .attr('x', 18 + 4)
        .attr('y', 18 - 4)
        .text(function(d) { return d; });

    svg.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .append('text')
        .text(`${type} histogram charts `)

    return svg.node();
}