// d3.legend.js 
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence

(function() {
  d3.legend = function(g) {
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

      var filteredList = [];
      li.selectAll("text")
        .data(items, function(d) {
          return d.key
        })
        .call(function(d) {
          d.enter().append("text")
        })
        .call(function(d) {
          d.exit().remove()
        })
        .attr("y", function(d, i) {
          return i*1.5 + "em"
        })
        .attr("x", "1.5em")
        .attr("id", function(d, i) {
          return "legend_item_id_" + i;
        })
        .text(function(d) {;
          return d.key
        })
        .style("fill", function(d) {
          return d.value.color
        })
        .on("mouseover", function(d, i) {
          txt = svg.select("#legend_item_id_" + i);
          txt.style("fill", "#000000");
          txt.style("font-weight", "bold");
          svg.selectAll(".dot")
            .filter(function(x) {
              return true;
            })
            .style("visibility", "visible");

          svg.selectAll(".dot")
            .filter(function(x) {
              var point = d3.select(this).attr("data-legend");
              var index = filteredList.indexOf(point);
              return point != d.key && index == -1;
            })
            .style("visibility", "hidden");
        })
        .on("mouseout", function(d, i) {
          txt = svg.select("#legend_item_id_" + i);
          if (filteredList.length === 0) {
            svg.selectAll(".dot").style("visibility", "visible");
            txt.style("fill", d.value.color);
            txt.style("font-weight", "normal");
          } else {
            var index = filteredList.indexOf(d.key);
            var notInList = index == -1;
            if (notInList) {
              txt.style("fill", d.value.color);
              txt.style("font-weight", "normal");
              svg.selectAll(".dot")
                .filter(function(x) {
                  var point = d3.select(this).attr("data-legend");
                  return point == d.key;
                })
                .style("visibility", "hidden");
            }
          }
        })
        .on("click", function(d, i) {
          var index = filteredList.indexOf(d.key);
          if (index == -1) {
            filteredList.push(d.key);
          } else {
            filteredList.splice(index, 1);
          }

        });

      li.selectAll("rect")
        .data(items, function(d) {
          return d.key
        })
        .call(function(d) {
          d.enter().append("rect")
        })
        .call(function(d) {
          d.exit().remove()
        })
        // .attr("cy",function(d,i) { return i-0.25+"em"})
        // .attr("cx",0)
        // .attr("r","0.4em")
        .attr("x", 0)
        .attr("y", function(d, i) {
          return i * 1.5 - 0.75 + "em"
        })
        .attr("width", 15)
        .attr("height", 10)
        .style("fill", function(d) {
          console.log(d.value.color);
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
})()