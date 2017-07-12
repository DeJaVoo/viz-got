function processData(data) {

  var chaptersPerBook = {
    0: 0,
    1: 73,
    2: 70,
    3: 82,
    4: 46,
    5: 73
  };
  
  var allegiancesColor = {
    "None": "blue",
    "Lannister": "brown",
    "Arryn": "BlueViolet",
    "Baratheon": "yellow",
    "Greyjoy": "orange",
    "Martell": "purple",
    "Night's Watch": "DarkCyan",
    "Stark": "DarkOliveGreen",
    "Targaryen": "DarkSlateGray",
    "Tully": "GoldenRod",
    "Tyrell": "HotPink",
    "Wildling": "LightSalmon"
  };
  
  
  var res = {
    graph: [],
    allegiances: []
  };

  data.forEach(function(d) {
    // if (!isValid(d.DeathBook) || !isValid(d.DeathChapter)) {
    //   return;
    // }
    var e = {};
    e.deathBook = parseInt(d.DeathBook, 10);
    e.deathChapter = parseInt(d.DeathChapter, 10);
    e.introBook = parseInt(d.IntroBook, 10);
    e.introChapter = parseInt(d.IntroChapter, 10);
    e.allegiances = d.Allegiances;

    // Calculate life line of each character 
    if (!isNaN(e.introBook) && !isNaN(e.introChapter)) {
      var sumIntroChapters = 0;
      for (i = 0; i < e.introBook; i++) {
        sumIntroChapters += chaptersPerBook[i];
      }
      sumIntroChapters += e.introChapter;

      var sumDeathChapters = 0;
      if (!isNaN(e.deathBook) && !isNaN(e.deathChapter)) {
        for (i = 0; i < e.deathBook; i++) {
          sumDeathChapters += chaptersPerBook[i];
        }
        sumDeathChapters += e.deathChapter;
      } else {
        for (i = 0; i <= 5; i++) {
          sumDeathChapters += chaptersPerBook[i];
        }
      }

      var root = {};
      root.label = d.Name;
      root.allegiance = e.allegiances;
      root.intro = sumIntroChapters;
      root.death = sumDeathChapters;
      root.duration = sumDeathChapters - sumIntroChapters + 1;
      root.times = [];
      var element = {};
      element.color = allegiancesColor[e.allegiances];
      element.starting_time = sumIntroChapters;
      if(sumIntroChapters == sumDeathChapters)
      {
        element.ending_time = sumDeathChapters + 1;
      }
      else
      {
        element.ending_time = sumDeathChapters;
      }
      root.times.push(element);
      res.graph.push(root);
      res.allegiances.push(e.allegiances);
    }
  });

  // sort by allegiances
  //res.graph.sort(dynamicSort("allegiance"));
  res.graph.sort(function(x, y){
    return x.times[0].starting_time - y.times[0].starting_time;
  });
  
  return res;
}

function drawGraph(data) {

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  var chart = d3.timeline()
    .stack().rowSeparators("black")
    .margin({
      left: 200,
      right: 30,
      top: 0,
      bottom: 70
    }).beginning(0).ending(344)
    .tickFormat({
      format: d3.format(""),
      tickTime: 5,
      tickInterval: 1,
      tickSize: 6
    }).hover(function(d, i, datum) {
      div.transition().duration(200).style("opacity", 0.9);

      var living = " & living";
      var lived = "";
      if (datum.death !== 344) {
        living = " Died: " + datum.death;
        lived = "<br/><br/> Lived: " + datum.duration + " chapters" + "<br/>";
      }

      div.html("Name: " + datum.label + "<br/><br/>" + "Allegiance: " + datum.allegiance + "<br/><br/>" + "Introduced ch: " + datum.intro + living + lived)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");

    }).mouseout(function(d, i, datum) {
      d3.selectAll('.tooltip').style('opacity', 0);
    });
  var width = 1200;
  var svg = d3.select("#timeline").append("svg").attr("width", width)
    .datum(data.graph).call(chart);
}


function main() {
  d3.csv("db.csv", function(error, orignalData) {
    if (error) throw error;
    var data = processData(orignalData);
    drawGraph(data);

  });
}

main();