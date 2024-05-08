$(() => {
	// Define the chart outside the setInterval function
	const ctx = document.getElementById("graph").getContext("2d");
	const barChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: ["Yellow", "Pink", "Others"],
			datasets: [
				{
					label: "Balls count",
					data: [0, 0, 0],
					backgroundColor: [
						"rgba(255, 255, 0, 0.2)",
						"rgba(255, 192, 203, 0.2)",
						"rgba(0, 0, 255 , 0.2)",
					],
					borderColor: [
						"rgba(255, 255, 0, 0.2)",
						"rgba(255, 192, 203, 0.2)",
						"rgba(0, 0, 255 , 0.2)",
					],
					borderWidth: 1,
				},
			],
		},
	});

	setInterval(() => {
		$.ajax({
			type: "post",
			url: "/api/state",
			dataType: "json",
			success: function (response) {
				console.log(response);
				if (response.lastTimestamp === null) {
					$("#timestamp").text("...waiting...");
					$("#measureYellow").text("nA");
					$("#measurePink").text("nA");
					$("#measureOther").text("nA");
					$("#measure").text("empty");
				}
				$("#timestamp").text(response.lastTimestamp);
				$("#measureYellow").text(response.lastAcquisitionYellow);
				$("#measurePink").text(response.lastAcquisitionPink);
				$("#measureOther").text(response.lastAcquisitionOther);
				if (
					response.lastAcquisitionYellow +
						response.lastAcquisitionPink +
						response.lastAcquisitionOther ===
					0
				) {
					$("#measure").text("empty");
				} else {
					$("#measure").text(
						response.lastAcquisitionYellow +
							response.lastAcquisitionPink +
							response.lastAcquisitionOther +
							" balls total"
					);
				}
				$("#state").text(response.idle ? "IDLE" : "recording...");
				if (response.idle) {
					$("#start").show();
					$("#stop").hide();
				} else {
					$("#start").hide();
					$("#stop").show();
				}

				// Update the chart data
				barChart.data.datasets[0].data[0] = response.lastAcquisitionYellow;
				barChart.data.datasets[0].data[1] = response.lastAcquisitionPink;
				barChart.data.datasets[0].data[2] = response.lastAcquisitionOther;

				// Update the chart
				barChart.update();
			},
		});
	}, 1000);
});

$("#start").click(function (e) {
	e.preventDefault();
	$.post("/api/start", function (data, textStatus, jqXHR) {}, "json");
});

$("#stop").click(function (e) {
	e.preventDefault();
	$.post("/api/stop", function (data, textStatus, jqXHR) {}, "json");
});

$("#reset").click(function (e) {
	e.preventDefault();
	$.post("/api/reset", function (data, textStatus, jqXHR) {}, "json");
});
