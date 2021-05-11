window.addEventListener('load', () => {
    console.log('load');
    d3.csv('./top50.csv')
        .then(data => {
            const sortData = Object.entries(data.reduce((acc, cur) => {
                if (acc[cur.Genre]) {
                    acc[cur.Genre]++;
                } else {
                    acc[cur.Genre] = 1;
                }
                return acc;
            }, {})).sort((a, b) => b[1] - a[1]).map(item => ({name: item[0], value: item[1]}))
            console.log(sortData)
            const chart = renderPieChart(sortData.slice(0, 5));
            document.querySelector('#container').append(chart);
            const dendrogramData = {
                name: 'Genre',
                children: Object.entries(data.reduce((acc, cur) => {
                    if (acc[cur.Genre]) {
                        acc[cur.Genre].push(cur);
                    } else {
                        acc[cur.Genre] = [cur];

                    }
                    return acc;
                }, {})).map(item => ({ name: item[0], children: item[1].map(item1 => ({name: item1['Track.Name'], value: item1.Energy}))}))
            }
            console.log(dendrogramData);
            document.querySelector('#container1').append(renderDendrogram(dendrogramData));

        })
})

function renderPieChart(data) {
    const height = 500, width = 900;
    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    const radius = Math.min(width, height) / 2 * 0.8;
    const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

    var pie = d3.pie()
        .sort(null)
        .value(d => d.value)

    const arcs = pie(data);

    svg.append("g")
        .attr("stroke", "white")
        .selectAll("path")
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
        .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);


    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString()));
    svg.append("g")
        .attr('transform', 'translate(-350, -200)')
        .append('text')
        .text('Top5 Energy Pie Chart')
    return svg.node();

}

function renderDendrogram(data) {
    const width = 900;
    const radius = width / 2;
    const tree = d3.cluster().size([2 * Math.PI, radius - 100]);

    const root = tree(d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name)));

    const svg = d3.create("svg");

    const size = d3.scaleLinear()
        .domain([30, 88])
        .range([0, 20]);
    console.log(data.children.map(d => d.name))
    const color = d3.scaleOrdinal()
        .domain(data.children.map(d => d.name))
        .range(d3.schemeSet1.concat(d3.schemeSet2).concat(d3.schemeSet3));


    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y));
    svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `)
        .attr("fill", d => {
            console.log(d.parent, 'pppp');
            return d.children ? "#555" : color(d.parent.data.name)
        })
        .attr("r", d => {
            console.log(d, 'ccc')
            return d.children ? 2.5 : size(d.data.value)
        });

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .text(d => d.data.name.substr(0, 25))
        .clone(true).lower()
        .attr("stroke", "white")

    svg.append("g")
        .attr('transform', 'translate(-450, -400)')
        .append('text')
        .text('Circular Dendrogram with energy/genre')

    return svg.attr("viewBox", autoBox).node();
}

function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}