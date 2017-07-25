// d3.legend.js 
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence


function drawLegend(g, values, x, y, z, toolTipDiv, deathMap, svg2) {
  g.each(function() {
    var g = d3.select(this),
      items = {},
      svg = d3.select(g.property("nearestViewportElement")),
      legendPadding = g.attr("data-style-padding") || 5,
      lb = g.selectAll(".legend-box").data([true]),
      li = g.selectAll(".legend-items").data([true])

    lb.enter().append("rect").classed("legend-box", true)
    li.enter().append("g").classed("legend-items", true)

    svg.selectAll("[data-legend]").each(function() {
      var self = d3.select(this)
      items[self.attr("data-legend")] = {
        pos: self.attr("data-legend-pos") || this.getBBox().y,
        color: self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
      }
    })

    items = d3.entries(items).sort(function(a, b) {
      return a.value.pos - b.value.pos
    })
    values2 = []
    for (i = 0; i < values.length; i++) {
      values2[i] = {
        key: values[i],
        value : { pos: 0, color: "rgb(0, 0, 0)" } 
      };
    }
    
    var picked = null;
    li.selectAll("text")
      .data(values2, function(d) {
        return d.key
      })
      .call(function(d) {
        d.enter().append("text")
      })
      .call(function(d) {
        d.exit().remove()
      })
      .attr("y", function(d, i) {
        return i * 1.5 + "em"
      })
      .attr("x", "1.5em")
      .attr("id", function(d, i) {
        return "legend_item_id_" + i;
      })
      .text(function(d) {
        return d.key;
      })
      .style("fill", function(d) {
        return d.value.color;
      })
      .on("mouseover", function(d, i) {
          if(picked == null) {        
            txt = svg.select("#legend_item_id_" + i);
            txt.style("font-weight", "bold");
            drawDots(svg2, newGraphData(deathMap[d.key]), x, y, z, toolTipDiv);
          }
      })
      .on("mouseout", function(d, i) {
        if(picked == null) {
          txt = svg.select("#legend_item_id_" + i);
          txt.style("font-weight", "normal");
          drawDots(svg2, newGraphData(deathMap["total"]), x, y, z, toolTipDiv);
        }
      })
      .on("click", function(d, i) {
        if(picked != null){
            orignalTxt = svg.select("#legend_item_id_" + picked.index);
            orignalTxt.style("text-decoration", "none");
            if(picked.key == d.key) {
                picked = null;
            } else {
              orignalTxt.style("font-weight", "normal");
              txt = svg.select("#legend_item_id_" + i);
              txt.style("font-weight", "bold");
              txt.style("text-decoration", "underline");
              picked = {key: d.key, index: i}    
              drawDots(svg2, newGraphData(deathMap[d.key]), x, y, z, toolTipDiv);
            }
        } else {
          txt = svg.select("#legend_item_id_" + i);
          txt.style("font-weight", "bold");
          txt.style("text-decoration", "underline");
          picked = {key: d.key, index: i}
        }
      });

    li.selectAll("rect")
      .data(values2, function(d) {
        return d.key
      })
      .call(function(d) {
        d.enter().append("rect")
      })
      .call(function(d) {
        d.exit().remove()
      })
      .attr("x", 0)
      .attr("y", function(d, i) {
        return i * 1.5 - 0.75 + "em"
      })
      .attr("width", 15)
      .attr("height", 10)
      .style("fill", function(d) {
        return d.value.color
      })

    // Reposition and resize the box
    var lbbox = li[0][0].getBBox()
    lb.attr("x", (lbbox.x - legendPadding))
      .attr("y", (lbbox.y - legendPadding))
      .attr("height", (lbbox.height + 2 * legendPadding))
      .attr("width", (lbbox.width + 2 * legendPadding))
  })
  return g
}