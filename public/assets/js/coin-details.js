$(document).ready(function() {
    var currentURL = window.location.origin;

    $.ajax({ url: currentURL + '/api/coins', method: "GET" })
    .done(function(tableData) {

        // Here we then log the data to console, where it will show up as an object.
        console.log(tableData);
        
        // Loop through and display each of the customers
        for (var i = 0; i < tableData.length; i++) {
            var price = tableData[i].price;
            var totalCost = tableData[i].totalCost;
            var totalUnits = tableData[i].totalUnits;
            var avgCost = totalCost / totalUnits;
            var unitDiff = price - avgCost;
            var totalDiff = unitDiff * totalUnits;
            var percent = (totalDiff / totalCost) * 100;
            if(totalUnits > 0) {
                $("#coins").append(
                    "<tr class='get-details' id='" + tableData[i].coin + "'><td>" + tableData[i].coin +
                    "</td><td>$" + avgCost.toFixed(2) +
                    "</td><td>$" + price.toFixed(2) +
                    "</td><td>" + totalUnits.toFixed(2) +
                    "</td><td>$" + totalCost.toFixed(2) +
                    "</td><td>$" + unitDiff.toFixed(2) +
                    "</td><td>$" + totalDiff.toFixed(2) +
                    "</td><td>" + percent.toFixed(2) + "%</td></tr>"
                );
            }
        }
    });

    $(document).on("click", ".get-details", function() {
        var coin = $(this).attr("id");
        window.location.href = currentURL + `/transactions?coin=${coin}`
    })
});