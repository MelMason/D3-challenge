var svgWidth = 900;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 110
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisBottom(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to new circles
function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {

  circlesXGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesXGroup;
}
function renderYCircles(circlesXGroup, newYScale, chosenYAxis) {

  circlesXGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesXGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesXGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty";
  }
  else if(chosenXAxis === "age"){
      var label = "Age";
  }
  else {
    var label = "Household Income";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]} ${d[chosenYAxis]}`);
    });


  circlesXGroup.call(toolTip);

  circlesXGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesXGroup;

}


    
// Import Data
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income= +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;

    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(censusData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d[chosenYAxis])])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
      // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(${margin.left-110})`)
    .call(leftAxis);
  
  
      // chartGroup.append("g")
      //   .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);


    var circlesXGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "blue")
        .attr("opacity", ".5");
    

    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("xValue", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("xValue", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("xValue", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

     // append y axis
    var labelsYGroup = chartGroup.append("g")
    .attr("transform", `translate(${margin.left - 210}, ${margin.top+150})`);


    var healthcareLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        // .attr("y", 0 - margin.left)
        // .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "0em")
        .attr("class", "axisText")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

        var obesityLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        // .attr("y", 0 - margin.left)
        // .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "2em")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Obesity (%)");

        var smokesLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        // .attr("y", 0 - margin.left)
        // .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "4em")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Smokes (%)");

    // var circleLabels = chartGroup.selectAll(null).data(censusData).enter().append("text");

    // circleLabels
    //   .attr("x", function(d) {
    //     return xLinearScale(d[chosenXAxis]);
    //   })
    //   .attr("y", function(d) {
    //     return yLinearScale(d[chosenYAxis]);
    //   })
    //   .text(function(d) {
    //     return d.abbr;
    //   })
    //   .attr("font-family", "sans-serif")
    //   .attr("font-size", "10px")
    //   .attr("text-anchor", "middle")
    //   .attr("fill", "white");

  // x axis labels event listener
    labelsXGroup.selectAll("text")
      .on("click", function() {
      // get value of selection
      var xValue = d3.select(this).attr("xValue");
      if (xValue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xValue;

        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesXGroup = renderXCircles(circlesXGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesXGroup = updateToolTip(chosenXAxis, circlesXGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenXAxis === "age")  {
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else {
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
        }
      }
    });
    // y axis labels event listener
    labelsYGroup.selectAll("text")
      .on("click", function() {
      // get value of selection
      var yValue = d3.select(this).attr("yValue");
      if (yValue !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = yValue;

        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesXGroup = renderYCircles(circlesXGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesXGroup = updateToolTip(chosenYAxis, circlesYGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenYAxis === "age")  {
            obesityLabel
                .classed("active", true)
                .classed("inactive", false);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else {
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            obesityLabel
                .classed("active", false)
                .classed("inactive", true);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});