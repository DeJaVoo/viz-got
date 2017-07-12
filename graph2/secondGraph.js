function processData(data) {
  
  var res = {
    graph: [],
    allegiances: [],
    deathPerAllegiance: [],
    maxDeath : 0
  };
  
  deathPerAllegiance = [];
  deathPerBookPerChapter = [];

  
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
    
    // Calculate death per book per chapter
    if (!isNaN(e.y) && !isNaN(e.x)) {
      var deathCount = {};
      if ((deathPerBookPerChapter[e.y] !== undefined) && (deathPerBookPerChapter[e.y][e.x] !== undefined)) 
      {
        deathPerBookPerChapter[e.y][e.x]++; 
      }
      else{
        if(deathPerBookPerChapter[e.y] === undefined || (deathPerBookPerChapter[e.y] !== undefined && deathPerBookPerChapter[e.y][e.x] === undefined))
        {
          if(deathPerBookPerChapter[e.y] !== undefined){
            deathPerBookPerChapter[e.y][e.x] = 1;
          }
          else{
            deathCount[e.x] = 1;
            deathPerBookPerChapter[e.y] = deathCount;
          }
        }
      }

    }
    e.name = d.Name;
    res.allegiances.push(e.allegiances);
  });
  
  // Add death counts
  for(i = 1; i < deathPerBookPerChapter.length; i++)
  {
    var chapters = deathPerBookPerChapter[i];
    for(var obj in chapters)
    {
      var element = {};
      element.x = parseInt(obj, 10);
      element.y = i;
      element.z = chapters[obj];
      
      //calculate max death
      if(res.maxDeath < element.z)
      {
        res.maxDeath = element.z;
      }
      res.graph.push(element);
    }
  }

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
  var z = d3.scale.linear().domain([0,data.maxDeath])
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
  
  // Add title
  svg.append("text")
    .attr("x", geometry.width / 2 )
    .attr("y", -3)
    .attr("font-size", "16")
    .style("text-anchor", "middle")
    .text("Number of Deaths per Book per Chapter");

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


  svg.selectAll(".dot")
    .data(data.graph)
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
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html("Book: " + d.y + "<br/>" + "Chapter: " + d.x + "<br/>" + "Death Count: " + d.z)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .attr("data-legend", function(d) {
      return d.allegiances
    });
    

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(200,430)");
  
  var legendLinear = d3.legend.color()
    .shapeWidth(30)
    .cells([0,1,2,3,4,5,6,7, 8,9,10,11,12])
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