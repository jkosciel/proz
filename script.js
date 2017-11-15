/* global Chart, d3 */

window.addEventListener("load", loadPage, false);
var myDoughnutChart;
var prozData;
var lang = document.documentElement.lang;

var chartBackgroundColors = [
	"#9e0142",
	"#d53e4f",
	"#f46d43",
	"#fdae61",
	"#fee08b",
	"#e6f598",
	"#abdda4",
	"#66c2a5",
	"#3288bd",
	"#5e4fa2"
];

function loadJSON(path, success, error)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function ()
	{
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				if (success)
					success(JSON.parse(xhr.responseText));
			} else {
				if (error)
					error(xhr);
			}
		}
	};
	//console.log(xhr);
	xhr.open("GET", path, true);
	xhr.send();
}

function loadAJAX(path, success, error)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (xhttp.readyState === XMLHttpRequest.DONE) {
			if (xhttp.status === 200) {
				if (success)
					success(JSON.parse(xhttp.responseText));
			} else {
				if (error)
					error(xhttp);
			}
		}
	};

	xhttp.open("GET", path, true);
	xhttp.send();
}

function loadPage()
{

	loadJSON('charts'+'-'+lang+'.json',
			  function (data) {
				  Chart.defaults.global.defaultFontColor = "#111";
				  Chart.defaults.global.defaultFontFamily = "'Roboto', 'Arial', 'sans-serif'";
				  Chart.defaults.global.defaultFontSize = 13;
				  Chart.defaults.global.legend.position = "bottom";
				  Chart.defaults.global.tooltips.enabled = false;
				  //console.log(data);
				  var ctx = document.getElementById("jk-spec-chart");
				  //console.log(ctx);

				  myDoughnutChart = new Chart(ctx, {
					  type: 'doughnut',
					  data: data,
					  options: {
						  legend: {
							  display: false
						  },
						  cutoutPercentage: 60,
						  //responsive: false
						  position: "bottom",
						  legendCallback: createLegendUL,
						  onClick: clickChart,
						  hover: {
							  onHover: hoverChart
						  }

					  }

				  });
				  //console.log(myDoughnutChart.generateLegend());
				  createLegend(myDoughnutChart);
				  myDoughnutChart['chartCounter'] = createCounter(myDoughnutChart);
				  myDoughnutChart['chartCounterValue'] = 0;
				  sendHeight();
			  },
			  function (xhr) {
				  console.error(xhr);
			  }
	);

	loadAJAX('http://word2.eu/proz-kudoz-api/proz-kudoz-api.php',
			  function (proz) {

				  if (proz !== null)
				  {
					  console.log("Data from ProZ loaded.");
					  prozData = proz;
					  var kudoz = proz.profile_info.data.other.kudoz_summary;
					  //console.log(kudoz);
					  //console.log(prozData);
					  points_pro = kudoz.points_pro;
					  questions_asked_pro = kudoz.questions_asked_pro;
					  questions_answered_pro = kudoz.questions_answered_pro;
					  wwa = proz.profile_info.data.other.positive_wwas;

					  var kudozHtml = document.getElementById("jk-kudoz");
					  c_points_pro = new CountUp(document.getElementById("jk-points-pro").firstChild, 0, points_pro);
					  c_points_pro.start();
					  c_questions_asked_pro = new CountUp(document.getElementById("jk-questions-asked-pro").firstChild, 0, questions_asked_pro);
					  c_questions_asked_pro.start();
					  c_questions_answered_pro = new CountUp(document.getElementById("jk-questions-answered-pro").firstChild, 0, questions_answered_pro);
					  c_questions_answered_pro.start();
					  c_wwa = new CountUp("jk-wwa", 0, wwa);
					  c_wwa.start();


					  //document.getElementById("jk-points-pro").firstChild.innerHTML = points_pro;
					  //document.getElementById("jk-questions-asked-pro").firstChild.innerHTML = questions_asked_pro;
					  //document.getElementById("jk-questions-answered-pro").firstChild.innerHTML = questions_answered_pro;
					  //document.getElementById("jk-wwa").innerHTML = wwa;
					  //kudozHtml.innerHTML = "ola";

					  var ctx = document.getElementById("kudoz-points-by-field");
					  var data = formatKudozData(proz);

					  myKudozChart = new Chart(ctx, {
						  type: 'doughnut',
						  data: data,
						  options: {
							  legend: {
								  display: false
							  },
							  cutoutPercentage: 60,
							  //responsive: false
							  position: "bottom",
							  legendCallback: createLegendUL,
							  onClick: clickChart,
							  hover: {
								  onHover: hoverChart
							  }

						  }

					  });
					  //console.log(myDoughnutChart.generateLegend());
					  createLegend(myKudozChart);
					  myKudozChart['chartCounter'] = createCounter(myKudozChart);
					  myKudozChart['chartCounterValue'] = 0;
				  }
				  sendHeight();
			  },
			  function (xhr) {
				  console.error(xhr);
			  }
	);

	createProjectsVisualisation();

	window.addEventListener("resize", sendHeight, false);
	sendHeight();
}

