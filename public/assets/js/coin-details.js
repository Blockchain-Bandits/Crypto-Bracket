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
            if(totalCost > 0 && totalUnits > 0) {
                $("#coins").append(
                    "<tr class='get-details' id='" + tableData[i].coin + "'><td>" + tableData[i].coin +
                    "</td><td>$" + avgCost.toFixed(4) +
                    "</td><td>$" + price.toFixed(4) +
                    "</td><td>" + totalUnits.toFixed(4) +
                    "</td><td>$" + totalCost.toFixed(4) +
                    "</td><td>$" + unitDiff.toFixed(4) +
                    "</td><td>$" + totalDiff.toFixed(4) +
                    "</td><td>" + percent.toFixed(2) + "%</td></tr>"
                );
            }
        }
    });

    $(document).on("click", ".get-details", function() {
        var coin = $(this).attr("id");
        window.location.href = currentURL + `/transactions?coin=${coin}`
    });

    $("#upload").on("submit", function(event) {
        event.preventDefault();
        $("#submit").val("Uploading...");
        var files = document.getElementById("file").files;
        var file = files[0];
        var formData = new FormData();
        formData.append('orders', file);        
        // $.ajax({ 
        //     url: currentURL + '/upload',
        //     method: "POST",
        //     data: formData
        // })
        // .done(function() {
        //     window.location.href = currentURL + '/coins'
        // });
        var xhr = new XMLHttpRequest();     
        // Create a new XMLHttpRequest
        xhr.open('POST', '/upload', true);  
        // File Location, this is where the data will be posted
        xhr.send(formData);
        xhr.onload = setTimeout(function () {
            $("#coins").append("<button id='reload'>Load Coins</button>");
        }, 30000);
    });

    $(document).on("click", "#reload", function () {
        window.location.href = currentURL + '/coins';
    });
});