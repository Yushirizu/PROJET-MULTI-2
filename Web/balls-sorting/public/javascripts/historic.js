$(() => {
	let barChart = null;

	$("#session").change(function (e) {
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: "/api/getSessionValues",
			data: { idSession: e.currentTarget.value },
			dataType: "json",
			success: function (response) {
				$("#mesures").empty();
				let labels = [];
				let valuesPink = [];
				let valuesYellow = [];
				let valuesOthers = [];

				response.forEach((measure) => {
					const row = document.createElement("tr");
					const timestamp = document.createElement("td");
					let date = new Date(measure.time);
					let formattedTime = date.toLocaleTimeString("fr-FR");
					timestamp.innerHTML = formattedTime;
					const valueYellow = document.createElement("td");
					valueYellow.innerHTML = measure.ContainerValues.valueYellow;
					const valuePink = document.createElement("td");
					valuePink.innerHTML = measure.ContainerValues.valuePink;
					const valueOthers = document.createElement("td");
					valueOthers.innerHTML = measure.ContainerValues.valueOthers;

					// Create the row
					row.appendChild(timestamp);
					row.appendChild(valueYellow);
					row.appendChild(valuePink);
					row.appendChild(valueOthers);
					$("#measures").append(row);

					labels.push(formattedTime);
					valuesYellow.push(measure.ContainerValues.valueYellow);
					valuesPink.push(measure.ContainerValues.valuePink);
					valuesOthers.push(measure.ContainerValues.valueOthers);
				});
				let data = {
					labels: labels,
					datasets: [
						{
							label: "Yellow",
							data: valuesYellow,
							backgroundColor: "rgba(255, 255, 0, 0.2)",
						},
						{
							label: "Pink",
							data: valuesPink,
							backgroundColor: "rgba(255, 192, 203, 0.2)",
						},
						{
							label: "Others",
							data: valuesOthers,
							backgroundColor: "rgba(0, 0, 255 , 0.2)",
						},
					],
				};

				if (barChart === null) {
					const graph = $("#graph");
					barChart = new Chart(graph, {
						type: "bar",
						data: data,
					});
				} else {
					barChart.data = data;
					barChart.update();
				}
			},
		});
	});
});
