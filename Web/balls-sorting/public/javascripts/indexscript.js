$(() => {
	// Create the chart
	const graph = $("#graph");
	const yellowDataset = {
		label: "Yellow Balls count",
		data: [0],
		backgroundColor: ["rgba(255, 255, 0, 0.2)"],
		borderColor: ["rgba(255, 255, 0, 0.2)"],
		borderWidth: 1,
	};

	const pinkDataset = {
		label: "Pink Balls count",
		data: [0],
		backgroundColor: ["rgba(255, 192, 203, 0.2)"],
		borderColor: ["rgba(255, 192, 203, 0.2)"],
		borderWidth: 1,
	};

	const othersDataset = {
		label: "Other Balls count",
		data: [0],
		backgroundColor: ["rgba(0, 0, 255 , 0.2)"],
		borderColor: ["rgba(0, 0, 255 , 0.2)"],
		borderWidth: 1,
	};

	const barChart = new Chart(graph, {
		type: "bar",
		data: {
			labels: ["Total balls count"],
			datasets: [yellowDataset, pinkDataset, othersDataset],
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
				} else {
					// Display the last timestamp and the last measures
					$("#timestamp").text(response.lastTimestamp);
					$("#measureYellow").text(response.lastAcquisitionYellow);
					$("#measurePink").text(response.lastAcquisitionPink);
					$("#measureOther").text(response.lastAcquisitionOther);
				}
				// Display the total number of balls
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
				// Update the state
				$("#state").text(response.idle ? "IDLE" : "recording...");
				// Update the buttons
				if (response.idle) {
					$("#start").show();
					$("#stop").hide();
				} else {
					$("#start").hide();
					$("#stop").show();
				}

				// Update the chart data
				barChart.data.datasets[0].data = [response.lastAcquisitionYellow];
				barChart.data.datasets[1].data = [response.lastAcquisitionPink];
				barChart.data.datasets[2].data = [response.lastAcquisitionOther];

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
