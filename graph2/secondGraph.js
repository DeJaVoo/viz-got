function incrementDeath(deathList, deathBook, deathChapter) {
  if (deathList[deathBook] === undefined) {
    deathList[deathBook] = [];
  }
  if (deathList[deathBook][deathChapter] === undefined) {
    deathList[deathBook][deathChapter] = 0;
  }
  deathList[deathBook][deathChapter]++;
}

function newDeathMap(data) {
  deathMap = {
    total: []
  };
  data.forEach(function(d) {
    if (!isValid(d.DeathBook) || !isValid(d.DeathChapter)) {
      return;
    }
    deathBook = parseInt(d.DeathBook, 10);
    deathChapter = parseInt(d.DeathChapter, 10);
    if (isNaN(deathChapter) || isNaN(deathBook)) {
      return;
    }

    if (!(d.Allegiances in deathMap)) {
      deathMap[d.Allegiances] = [];
    }

    incrementDeath(deathMap["total"], deathBook, deathChapter);
    incrementDeath(deathMap[d.Allegiances], deathBook, deathChapter);
  });
  return deathMap;
}

function drawDots(svg, graph, x, y ,z, toopTipDiv) {
  svg.selectAll(".dot")
    .remove();

  svg.selectAll(".dot")
    .data(graph)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("fill", function(d) {
      return z(d.z)
    })
    .attr("cx", function(d) {
      return x(d.x);
    })
    .attr("cy", function(d) {
      return y(d.y);
    })
    .on("mouseover", function(d) {
      toopTipDiv.transition()
        .duration(200)
        .style("opacity", .9);
      toopTipDiv.html("Book: " + d.y + "<br/>" + "Chapter: " + d.x + "<br/>" + "Death Count: " + d.z)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      toopTipDiv.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

function newAllegianceList(data) {
  map = {}
  res = [];

  data.forEach(function(d) {
    if (!(d.Allegiances in map)) {
      map[d.Allegiances] = true;
      res.push(d.Allegiances);
    }
  });

  return res;
}


function calcMaxDeath(deathList) {
  maxDeath = 0;
  for (i = 1; i < deathList.length; i++) {
    var chapters = deathList[i];
    for (var obj in chapters) {
      //calculate max death
      if (maxDeath < chapters[obj]) {
        maxDeath = chapters[obj];
      }
    }
  }
  return maxDeath
}

function newGraphData(deathList) {
  graph = [];
  for (i = 1; i < deathList.length; i++) {
    var chapters = deathList[i];
    for (var obj in chapters) {
      var element = {};
      element.x = parseInt(obj, 10);
      element.y = i;
      element.z = chapters[obj];
      graph.push(element);
    }
  }
  return graph;
}

function processData(data) {

  var res = {
    graph: [],
    allegiances: newAllegianceList(data),
    maxDeath: 0
  };

  deathMap = newDeathMap(data);

  var maxChapter = -1;
  data.forEach(function(d) {
    if (!isNaN(d.DeathChapter) && d.DeathChapter > maxChapter) {
      maxChapter = d.DeathChapter;
    }
  });



  // deathList = deathMap["total"];
  // Add death counts
  res.maxDeath = calcMaxDeath(deathMap["total"]);
  res.graph = newGraphData(deathMap["total"]);
  res.deathMap = deathMap;
  return res;
}

function drawGraph(data) {
  var geometry = newGeometry();

  var x = d3.scale.linear().range([0, geometry.width]);
  x.domain([0, 85]).nice();
  var y = d3.scale.linear().range([geometry.height, 0]);
  y.domain(calcAxisRange(data.graph, function(d) {
    return d.y;
  })).nice();
  var z = d3.scale.linear().domain([0, data.maxDeath])
    .range(["yellow", "blue"]);


  /*
  define axes
  */
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-geometry.height);

  var bookMap = {
    1: "Book1",
    2: "Book2",
    3: "Book3",
    4: "Book4",
    5: "Book5"
  };
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-geometry.width)
    .tickFormat(function(d, i) {
      if (bookMap[d] !== undefined) {
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
    .text("Chapter");

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

  drawDots(svg, data.graph, x, y, z, div);

  svg.selectAll(".data-legend")
    .data(data.allegiances)
    .enter().append("circle")
    .attr("data-legend", function(a) {
      return a;
    })
    .attr("cx", 0)
    .attr("cy", 0)
    .style("visibility", "hidden");


  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(905,30)")
    .style("font-size", "12px");
  // .call(d3.my_legend)

  drawLegend(legend, data.allegiances, x, y, z, div, deathMap, svg);

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(200,430)");

  var legendLinear = d3.legend.color()
    .shapeWidth(30)
    .cells([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .orient('horizontal')
    .scale(z);

  svg.select(".legendLinear")
    .call(legendLinear);
}


function main() {
  d3.csv("db.csv", function(error, orignalData) {
    if (error) throw error;
    var data = processData(orignalData);
    drawGraph(data);

  });
}

main();