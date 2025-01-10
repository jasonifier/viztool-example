var tableData;

$(document).ready(function(){
    $("#myButton").on("click", buttonClick);
    $("#searchBar").on("keyup", searchBarFunction);
    tableData = [
        {"name": "John Doe", "email": "john@example.com"},
        {"name": "Mary Moe", "email": "mary@hotmail.com"},
        {"name": "July Dooley", "email": "july@greatemail.com"},
        {"name": "Anja Ravendale", "email": "a_raven@proton.co.uk"}
    ];
});

function searchBarFunction() {
    var value = $(this).val().toLowerCase();
    $("#dataTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
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
        buildTable(tableData);
        setTimeout(() => {
            $("#myButton").attr('class', 'btn btn-success').html(BUTTON);
          }, 2000);
    };
};

function buildTable(data) {
    const header_begin = '<thead><tr><th><strong>NAME</strong></th>';
    const header_end   = '<th><strong>EMAIL</strong></th></tr></thead>';
    var header = header_begin + header_end;
    console.log('Building table from dataset.');

    // add styling to table
    var tableClassArray = [
        'table',
        'table-bordered',
        'table-striped',
        'table-hover',
        'table-dark'
    ];
    $.each(tableClassArray, function(_, value) {
        $("#htmlTable").addClass(value);
    });

    // add table row data
    var html_text = '';
    $.each(data, function(_, value) {
        html_text += '<tr>';
        for (var key in value) {
            html_text += '<td>' + value[key] + '</td>';
        }
        html_text += '</tr>';
    });
    $('#dataTable').empty();

    setTimeout(() => {
        $('#dataTable').append(html_text);
      }, 1000);

    // show the table header
    if ($("#headerTable").attr('class') === 'text-hide') {
        $("#headerTable").attr('class', 'text-left');
    };
};