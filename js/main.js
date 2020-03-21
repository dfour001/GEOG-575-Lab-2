// begin script when window loads
window.onload = setMap();


// Set up choropleth map
function setMap() {
    // Use queue to parrallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, 'data/ClassesByState.csv')
        .defer(d3.json, 'data/states.topojson')
        .await(callback);

    function callback(error, csvData, states) {
        // Use topojson to translate topojson to geojson
        let lyrStates = topojson.feature(states, states.objects.states);
        
        console.log(states, lyrStates);
    }

}


