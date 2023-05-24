// Create the SVG container
const svg = d3.select("#map")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")

// Create a group to contain the map elements
const mapGroup = svg.append("g");

// Create a zoom behavior
const zoom = d3.zoom()
  .scaleExtent([1, 16]) // Adjust the scale extent for more zooming
  .on("zoom", zoomed);

// Attach the zoom behavior to the SVG container
svg.call(zoom);

// Create a drag behavior
const drag = d3.drag()
  .on("start", dragStarted)
  .on("drag", dragged)
  .on("end", dragEnded);

// Attach the drag behavior to the map group
mapGroup.call(drag);

// Variables to store the current transform and scale
let currentTransform = d3.zoomIdentity;
let currentScale = 1;

// Function to handle zooming
// Function to handle zooming
function zoomed(event) {
    currentTransform = event.transform;
    currentScale = event.transform.k;
  
    // Adjust the radius of the circles based on the current scale
    const radius = 5 / currentScale;
  
    mapGroup.attr("transform", currentTransform);
    mapGroup.selectAll("circle")
      .attr("r", radius);
  }

// Function to handle drag start
function dragStarted(event) {
  // Prevent zooming while dragging
  if (!event.active) svg.call(zoom);
}

// Function to handle dragging
function dragged(event) {
  const dx = event.dx / currentScale;
  const dy = event.dy / currentScale;

  currentTransform = currentTransform.translate(dx, dy);

  mapGroup.attr("transform", currentTransform);
}

// Function to handle drag end
function dragEnded(event) {
  // Enable zooming after dragging
  if (!event.active) svg.call(zoom.transform, currentTransform);
}

// Load the map data (e.g., TopoJSON)
d3.json("world.json").then(function (data) {
  // Convert the TopoJSON to GeoJSON
  const countries = topojson.feature(data, data.objects.countries);

  // Get the client's screen dimensions
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  // Create a projection for the map based on the screen size
  const projection = d3.geoMercator()
    .fitSize([screenWidth, screenHeight], countries)
    .translate([screenWidth / 2, screenHeight / 2]); // Center the map

  // Create a path generator
  const path = d3.geoPath()
    .projection(projection);

  // Update the SVG container dimensions
  svg.attr("width", screenWidth).attr("height", screenHeight);

  // Render the map
  mapGroup.selectAll("path")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("d", path);

      // Load the CSV data
  d3.csv("earthquake_data.csv").then(function (csvData) {
    // Process each data point
    csvData.forEach(function (d) {
      const longitude = +d.longitude;
      const latitude = +d.latitude;
      const magnitude = +d.magnitude;

      // Convert longitude and latitude to coordinates on the map
      const coordinates = projection([longitude, latitude]);

    // Function to map magnitude value to color
    function getColor(magnitudeValue) {
        if (magnitudeValue < 7) {
          return "green";   // Set color to green for magnitude less than 6
        } else if (magnitudeValue >= 7 && magnitudeValue < 8) {
          return "yellow";  // Set color to yellow for magnitude between 6 and 7
        } else if (magnitudeValue >= 8 && magnitudeValue < 9) {
          return "orange";  // Set color to orange for magnitude between 7 and 8
        } else if (magnitudeValue >= 9) {
          return "red";  // Set color to purple for magnitude greater than or equal to 9
        } else {
          return "#90EE90";    // Set color to gray for other cases
        }
      }

      // Append a circle for each data point
      mapGroup.append("circle")
        .attr("cx", coordinates[0])
        .attr("cy", coordinates[1])
        .attr("r", 5)
        .style("fill", getColor(magnitude))
        .style("opacity", "0.5");  
    });
  });
});



