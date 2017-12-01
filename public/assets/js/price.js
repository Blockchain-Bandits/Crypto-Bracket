var bittrex = require('node-bittrex-api');
// Get the location of the root page.
var currentURL = window.location.origin;

$(function() {
    $.ajax({ url: currentURL + "/api/transactions", method: "GET" })
    .done(function(tableData) {

        // Here we then log the data to console, where it will show up as an object.
        console.log(tableData);
        console.log("------------------------------------");

        // Loop through and display each of the customers
        for (var i = 0; i < tableData.length; i++) {
            $("#select-coin").append("<option value='" + tableData[i].coin + "'>" + tableData[i].coin + "</option>");
        }
    });

    function runTableQuery(coin, method) {
        $("#transactions").empty();
        var price;
        bittrex.getticker( { market : `BTC-${coin}` }, function( data, err ) {
            price = data.result.Last;
        });
        // The AJAX function uses the URL of our API to GET the data associated with it (initially set to localhost)
        $.ajax({ url: currentURL + `/api/transactions/${coin}/${method}`, method: "GET" })
        .done(function(tableData) {

            // Here we then log the data to console, where it will show up as an object.
            console.log(tableData);
            console.log("------------------------------------");

            // Loop through and display each of the customers
            for (var i = 0; i < tableData.length; i++) {
                var unitDiff = price - tableData[i].cost;
                var totalDiff = unitDiff * tableData[i].units;
                var percent = ((tableData[i].total_cost + totalDiff) / tableData[i].total_cost) * 100;
                $("#transactions").append("<tr><td>" + tableData[i].date +
                    "</td><td>" + tableData[i].cost +
                    "</td><td>" + tableData[i].price +
                    "</td><td>" + tableData[i].units +
                    "</td><td>" + tableData[i].total_cost +
                    "</td><td>" + unitDiff +
                    "</td><td>" + totalDiff +
                    "</td><td>" + percent + "</td></tr>"
                );
            }
        });
    }

    $("#select-form").on("submit", function() {
        event.preventDefault();
        var coin = $("#select-coin").val();
        var method = $("#select-method").val();
        runTableQuery(coin, method);
    });
});