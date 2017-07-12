function isValid(field) {
  return field !== "" && !isNaN(field);
}

function calcAxisRange(data, f) {
  var range = d3.extent(data, f);
  var delta = range[1] - range[0];
  range[0] = parseInt(range[0], 10) - (delta * 0.2);
  range[1] = parseInt(range[1], 10) + (delta * 0.2);
  range[0] = Math.max(range[0], 0)
  return range;
}

function newMargin() {
  return {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
  }
}

function newGeometry() {
  var geometry = {};
  geometry.margin = newMargin();
  geometry.width = (960 - geometry.margin.left - geometry.margin.right);
  geometry.height = (800 - geometry.margin.top - geometry.margin.bottom);
  return geometry;
}

function newSvg(geometry) {
  var margin = geometry.margin;
  var width = geometry.width;
  var height = geometry.height;
  return d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}



