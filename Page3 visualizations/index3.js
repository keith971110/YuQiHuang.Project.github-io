window.addEventListener('load', async () => {
    const data = await d3.csv('./top50.csv');
    const Genre = Object.entries(data.reduce((acc, cur) => {
        acc[cur.Genre] = 1;
        return acc;
    }, {})).map(item => item[0]);
    const Song = Object.entries(data.reduce((acc, cur) => {
        acc[cur['Track.Name']] = 1;
        return acc;
    }, {})).map(item => item[0]);
    document.querySelector('#container').append(renderHeatmap(data, Genre, Song));
})

function renderHeatmap(data, Genre, Song) {
    const width = 1500;
    const height = 600;
    const margin = {
        top: 30,
        right: 30,
        bottom: 40,
        left: 140,
    };

    const svg = d3.create('svg')
        .attr("viewBox", [-margin.left, -margin.top, width + margin.left + margin.right, height + margin.bottom + margin.top])
        .attr('width', width).attr('height', height);
    console.log([d3.min(data.map(d => d.Popularity)), d3.max(data.map(d => d.Popularity))])
    const color = d3.scaleLinear()
        .domain([d3.min(data.map(d => d.Popularity)), d3.max(data.map(d => d.Popularity))])
        .range(d3.schemeBlues[3]);

    svg
        .append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d, index) => (index % 10) * 150)
        .attr('y', (d, index) => Math.floor(index / 10) * 100)
        .attr("width", 150)
        .attr("height", 100)
        .style('fill', d => {
            return color(d.Popularity)
        });

    svg.append('g')
        .selectAll('text')
        .data(data)
        .join('text')

        .attr('transform', (d, index) => `translate(${(index % 10) * 150}, ${Math.floor(index / 10) * 100})`)
        .attr('y', '1em')
        .text(d => `Genre: ${d.Genre.substr(0, 8)}`)
        .append('title')
        .text(d => `Genre: ${d.Genre}`);

    svg.append('g')
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('transform', (d, index) => `translate(${(index % 10) * 150}, ${Math.floor(index / 10) * 100})`)
        .attr('y', '2.5em')
        .text(d => `Song: ${d['Track.Name'].substr(0, 8)}`)
        .append('title')
        .text(d => `Song: ${d['Track.Name']}`)

    svg.append('g')
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('transform', (d, index) => `translate(${(index % 10) * 150}, ${Math.floor(index / 10) * 100})`)
        .attr('y', '4em')
        .text(d => `Popularity: ${d.Popularity}`);

    svg.append("g")
        .attr('transform', `translate(${width / 2}, -${margin.top / 2})`)
        .append('text')
        .text(`popularity of the songs `)

    return svg.node();
}