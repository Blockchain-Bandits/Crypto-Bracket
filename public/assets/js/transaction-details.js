$(document).ready(function() {
    var currentURL = window.location.origin;
    var getCoin = window.location.href.split("=");
    var coin = getCoin[1];
    
    runTableQuery(coin, 'avg');

    $.ajax({ url: currentURL + "/api/transactions", method: "GET" })
    .done(function(tableData) {

        // Here we then log the data to console, where it will show up as an object.
        console.log(tableData);
        console.log("------------------------------------");

        // Loop through and display each of the customers
        for (var i = 0; i < tableData.length; i++) {
            $("#select-coin").append("<option value='" + tableData[i].coin + "'>" + tableData[i].coin + "</option>");
        }
        $("#select-coin").val(coin);
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
                var date = moment(tableData[i].date).format("MM/DD/YY");
                var price = tableData[i].units < 0 ? tableData[i].price : tableData[length].currentPrice;
                var unitDiff = price - tableData[i].cost;
                var totalDiff = unitDiff * tableData[i].units;
                var percent = tableData[i].units < 0 ? "" : ((totalDiff / tableData[i].total_cost) * 100).toFixed(2) + "%" ;
                $("#transactions").append(
                    "<tr><td>" + date +
                    "</td><td>$" + Math.round(tableData[i].cost * 10000) / 10000 +
                    "</td><td>$" + Math.round(price * 10000) / 10000 +
                    "</td><td>$" + tableData[i].rate +
                    "</td><td>" + tableData[i].units +
                    "</td><td>$" + Math.round(tableData[i].total_cost * 10000) / 10000 +
                    "</td><td>$" + unitDiff.toFixed(4) +
                    "</td><td>$" + totalDiff.toFixed(2) +
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