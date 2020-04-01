(function () {
    var attrArray = ['AllClasses', 'BodyAttack', 'BodyCombat', 'BodyPump', 'BodyStep', 'Sprint']; // List of attributes
    var expressed = attrArray[0]; // Initial attribute

    // Chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 460,
        leftPadding = 28,
        rightPadding = 2,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        topBottomPadding = 5,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = 'translate(' + leftPadding + ',' + topBottomPadding + ')';



    // Create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 500]);

    var yAxisScale = d3.scaleLinear()
        .range([chartInnerHeight, 0])
        .domain([0, 500]);


    // Begin script when window loads
    window.onload = setMap();


    // Set up choropleth map
    function setMap() {
        // Map frame dimensions
        let width = window.innerWidth * 0.5,
            height = 460;

        // Create new svg container for the map
        let map = d3.select('body')
            .append('svg')
            .attr('class', 'map')
            .attr('width', width)
            .attr('height', height);

        // Create Albers equal area conic projection centered on United States
        let projection = d3.geoAlbers()
            .center([0, 33.6])
            .rotate([99, 0, 0])
            .parallels([43, 62])
            .scale(705)
            .translate([width / 2, height / 2]);

        let path = d3.geoPath()
            .projection(projection);

        // Use queue to parrallelize asynchronous data loading
        d3.queue()
            .defer(d3.csv, 'data/ClassesByState.csv')
            .defer(d3.json, 'data/states.topojson')
            .await(callback);

        function callback(error, csvData, states) {
            // Set up graticule
            add_graticule(map, path);


            // Use topojson to translate topojson to geojson
            let dataStates = topojson.feature(states, states.objects.states).features;

            // Join topojson with csv data
            dataStates = join_data(dataStates, csvData)


            let colorScale = make_color_scale(csvData);

            let lyrStates = map.selectAll('.states')
                .data(dataStates)
                .enter()
                .append('path')
                .attr('class', function (d) {
                    return 'states ' + d.properties.postal;
                })
                .attr('d', path)
                .style('fill', function (d) {
                    return colorScale(d.properties[expressed])
                });

            // Add coordinated visualization to the map
            setChart(csvData, colorScale);

            createDropdown(csvData);
        }


        function add_graticule(map, path) {
            // Create graticule generator
            let graticule = d3.geoGraticule()
                .step([10, 10]); // Place graticule lines every 5* of lat/lng

            // Create graticule lines
            let gatLines = map.selectAll('.gratLines') // Select graticule elements that will be created
                .data(graticule.lines()) // Bind graticule lines to each element to be created
                .enter() // Create an element for each datum
                .append('path') // Append each element to the svg as a path element
                .attr('class', 'gratLines')
                .attr('d', path) // Project graticule lines
        }


        function join_data(dataStates, csvData) {
            // Join dataStates and csvData by postal code

            // Loop through csv to assign each set of csv ttribute values to geojson state
            for (let i = 0; i < csvData.length; i++) {
                let csvState = csvData[i]; // The curent state
                let csvKey = csvState.State; // The CSV primary key

                // Loop through geoson states to find correct state
                for (let a = 0; a < dataStates.length; a++) {
                    let geojsonProps = dataStates[a].properties; // The current state geojson properties
                    let geojsonKey = geojsonProps.postal; // The geojson primary key

                    // Assign all attributes and values
                    if (geojsonKey == csvKey) {
                        attrArray.forEach(function (attr) {
                            let val = parseFloat(csvState[attr]); // Get csv attribute value
                            geojsonProps[attr] = val; // Assign attribute and value to geojson properties
                        });
                    };
                };
            };

            return dataStates
        }


    }

    function make_color_scale(data) {
        let colorClasses = [
                "#D4B9DA",
                "#C994C7",
                "#DF65B0",
                "#DD1C77",
                "#980043"
            ];

        // Create color scale generator
        let colorScale = d3.scaleQuantile()
            .range(colorClasses);

        // Build array of all values of the expressed attribute
        let domainArray = [];
        for (let i = 0; i < data.length; i++) {
            let val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        }

        // Assign array of epxressed values as scale domain
        colorScale.domain(domainArray);

        return colorScale
    }

    function setChart(csvData, colorScale) {
        // Create a second svg element to hold the bar chart
        var chart = d3.select('body')
            .append('svg')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('class', 'chart');

        // Set bars for each state
        var bars = chart.selectAll('.bars')
            .data(csvData)
            .enter()
            .append('rect')
            .sort(function (a, b) {
                return b[expressed] - a[expressed]
            })
            .attr('class', function (d) {
                return 'bars ' + d.postal;
            })
            .attr('width', chartInnerWidth / csvData.length - 1)
            .attr('x', function (d, i) {
                return i * (chartInnerWidth / csvData.length);
            })
            .attr('height', function (d) {
                return yScale(parseFloat(d[expressed]));
            })
            .attr('y', function (d) {
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            .style('fill', function (d) {
                return colorScale(d[expressed])
            })
            .attr('transform', translate);

        //create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yAxisScale)

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        // Chart title
        var chartTitle = chart.append('text')
            .attr('x', 20)
            .attr('y', 40)
            .attr('class', 'chartTitle')
            .text('Number of Variable ' + expressed + ' in each state');
    }

    function createDropdown(csvData) {
        let dropdown = d3.select('body')
            .append('select')
            .attr('class', 'dropdown')
            .on('change', function () {
                changeAttribute(this.value, csvData)
            });

        //add initial option
        let titleOption = dropdown.append('option')
            .attr('class', 'titleOption')
            .attr('disabled', 'true')
            .text('Select Attribute');

        // Add attribute name options
        let attrOptions = dropdown.selectAll('attrOptions')
            .data(attrArray)
            .enter()
            .append('option')
            .attr('value', function (d) {
                return d
            })
            .text(function (d) {
                return d
            });
    }

    // Called when new attribute is selected
    function changeAttribute(attribute, csvData) {
        expressed = attribute;

        var colorScale = make_color_scale(csvData)

        var states = d3.selectAll('.states')
            .transition()
            .duration(500)
            .style('fill', function (d) {
                return colorScale(d.properties[expressed])
            });

        // Re-sort, resize, and recolor bars
        var bars = d3.selectAll('.bars')
            //re-sort bars
            .sort(function (a, b) {
                return b[expressed] - a[expressed];
            })
            .transition()
            .attr('x', function (d, i) {
                return i * (chartInnerWidth / csvData.length);
            })
            .attr('height', function (d) {
                return yScale(parseFloat(d[expressed]));
            })
            .attr('y', function (d) {
                return chartHeight - yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            .style('fill', function (d) {
                return colorScale(d[expressed])
            });
        
        // Update chart title        
        var chartTitle = d3.select('.chartTitle')
            .text('Number of Variable ' + expressed + ' in each state');
        
        console.log(expressed);
    }
})();
