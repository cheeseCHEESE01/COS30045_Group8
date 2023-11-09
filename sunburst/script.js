function init(){
    // Fetch the CSV file
    d3.csv('data1.csv').then((csvData) => {
        //console.log(csvData);

        // Convert CSV data to hierarchical structure
        const data = convertCSVToHierarchy(csvData);

        // Define chart dimensions
        const width = 800;
        const height = 600;
        const radius = Math.min(width, height) / 2;

        // Define color scale for years
        const yearColor = d3.scaleOrdinal()
            .domain(['2017', '2018', '2019', '2020', '2021'])
            .range(['#E7B478', '#FF8C65', '#FFC1A0', '#E87D2D', '#E59866']);

        // Define color scale for age groups
        const ageColor = d3.scaleLinear()
            .domain([0, data.children[0].children.length - 1]) // Assuming the first year has all age groups
            .range(['#FCF3CF', '#4A235A']); // Gradient from light to dark

        // Create a partition layout
        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Create an arc generator
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        // Create a root node
        const root = d3.hierarchy(data)
            .sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);

        // Set up the SVG canvas
        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Draw the sunburst chart
        const g = svg.selectAll('g')
            .data(partition(root).descendants())
            .enter().append('g');

        g.append('path')
            .attr('d', arc)
            .style('fill', d => d.depth === 0 ? 'none' : d.depth === 1 ? yearColor(d.data.name) : ageColor(d.parent.children.indexOf(d)))
            .on('mouseover', handleMouseOver) // Add mouseover event listener
            .on('mouseout', handleMouseOut)   // Add mouseout event;
            //.append("title") // Add a title element for the tooltip
            //.text(d => `${d.data.name} (${d.value})`);
        
            /*
        g.append("title")
            .text(d => `${d.data.name} (${d.value})`);
        
        g.append("tooltip")
            .text(d => `${d.data.name} (${d.value})`);
        */

        // Add text labels for years only
        g.filter(d => d.depth === 1) // Filter to only apply to year elements
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.name);

    /*********************** mouse over & mouse out ***********************/

    let originalFillColor;
    function handleMouseOver(d) {

        // Define behavior when mouse hovers over a segment
        // For example, you can change the color or display additional information

        originalFillColor = d3.select(this).style('fill');

        // For example, you can change the fill color on hover
        d3.select(this)
            .style('fill', '#641E16');

        d3.select(this.parentNode) // Select the parent node (the <g> element)
            .select('text') // Select the text element inside the <g>
            .style('fill', 'white'); // Set the fill color to white
        
        g.append("title")
            .style('opacity', 1)
            .text(d => `${d.data.name} (${d.value})`);

            let year, ageGroup, value;

            if (d.depth === 2) {
                year = d.parent.data.name;
                ageGroup = d.data.name;
                value = d.value;
            } else if (d.depth === 1) {
                year = d.data.name;
                value = d.value;
            }
        
            // Now you have access to year, ageGroup, and value based on the depth of the element
            csvData.forEach((row) => {
                const year = row.Year; // Access the 'Year' column
                const ageGroup = row.Age_Group; // Access the 'Age_Group' column
                const value = +row.Value; // Access the 'Value' column (parsed as a number)
        
                // Now you have access to 'year', 'ageGroup', and 'value' for each row in the CSV data
                console.log(`Year: ${year}, Age Group: ${ageGroup}, Value: ${value}`);
    
                d3.select('#tooltip')
                .style('opacity', 1)
                .select('#info')
                .text(`Year: ${year}, Age Group: ${ageGroup}, Value: ${value}`);
            })
        
    }
    

    function handleMouseOut() {
        d3.select(this)
            .style('fill', originalFillColor);

        d3.select(this.parentNode) // Select the parent node (the <g> element)
            .select('text') // Select the text element inside the <g>
            .style('fill', 'black'); // Set the fill color to white

        d3.select('#tooltip')
            .style('opacity', 0);
    }

    /*********************************************************************/

    });

    function convertCSVToHierarchy(csvData) {
        // Get unique years from the CSV data
        const years = [...new Set(csvData.map(row => row.Year))];
        
        // Create a hierarchical data structure with a root node and children array
        const hierarchyData = {
            name: 'Root',
            children: years.map(year => {
                // Filter data for the current year
                const yearData = csvData.filter(row => row.Year === year);
    
                // Map data to create children nodes with 'name' as 'Age_Group' and 'value' as 'Value'
                const children = yearData.map(row => ({
                    name: row['Age_Group'],
                    value: +row.Value
                }));
    
                // Log information about the current year and its children
                console.log(`Year: ${year}`, children);
    
                // Return an object with the year as 'name' and the children nodes
                return {
                    name: year,
                    children: children
                };
            })
        };
    
        // Log the hierarchical data structure
        console.log('Hierarchy Data:', hierarchyData);
    
        // Return the hierarchical data
        return hierarchyData;
    }
    
    

    
}

window.onload = init;
