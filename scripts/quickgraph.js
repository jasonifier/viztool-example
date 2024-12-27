var dataset;
var chart;

$(document).ready(function(){
    $("#myButton").on("click", buttonClick);
    $("#submit").on("click", buttonApplyFunction);
});

function buttonApplyFunction() {
    var inputDate = $("#date").val();
    var inputDatePadded = `${inputDate} 00:00:00`;
    console.log(inputDatePadded);
    const filteredDataset = filterGraph(
        {
            nodes: [...dataset.nodes],
            links: [...dataset.links]
        },
        {
            timestamp: inputDatePadded
        }
    );
    console.log(filteredDataset);
    $("#linkGraph").empty();
    createViz(filteredDataset);
};

function filterGraph({nodes, links}, {timestamp}) {
    const filteredLinks = links.filter(link => link.timestamp > timestamp);
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
    // toggle hide and show for the date picker
    var datePicker = document.getElementById("datepicker");
    if (datePicker.style.display === "none") {
        datePicker.style.display = "inline";
      } else {
        datePicker.style.display = "none";
      }
};

function createViz(data) {
    console.log('Building link graph from dataset.');
    // const customColors = [(blue), (red), (yellow), (green), (gray)];
    const customColors = ["#013ee7", "#f51601", "#eee600", "#5d9f2d", "#555555"];
    chart = d3ForceGraph(data, {
        nodeId: d => d.id,
        nodeGroup: d => d.group,
        nodeTitle: d => d.text,
        nodeRadius: 10,
        nodeStrokeWidth: 2.0,
        linkStroke: "#000",
        linkStrokeWidth: 2.0,
        colors: customColors,
        width: 1200,
        height: 700
      });
    d3.select("#linkGraph").node().append(chart);
    $("#linkGraph").addClass("bg-light rounded border border-dark");
};