createLegendUL = function (chart) {
	//DEBUG
	//console.log(chart);
	var html = '<ul>';
	var items = chart.legend.legendItems;
	for (var i = 0; i < items.length; ++i) {
		var span_circle = "<span class='circle' style='background:"
				  + items[i].fillStyle + ";'></span>";
		var span_name = "<span>" + items[i].text + "</span>";
		html += "<li data-id='" + i + "'>" + span_circle + span_name + "</li>";
		// do something with items[i], which is a <li> element
		//console.log(items[i]);
	}
	html += "</ul>";
	return html;
};

function createLegend(chart)
{
	//console.log(chart);
	var legend = chart.chart.canvas.parentNode.parentNode.getElementsByClassName('jk-chart-legend')[0];
	legend.innerHTML = chart.generateLegend();
	chart['legendHTML'] = legend;
	//var ul = legend.getElementById("foo");
	var items = legend.getElementsByTagName("li");
	for (var i = 0; i < items.length; ++i) {
		items[i].addEventListener("mouseover", function () {
			mouseoverChartByLegend(chart, this);
		});
		items[i].addEventListener("mouseout", function () {
			mouseoutChartByLegend(chart, this);
		});
		items[i].addEventListener("click", function () {
			setChartByLegend(chart, this);
		});
		// do something with items[i], which is a <li> element
		//console.log(items[i]);
	}
}

function createCounter(chart)
{
	chartValue = chart.chart.canvas.parentNode.getElementsByClassName('jk-chart-value')[0];
	chartCounter = new CountUp(chartValue, 0, 0, 0, 1.5);
	chartValue.innerHTML = "";
	return chartCounter;
}

function sendHeight()
{
	if (parent.postMessage)
	{
		// replace #wrapper with element that contains 
		// actual page content
		//var height= document.getElementsByTagName('html').offsetHeight;
		var body = document.body;
		var html = document.documentElement;
		var height = 0;
		height = html.offsetHeight;
		//var height = Math.max(html.scrollHeight, html.offsetHeight);
		//console.log(height);
		var url = (window.location != window.parent.location)
				  ? document.referrer
				  : document.location;
		parent.postMessage(height, url);
		//parent.postMessage(height, 'http://proz.com');
	}
}


var specificDisciplines;
function formatKudozData(data)
{
	specificDisciplines = data.disc_name_info["specific-disciplines"];
	var kudozPoint = data.kudoz_info.points.disc_specs;

	dataSize = Math.min(10, kudozPoint.length);
	var labels = [];
	var points = [];
	var labelsID = [];
	var i;
	for (i = 0; i < dataSize; i++)
	{
		points[i] = kudozPoint[i].pro;
		labelsID[i] = kudozPoint[i].disc_spec_id;
	}
	labels = labelsID.map(setLabel);

	kudozData = {
		"labels": labels,
		"datasets": [
			{
				"data": points,
				"backgroundColor": chartBackgroundColors.slice(),
				"hoverBackgroundColor": "#555"
			}
		]
	};

	return kudozData;
}

var findID;

function setLabel(id)
{
	findID = id;
	//metoda nie dziala w IE
	//goodLabel = specificDisciplines.find(checkLabel);
	var goodLabel;
	var i;
	for (i = 0; i < specificDisciplines.length; i++)
	{
		if (specificDisciplines[i].disc_spec_id == findID)
		{
			goodLabel = specificDisciplines[i];
			break;
		}
	}
	if (goodLabel !== null)
		return goodLabel.disc_spec_name;
	else
		return " ";
}

//nie dziala z find, IE i Opera nie obsluguja tej metody
function checkLabel(label)
{
	return label.disc_spec_id == findID;
}

var lastHover;

