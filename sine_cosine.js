var svg = d3.select('svg'),
	height = svg.attr('height'), width = svg.attr('width');
//For development purposes it can help to exhibit a rectangle congruent with the SVG element.
//Following development it can be made invisible by setting its opacity to 0 in the relevant style.
svg.append('rect')
	.attr('id', 'boxOuter')
	.attr('height', height)
	.attr('width', width);
//Leave space for axis on LHS, title, legend.
var margin = {top: Math.round(height * 0.15),
						 right: Math.round(width * 0.05),
						 bottom: Math.round(height * 0.10),
						 left: Math.round(width * 0.075)};
//Grouping element where graphing takes place.
var inner = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//The dimensions of the graphing area.
var heightInner = height - margin.top - margin.bottom,
		widthInner = width - margin.left - margin.right;
//Draw a box congruent with the 'inner' element.
var boxInner = inner.append('rect')
	.attr('id', 'boxInner')
	.attr('height', heightInner)
	.attr('width', widthInner)
	.style('stroke-opacity', 1/2);

//Curve and shading colors.
var cos_color = 'blue', sin_color = 'orange';

//Generate data; there will be nn + 1 rows of data.
var theData = [], nn = 100,
		begin = -3 * Math.PI, end = 3 * Math.PI, span = end - begin;
for (var ii = 0; ii <= nn;  ++ii) {
	//The next line avoids buildup of rounding errors in the specification of x values.
	var x = begin + span * ii / nn;
	var row = {x: x, cos: Math.cos(x), sin: Math.sin(x)};
	theData.push(row);
}

//Generate tick values, using the 'begin' and 'end' variables defined above.
//Place tick marks with a frequency of pi/2.
var tickVals = [];
var tickCount = Math.round((end - begin) / (Math.PI/2));
for (var ii = 0; ii <= tickCount; ++ii) tickVals.push(begin + ii * Math.PI / 2);

//Define a function for formatting tick labels.
//There are a number of special cases for values between -pi and pi inclusive.
function tf(d, i) {
	//The arg i is available but we do not use it.
	var pi = '\u03c0';
	var prefix = Math.round(2 * d / Math.PI) / 2;
	if (prefix == -1) {
		label = '-' + pi;
	} else
	if (prefix == -0.5) {
		label = '-' + pi + '/2';
	} else
	if (prefix == 0) {
		label = '0';
	} else
	if (prefix == 0.5) {
		label = pi + '/2';
	} else
	if (prefix == 1) {
		label = pi;
	} else
	if (prefix % 1 != 0) {
		prefix = 2 * prefix;
		suffix = 2;
		label = prefix + pi + '/' + suffix; 
	} else {
		label = prefix + pi;
	}
	return label;
}

//Define scales.
var xScale = d3.scaleLinear()
	.domain([begin, end])
	.range([0, widthInner]);
var yScale = d3.scaleLinear()
	//The domain is determined theoretically. The sine and cosine functions vary between -1 and 1.
	.domain([-1, 1])
	.range([heightInner, 0]).nice();

//Define lines.
var lineCos = d3.line()
	.x(function(d) { return xScale(d.x); })
	.y(function(d) { return yScale(d.cos); });
var lineSin = d3.line()
	.x(function(d) { return xScale(d.x); })
	.y(function(d) { return yScale(d.sin); });

//Define areas. These shade the areas between the curves and the mathematical x axis.
var cos_area = d3.area()
	.x(function(d, i) {return xScale(d.x);})
	.y0(heightInner / 2) //The mathematical x axis is located here.
	.y1(function(d, i) {return yScale(d.cos);});
var sin_area = d3.area()
	.x(function(d, i) {return xScale(d.x);})
	.y0(heightInner / 2) //The mathematical x axis is located here.
	.y1(function(d, i) {return yScale(d.sin);});

//Draw mathematical axes.
//Draw before curves are rendered so that curves overlay them.
inner.append('line') //horizontal
	.attr('x1', 0)
	.attr('x2', widthInner)
	.attr('y1', heightInner / 2)
	.attr('y2', heightInner / 2)
	//If stroke is not styled line does not appear.
	.attr('class', 'inner-axis');
inner.append('line') //vertical
	.attr('x1', widthInner / 2)
	.attr('x2', widthInner / 2)
	.attr('y1', 0)
	.attr('y2', heightInner)
	.attr('class', 'inner-axis');

//Render shading.
//Do before curves are generated so that shading does not paint over the curves.
inner.append('path')
	.data([theData])
	.attr('d', cos_area)
	.style('fill', cos_color)
	.style('fill-opacity', 0.25);
inner.append('path')
	.data([theData])
	.attr('d', sin_area)
	.style('fill', sin_color)
	.style('fill-opacity', 0.25);

//Add paths.
inner.append('path')
		.data([theData]) //Notice that the argument is enclosed in square brackets.
		.attr('class', 'line')
		.attr('d', lineCos)
		.style('stroke', cos_color);
inner.append('path')
		.data([theData])
		.attr('class', 'line')
		.attr('d', lineSin)
		.style('stroke', sin_color);

//Legend.
inner.append('line')
	.attr('x1', 0)
	.attr('x2', 0.10 * widthInner)
	.attr('y1', - margin.top / 2)
	.attr('y2', - margin.top / 2)
	.style('stroke', sin_color)
	.style('stroke-width', '2px');
inner.append('text')
	.text('sine')
	.attr('x', 0.11 * widthInner)
	.attr('y', - margin.top / 2)
	.attr('class', 'legend-text');
inner.append('line')
	.attr('x1', 0)
	.attr('x2', 0.10 * widthInner)
	.attr('y1', - margin.top / 4)
	.attr('y2', - margin.top / 4)
	.style('stroke', cos_color)
	.style('stroke-width', '2px');
inner.append('text')
	.text('cosine')
	.attr('x', 0.11 * widthInner)
	.attr('y', - margin.top / 4)
	.attr('class', 'legend-text');

//Add axes.
inner.append('g') //y axis
	.call(d3.axisLeft(yScale).tickSizeOuter(0).ticks(5))
	.attr('class', 'axis');
//In order for translate() to apply to the axis alone, and not to the entire 'inner' element, the axis must be placed within its own 'g' element.
inner.append('g') //x axis
	.call(d3.axisBottom(xScale).tickValues(tickVals).tickSizeOuter(0).tickFormat(tf))
	.attr('class', 'axis')
	.attr('transform', 'translate(0, ' + heightInner + ')');

inner.append('text') //Title.
	.attr('class', 'title')
	.text('sine & cosine functions')
	.attr('transform', 'translate(' + (widthInner / 2) + ',' + (-0.6 * margin.top) + ')');
