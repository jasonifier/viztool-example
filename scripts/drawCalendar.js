$(document).ready(function(){
    sample.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    const dataset = sample.map(dv => ({date: dv.Date, value: dv.AnswerCount}));
    draw(dataset);
});

function draw(
    data,
    {
        legendPadding = 100,
        groupPadding = 0.5,
        labelRightMargin = 10,
        cellSize = 20,
        cellMargin = 2,
        lowColor = "#bcbcdb",
        highColor = "#491286",
        downShift = 1.5,
        legendWidth = 60,
        backgroundColor = "#6c757d"
    } = {}
) {

    // const years = nestDataByYear(data);
    // const values = data.map(c => c.value);
    // const { width, height } = document.getElementById("svg").getBoundingClientRect();

    const years = reduceByWeek(data);
    const values = collectValues(years, {fieldName: "totalCount"});
    const maxValue = d3.max(values);
    const minValue = d3.min(values);

    const colorFn = d3.scaleLinear([minValue, maxValue], [lowColor, highColor]);
    const legendColorFn = d3.scaleLinear([0, 1.001], [lowColor, highColor]);
    const yearHeight = cellSize * 1.25;

    const svg = d3.select("#svg");
    const group = svg.append("g");

    const year = group
        .selectAll("g")
        .data(years)
        .join("g")
        .attr(
        "transform",
        (_, i) => `translate(50, ${(yearHeight * i) + (cellSize * downShift) + (i * groupPadding)})`
        );

    year
        .append("text")
        .attr("text-anchor", "end")
        .attr("font-size", 16)
        .attr("font-weight", 550)
        .text(d => d.key);
    
    // const timeWeek = d3.utcSunday;
    // const format = d3.format("+.2%");
    // const formatDate = d3.utcFormat("%x");

    year
        .append("g")
        .selectAll("rect")
        .data(d => d.values)
        .join("rect")
        .attr("width", cellSize - cellMargin)
        .attr("height", cellSize - cellMargin)
        .attr("x", d => parseInt(d.weekNum) * cellSize + labelRightMargin)
        .attr("y", -10)
        .attr("fill", d => colorFn(d.totalCount))
        .append("title")
        .text(d =>
            `Week: ${d.weekNum}\nStart Date: ${d.minDate}\nEnd Date: ${d.maxDate}\nCount: ${d.totalCount.toFixed(2)}`
        );

    /*
    const formatDay = d =>
        ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()];
    const countDay = d => d.getUTCDay();

    year
        .append("g")
        .attr("text-anchor", "end")
        .selectAll("text")
        .data(d3.range(7).map(i => new Date(1995, 0, i)))
        .join("text")
        .attr("x", -5)
        .attr("y", d => (countDay(d) + 0.5) * cellSize)
        .attr("dy", "0.31em")
        .attr("font-size", 12)
        .text(formatDay);

    year
        .append("g")
        .selectAll("rect")
        .data(d => d.values)
        .join("rect")
        .attr("width", cellSize - 1.5)
        .attr("height", cellSize - 1.5)
        .attr(
        "x",
        (d, i) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 10
        )
        .attr("y", 0.5)
        .attr("fill", d => colorFn(d.value))
        .append("title")
        .text(d => `${formatDate(d.date)}: ${d.value.toFixed(2)}`);

    // .attr("y", d => countDay(d.date) * cellSize + 0.5)
    */

    const legend = group
        .append("g")
        .attr(
        "transform",
        `translate(10, ${years.length * yearHeight + legendPadding})`
        );

    const categoriesCount = 10;
    const categories = [...Array(categoriesCount)].map((_, i) => {
        const upperBound = (maxValue / categoriesCount) * (i + 1);
        const lowerBound = (maxValue / categoriesCount) * i;

        return {
            upperBound,
            lowerBound,
            color: legendColorFn(upperBound / maxValue),
            selected: true
        };
    });

    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    };

    function toggle(event) {

        const lowerBound = event.srcElement.__data__.lowerBound;
        const upperBound = event.srcElement.__data__.upperBound;

        const highlightedDates = years.map(y => ({
            key: y.key,
            values: y.values.filter(v => v.totalCount > lowerBound && v.totalCount <= upperBound)
        }));

        const otherDates = years.map(y => ({
            key: y.key,
            values: y.values.filter(v => v.totalCount <= lowerBound || v.totalCount > upperBound)
        }));

        year
        .data(highlightedDates)
        .selectAll("rect")
        .data(d => d.values)
        .transition()
        .duration(500)
        .attr("fill", d => colorFn(d.totalCount));

        year
        .data(otherDates)
        .selectAll("rect")
        .data(d => d.values)
        .transition()
        .duration(500)
        .attr("fill", backgroundColor);

        sleep(3000).then(() => {
            year
            .data(years)
            .selectAll("rect")
            .data(d => d.values)
            .transition()
            .duration(500)
            .attr("fill", d => colorFn(d.totalCount));
        });

    };

    legend
        .selectAll("rect")
        .data(categories)
        .enter()
        .append("rect")
        .attr("fill", d => d.color)
        .attr("x", (d, i) => legendWidth * i)
        .attr("width", legendWidth)
        .attr("height", 15)
        .on("click", toggle);

    legend
        .selectAll("text")
        .data(categories)
        .join("text")
        .attr("transform", "rotate(90)")
        .attr("y", (d, i) => -legendWidth * i)
        .attr("dy", -30)
        .attr("x", 18)
        .attr("text-anchor", "start")
        .attr("font-size", 11)
        .text(d => `${d.lowerBound.toFixed(2)} - ${d.upperBound.toFixed(2)}`);

    legend
        .append("text")
        .attr("dy", -5)
        .attr("font-size", 14)
        .attr("text-decoration", "underline")
        .text("Click on category to select/deselect days");
};