function hoverChart(chartElement)
{
	//console.log(chartElement);

	if (chartElement[0] !== undefined)
		cE = chartElement[0];
	else
	{
		lastHover = undefined;
		this.chartCounter.update(this.chartCounterValue);
		removeChildrenClass(this.legendHTML, "isHover");
		//if(this.chartCounterValue == 0)
		//	this.chartCounter.d.style.opacity = 0;
		return;
	}
	if (lastHover === undefined)
		lastHover = cE;
	else
	{
		if (lastHover === cE)
		{
			return;
		}
		else
		{
			lastHover = cE;
		}
	}

	var chartValue = cE._chart.canvas.parentNode.getElementsByClassName('jk-chart-value')[0];
	var chartCounter = this.chartCounter;
	datasetIndex = cE._datasetIndex;
	index = cE._index;

	var v = cE._chart.config.data.datasets[datasetIndex].data[index];
	if (chartCounter !== undefined)
		chartCounter.update(v);
	else
		chartValue.innerHTML = v;

	//podswietlanie legendy
	var legend = this.legendHTML;
	var listItems = legend.getElementsByTagName("li");
	removeChildrenClass(this.legendHTML, "isHover");
	listItems[index].classList.add("isHover");
}


function clickChart(e, chartElement)
{
	//console.log(cE);

	if (chartElement[0] !== undefined)
		cE = chartElement[0];
	else
		return;
	var chartValue = cE._chart.canvas.parentNode.getElementsByClassName('jk-chart-value')[0];
	var chartCounter = cE._chart.controller.chartCounter;
	datasetIndex = cE._datasetIndex;
	index = cE._index;

	var chart = cE._chart.controller;
	chart.indexActive = [index];
	//ustawienie kolorow
	resetAllColorChart(chart);
	colorChart(chart, index);

	var v = cE._chart.config.data.datasets[datasetIndex].data[index];
	if (chartCounter !== undefined)
		chartCounter.update(v);
	else
		chartValue.innerHTML = v;
	//uaktualnienie zaznaczonej wartosci
	cE._chart.controller.chartCounterValue = v;

	//legenda
	var ulLegend = cE._chart.canvas.parentNode.parentNode.getElementsByClassName('jk-chart-legend')[0];
	ulLegend = ulLegend.firstChild;

	//usuwanie class active
	removeChildrenClass(ulLegend, "active");

	//dodawanie class active do kliknietego elementu
	ulLegend.children[index].classList.add("active");

}

function removeClass(item, name)
{
	item.classList.remove(name);
}

function removeChildrenClass(item, name)
{
	children = item.getElementsByClassName(name);
	if (children.length > 0)
	{
		var i;
		for (i = children.length - 1; i >= 0; i--)
		{
			removeClass(children[i], name);
		}
	}
}

function mouseoverChartByLegend(chart, li)
{
	//ustawienie wartosci licznika
	index = li.getAttribute("data-id");
	value = chart.data.datasets[0].data[index];
	counter = chart.chartCounter;
	counter.update(value);

	colorChartByColor(chart, index, "#555");
}

function mouseoutChartByLegend(chart, li)
{
	counter = chart.chartCounter;
	counter.update(chart.chartCounterValue);
	if (li.classList.contains("active"))
		colorChart(chart, index);
	else
		colorChartByColor(chart, index, chartBackgroundColors[index]);
}

function setChartByLegend(chart, li)
{
	//console.log(chart);
	//console.log(li);
	index = li.getAttribute("data-id");

	value = chart.data.datasets[0].data[index];
	counter = chart.chartCounter;
	curentValue = chart.chartCounter.endVal;
	var newValue;

	if (li.classList.contains("active"))
	{
		li.classList.remove("active");
		newValue = 0;
		counter.update(newValue);
		resetColorChart(chart, index);
	}
	else
	{
		activeLegend = li.parentNode.getElementsByClassName('active');
		if (activeLegend.length > 0)
		{
			var i;
			for (i = activeLegend.length - 1; i >= 0; i--)
			{
				removeClass(activeLegend[i], "active");
			}
		}
		li.classList.add("active");
		newValue = value;
		counter.update(newValue);
		resetAllColorChart(chart)
		colorChart(chart, index);
	}
	chart.chartCounterValue = newValue;
}

function setManyChartByLegend(chart, li)
{
	//console.log(chart);
	//console.log(li);
	index = li.getAttribute("data-id");

	value = chart.data.datasets[0].data[index];
	counter = chart.chartCounter;
	curentValue = chart.chartCounter.endVal;
	var newValue;

	if (li.classList.contains("active"))
	{
		li.classList.remove("active");
		newValue = curentValue - value;
		counter.update(newValue);
		resetColorChart(chart, index);
	}
	else
	{
		li.classList.add("active");
		newValue = curentValue + value;
		counter.update(newValue);
		colorChart(chart, index);
	}
	chart.chartCounterValue = newValue;
}

var colorChartActive = "#999";

function colorChart(chart, index)
{
	colorChartByColor(chart, index, colorChartActive);
}

function colorChartByColor(chart, index, color)
{
	chart.data.datasets[0].backgroundColor[index] = color;
	chart.update();
}

