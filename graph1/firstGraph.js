function processData(data) {
  var res = {
    graph: [],
    allegiances: []
  };
  var maxChapter = -1;
  data.forEach(function(d) {
    if (!isNaN(d.DeathChapter) && d.DeathChapter > maxChapter) {
      maxChapter = d.DeathChapter;
    }
  });

  data.forEach(function(d) {
    if (!isValid(d.DeathBook) || !isValid(d.DeathChapter)) {
      return;
    }
    var e = {};
    e.y = parseInt(d.DeathBook, 10);
    e.x = parseInt(d.DeathChapter, 10);
    e.allegiances = d.Allegiances;
    e.name = d.Name;
    res.allegiances.push(e.allegiances);
    res.graph.push(e);
  });
  return res;
}

function drawGraph(data) {
    var geometry = newGeometry();
    
    var x = d3.scale.linear().range([0, geometry.width]);
    x.domain([0, 85]).nice();
    var y = d3.scale.linear().range([geometry.height, 0]);
    y.domain(calcAxisRange(data.graph, function(d) {return d.y;})).nice();


    /*
    define axes
    */
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-geometry.height);

    var bookMap = {1:"Book1", 2: "Book2", 3: "Book3", 4: "Book4", 5: "Book5"};
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-geometry.width)
      .tickFormat(function(d, i) {
        if(bookMap[d] !== undefined) {
          return bookMap[d];
        } else {
          return undefined;
        }
      });


  // Define the div for the tooltip
  var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

  var svg = newSvg(geometry);

    /*
    add axes lines to the chart
    */
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + geometry.height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", geometry.width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("X");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Book");


    var colorScale = d3.scale.category20().domain(data.allegiances);
    svg.selectAll(".dot")
      .data(data.graph)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("fill", function(d) {
        return colorScale(d.allegiances)
      })
      .attr("cx", function(d) {
        return x(d.x);
      })
      .attr("cy", function(d) {
        return y(d.y);
      })
      .on("mouseover", function(d) {		
          div.transition()		
              .duration(200)		
              .style("opacity", .9);		
          div.html("Name: " + d.name + "<br/>"  + "Allegiance: "+ d.allegiances +"<br/>"+ "Chapter: " + d.x )	
              .style("left", (d3.event.pageX) + "px")		
              .style("top", (d3.event.pageY - 28) + "px");	
          })					
      .on("mouseout", function(d) {		
          div.transition()		
              .duration(500)		
              .style("opacity", 0);	
      })
      .attr("data-legend",function(d) { return d.allegiances});
      
      
    var legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(905,30)")
      .style("font-size","12px")
      .call(d3.legend)
}

function main() {
  d3.csv("db.csv", function(error, orignalData) {
    if (error) throw error;
    var data = processData(orignalData);
    drawGraph(data);
      
  });
}

main();