  function countChildren(d){
    var values = ["A", "B"];
    var found = false;
    if(d.children) {
        values = d.children;
        found = true;
    }else if(d._children){
      values = d._children;
      found = true;
    }
    if(found){
      var res = 0;
      for (var i = 0; i < values.length; i++) {
        res = res + countChildren(values[i]);
      }
      return res;
    }else if('depth' in d && d['depth'] !== 4){
      return 0;
    }else{
      return 1;
    }
  }

function main() {
  var geometry = newGeometry();
  
  var i = 0,
    duration = 750,
    root;
  
  var tree = d3.layout.tree()
    .size([geometry.height, geometry.width]);
  
  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
  
  var svg = newSvg(geometry);
  
  // Define the div for the tooltip
  var toopTipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  d3.json("db.json", function(error, allegiances) {
    if (error) throw error;

    root = allegiances;
    root.x0 = geometry.height / 2;
    root.y0 = 0;
    
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
  
  root.children.forEach(collapse);
  update(root);
    
  });
  
  d3.select(self.frameElement).style("height", "800px");
  
  function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click)
      
  nodeEnter
      .filter(function(d) {return d.depth != 4;}) 
      .on("mouseover", function(d) {
      toopTipDiv.transition()
        .duration(200)
        .style("opacity", .9);
      toopTipDiv.html("Number of " + d.name + " characters: " + countChildren(d))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      toopTipDiv.transition()
        .duration(500)
        .style("opacity", 0);
    });

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}



  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
    countChildren(d);
}
  
}



main();