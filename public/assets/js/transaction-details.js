// Get the location of the root page.
var currentURL = window.location.origin;

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
        
        // The AJAX function uses the URL of our API to GET the data associated with it (initially set to localhost)
        $.ajax({ url: currentURL + `/api/transactions/${coin}/${method}`, method: "GET" })
        .done(function(tableData) {

            // Here we then log the data to console, where it will show up as an object.
            console.log(tableData);
            
            var length = tableData.length - 1;
            // Loop through and display each of the customers
            for (var i = 0; i < length; i++) {
                var unitDiff = tableData[length].currentPrice - tableData[i].cost;
                var totalDiff = unitDiff * tableData[i].units;
                var percent = tableData[i].units < 0 ? "" : ((tableData[i].total_cost + totalDiff) / tableData[i].total_cost) * 100;
                $("#transactions").append("<tr><td>" + tableData[i].date +
                    "</td><td>$" + tableData[i].cost.toFixed(2) +
                    "</td><td>$" + tableData[i].price.toFixed(2) +
                    "</td><td>$" + tableData[i].units.toFixed(2) +
                    "</td><td>$" + tableData[i].total_cost.toFixed(2) +
                    "</td><td>$" + unitDiff.toFixed(2) +
                    "</td><td>$" + totalDiff.toFixed(2) +
                    "</td><td>" + percent.toFixed(2) + "%</td></tr>"
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