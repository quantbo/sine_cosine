var svg = d3.select('svg'),
	height = svg.attr('height'), width = svg.attr('width');
//For development purposes it can help to exhibit a rectangle congruent with the SVG element.
//Following development it can be made invisible by setting its opacity to 0 in the relevant style.
svg.append('rect')
	.attr('id', 'boxOuter')
	.attr('height', height)
	.attr('width', width);
//Leave space for axis on LHS, title.
var margin = {top: Math.round(height * 0.10),
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
	.style('opacity', 1/2);
//Generate data; there will be nn + 1 rows of data.
var theData = [], nn = 100,
		begin = -2 * Math.PI, end = 2 * Math.PI, span = end - begin;
for (var ii = 0; ii <= nn;  ++ii) {
	//The next line avoids buildup of rounding errors in the specification of x values.
	var x = begin + span * ii / nn;
	var row = {x: x, cos: Math.cos(x), sin: Math.sin(x)};
	theData.push(row);
}

//Define scales.
var xScale = d3.scaleLinear()
	.domain(d3.extent(theData, function(d) {return d.x;}))
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

//Add paths.
inner.append('path')
		.data([theData]) //Notice that the argument is enclosed in square brackets.
		.attr('class', 'line')
		.attr('d', lineCos);
inner.append('path')
		.data([theData])
		.attr('class', 'line')
		.attr('d', lineSin);

//Add axes.
inner.append('g')
	.call(d3.axisLeft(yScale).tickSizeOuter(0).ticks(5))
	.attr('class', 'axis');
//In order for translate() to apply to the axis alone, and not to the entire 'inner' element, the axis must be placed within its own 'g' element.
inner.append('g')
	.call(d3.axisBottom(xScale).tickSizeOuter(0))
	.attr('class', 'axis')
	.attr('transform', 'translate(0, ' + heightInner + ')');

inner.append('text') //Title.
	.attr('class', 'title')
	.text('sine & cosine functions')
	.attr('transform', 'translate(' + (widthInner / 2) + ',' + (-0.6 * margin.top) + ')');