function resetAllColorChart(chart)
{
	var i = 0;
	bgc = chart.data.datasets[0].backgroundColor;
	for (i = 0; i < bgc.length; i++)
	{
		bgc[i] = chartBackgroundColors[i];
	}
	chart.update();
}

function resetColorChart(chart, index)
{
	chart.data.datasets[0].backgroundColor[index] = chartBackgroundColors[index];
	chart.update();
}

function createProjectsVisualisation()
{
	document.getElementById("description").style.opacity = 0;
	d3.json("projects"+"-"+lang+".json", function (error, data) {
		if (error)
			throw error;

		//console.log(data);

		var color = d3.scaleQuantize().domain([0, 9])
				  .range(chartBackgroundColors.slice());
		var width = 550, height = 580;
		var svg = d3.select("#make-d3js")
				  .append("svg")
				  .attr("width", width)
				  .attr("height", height)
				  .attr("class", "DV-example")
				  .attr("preserveAspectRatio", "xMinYMin meet")
				  .attr("viewBox", "0 0 " + width + " " + height)
				  .classed("svg-content", true)
				  .append("g")
				  .attr("transform", function (d) {
					  return "translate(" + width / 2 + "," + height / 2 + ")";
				  });

		var data_to_pack_circle = data.map(
				  function (d)
				  {
					  var v;
					  switch (d.size)
					  {
						  case 'S':
							  v = 40;
							  break;
						  case 'M':
							  v = 55;
							  break;
						  case 'L':
							  v = 70;
							  break;
						  default:
							  v = 40;
					  }
					  return {r: v, info: d};
				  });

		packedCircle = d3.packSiblings(data_to_pack_circle);
		var circleGroup = svg.selectAll("circle")
				  .data(packedCircle).enter()
				  .append("g")
				  .attr("transform", function (d) {
					  return "translate(" + d.x + "," + d.y + ")";
				  })
				  .attr("class", function (d) {
					  return "jk-svg-circle-group cat-" + d.info.category + " size-" + d.info.size;
				  })
				  .on("mouseover", showDescription)
				  .on("mouseleave", hideDescription);


		circleGroup.append("circle")
				  .attr("cx", function (d) {
					  return 0;
				  })
				  .attr("cy", function (d) {
					  return 0;
				  })
				  .attr("r", function (d) {
					  return d.r;
				  })
				  .attr("class", "jk-svg-circle")
				  .style("fill", function (d) {
					  return color(d.info.category);
				  });

		circleGroup.append("text")
				 //.attr("dy", ".3em")
				  .attr("class", "jk-svg-text")
				  .style("font-size", function (d) {
					  if (d.info.fontSize !== null)
						  return d.info.fontSize + "px";
					  else
						  return "";
				  })
				  .style("text-anchor", "middle")
				  .text(function (d) {
					  return d.info.name;
				  });

		var insertLinebreaks = function (d) {
			var el = d3.select(this);
			var words = d.info.name.split(' ');
			el.text('');
			var wordCount = words.length;
			el.attr("dy", -(wordCount / 2.0 - 0.75) + "em")

			for (var i = 0; i < wordCount; i++) {
				var tspan = el.append('tspan').text(words[i]);
				if (i > 0)
					tspan.attr('x', 0).attr('dy', '1.2em');
			}
		};

		svg.selectAll('.jk-svg-circle-group text').each(insertLinebreaks);
	});
}

function showDescription(d)
{
	var name = d.info.name;
	var desc = d.info.description;
	var allCats = document.getElementById("jk-spec")
			  .getElementsByClassName("jk-chart-legend")[0]
			  .getElementsByTagName("ul")[0]
			  .getElementsByTagName("li");
	var cat = "-";
	if (allCats[d.info.category] != null)
		cat = allCats[d.info.category]
				  .getElementsByTagName("span")[1].innerHTML;

	d3.select("#description").style("opacity", 0);
	//console.log(d3.select(this));

	d3.select("#desc-d3js").text(desc);
	d3.select("#name-d3js").text(name);
	//if (cat != null)
	//	d3.select("#cat-d3js").text(cat);

	d3.select("#description").style("opacity", 1);
	d3.select(this).style("opacity", 0.5);
}
function hideDescription(d)
{
	d3.select("#description").style("opacity", 0);
	d3.select(this).style("opacity", 1);
}

function classes(root) {
	var classes = [];

	function recurse(name, node) {
		if (node.children)
			node.children.forEach(function (child) {
				recurse(node.name, child);
			});
		else
			classes.push({packageName: name, className: node.name, value: node.size});
	}

	recurse(null, root);
	return {children: classes};
}
