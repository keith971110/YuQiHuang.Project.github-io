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
    const height = 800;
    const width = 900;
    const svg = d3.create("svg").attr('width', width).attr('height', height)
        // .attr("viewBox", [0, 0, width, height]);

    const margin = ({top: 20, right: 250, bottom: 30, left: 30});
    const x = d3.scaleLinear()
        .domain([0, d3.max(data.map(item => +item[type]))]).nice()
        .range([margin.left, width - margin.right])
    const y = d3.scaleBand()
        .domain(data.map(item => item['Track.Name']))
        .range([height - margin.bottom, margin.top])
        .padding(0.1);

    const z = d3.scaleOrdinal(d3.schemeSet1.concat(d3.schemeSet3).concat(d3.schemeSet2))
        .domain(Genre.map(item => item[0]))

    //
    svg.append("g")
        .selectAll("rect")
        .append('rect')
        .data(data)
        .join("rect")
        .attr("fill", d => z(d.Genre))

        .attr("y", (d, i) => {
            return y(d['Track.Name'])
        })
        .attr("x", () => x(0))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d[type]))


    const yAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80 ).tickSizeOuter(0))
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.x));

    const xAxis = g => g
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
        .style("text-anchor", "start")
        .attr("dx", "1em")
        // .attr("dy", "-0.5em")
    // .style('transform', 'rotate(90deg)')

    svg.append("g")
        .call(yAxis);

    const legend = svg
        .selectAll('.legend')
        .data(z.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            return `translate(${width - margin.right + 20},${100 + (i) * 15})`;
        });

    legend.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .style('fill', d => z(d))
        .style('stroke', d => z(d));

    legend.append('text')
        .attr('x', 18 + 4)
        .attr('y', 18 - 4)
        .text(function(d) { return d; });

    svg.append("g")
        .attr('transform', `translate(${width / 2 - margin.left}, ${margin.top})`)
        .append('text')
        .text(`${type} histogram charts `)

    return svg.node();
}