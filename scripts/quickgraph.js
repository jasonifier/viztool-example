var dataset;
var chart;
const colorMapping = [
    {group: 1, color: "#013ee7"},
    {group: 2, color: "#f51601"},
    {group: 3, color: "#eee600"},
    {group: 4, color: "#5d9f2d"},
    {group: 5, color: "#555555"}
];

$(document).ready(function(){
    $("#myButton").on("click", buttonClick);
    // $("#updateGraph").on("click", buttonUpdateFunction);
    $('input[name="datefilter"]').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    });
    $('input[name="datefilter"]').on('apply.daterangepicker', function(e, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
        document.getElementById("startDate").innerHTML = picker.startDate.format("YYYY-MM-DD").toString();
        document.getElementById("endDate").innerHTML = picker.endDate.format("YYYY-MM-DD").toString();
        updateFunction();
    });
    $('input[name="datefilter"]').on('cancel.daterangepicker', function(e, picker) {
        $(this).val("Select a Date Range ...");
    });
});

function updateFunction() {
    var startDate = $("#startDate").text();
    var endDate = $("#endDate").text();
    var startDatePadded = `${startDate} 00:00:00`;
    var endDatePadded = `${endDate} 23:59:59`;
    const filteredDataset = filterGraph(
        {
            nodes: [...dataset.nodes],
            links: [...dataset.links]
        },
        {
            startTimestamp: startDatePadded,
            endTimestamp: endDatePadded,
        }
    );
    console.log(filteredDataset);
    $("#linkGraph").empty();
    createViz(filteredDataset);
    addFeatures();
};

function createListItem(text){
    var $listItem = $("<li>", {
        html: `${text}`,
        class: "list-group-item list-group-item-light"
    });
    return $listItem
};

function addFeatures(){
    $("#nodeBox").empty();
    var $nodeList = $("<ul>", {
        class: "list-group"
    });
    $nodeList.append(createListItem("<strong>test 1</strong>"));
    $nodeList.append(createListItem("test 2"));
    $nodeList.append(createListItem("test 3"));

    var $nodeSpan = $("<span>", {
        html: "<br>Node Data View:<br>",
        id: "nodeDetails"
    });
    $nodeSpan.append($nodeList);
    $("#nodeBox").append($nodeSpan);
    var $lineBreak = $("<br>");
    $("#nodeBox").append($lineBreak);

    var $tableFilterButton = $("<button>", {
        text: "Filter Table",
        id: "nodeButton",
        class: "btn btn-info",
        type: "button"
    });
    $("#nodeBox").append($tableFilterButton);
    $("#nodeBox").removeAttr("style");
    $("#nodeBox").attr("style", "display: inline;");
};

function filterGraph({nodes, links}, {startTimestamp, endTimestamp}) {
    const filteredLinks = links.filter(link => link.timestamp >= startTimestamp && link.timestamp <= endTimestamp);
    const newNodes = new Set();
    filteredLinks.forEach(function(e){
        newNodes.add(e.source);
        newNodes.add(e.target);
    });
    const filteredNodes = nodes.filter(node => newNodes.has(node.id));
    return {
        nodes: [...filteredNodes],
        links: [...filteredLinks]
    };
};

function readJsonFile(filepath) {
    var client = new XMLHttpRequest();
    client.overrideMimeType("application/json");
    client.open("GET", filepath, true);
    client.send();
    let result;
    const p = new Promise((r) => result = r);
    client.onreadystatechange = () => {
        if (client.readyState === XMLHttpRequest.DONE) {
            result(JSON.parse(client.responseText));
        }
    };
    return p;
};

/*
function getTableData(filepath, callback) {
    var client = new XMLHttpRequest();
    client.overrideMimeType("application/json");
    client.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            callback(this);
        }
    };
    client.open("GET", filepath, true);
    client.send();
};

function processTableData(client) {
    buildTable(JSON.parse(client.responseText));
}
*/

async function fetchGraphData(filepath) {
    // console.log("Starting HTTP request for JSON file. [1]");
    // dataset = await readJsonFile("data/testdata.json");
    // console.log("Finished HTTP request for JSON file. [1]");
    // buildTable(dataset);
    console.log("Starting HTTP request for JSON file. [2]");
    dataset = await readJsonFile(filepath);
    console.log("Finished HTTP request for JSON file. [2]");
    createViz(dataset);
    addFeatures();
};

function buttonClick() {
    $("#myButton").toggleClass("btn-success");
    const text = $("#myButton").text();
    const SPAN_HTML = "<span id=loadingSpin></span>";
    const LOADING = " Loading ... ";
    const BUTTON  = "Import Data";
    if (text === BUTTON){
        $("#myButton").empty().append(SPAN_HTML);
        $("#myButton").attr('class', 'btn text-light').append(LOADING);
        $("#loadingSpin").addClass("spinner-border spinner-border-sm");
        $("#linkGraph").empty();
        // getTableData("data/testdata.json", processTableData);
        // test new data file here
        fetchGraphData("data/ticketdata.json");
        setTimeout(() => {
            $("#myButton").attr('class', 'btn btn-success').html(BUTTON);
          }, 2000);
    };
    // show for the date picker and node box
    var datePicker = document.getElementById("datepicker");
    if (datePicker.style.display === "none") {
        datePicker.style.display = "inline";
    };
    // var nodeBox = document.getElementById("nodeBox");
    // if (nodeBox.style.display === "none") {
    //     nodeBox.style.display = "inline";
    // };
};

function createViz(data) {
    // console.log('Building link graph from dataset.');
    const customColors = new Array();
    // select appropriate colors for display of nodes
    const groups = new Set();
    data.nodes.forEach(v => groups.add(v.group));
    const groupArray = Array.from(groups);
    // sort in ascending order and get colors from mapping
    groupArray.sort((a, b) => a - b);
    groupArray.forEach(function(g){
        for (idx in colorMapping) {
            const m = colorMapping[idx];
            if (m.group === g){
                customColors.push(m.color);
            };
        }
    });
    // create and display d3 chart
    chart = d3ForceGraph(data, {
        nodeId: d => d.id,
        nodeGroup: d => d.group,
        nodeTitle: d => d.text,
        nodeRadius: 10,
        nodeStrokeWidth: 2.0,
        linkStroke: "#000",
        linkStrokeWidth: 2.0,
        colors: customColors,
        width: 1250,
        height: 500
      });
    d3.select("#linkGraph").node().append(chart);
    $("#linkGraph").addClass("bg-light rounded border border-dark");
};