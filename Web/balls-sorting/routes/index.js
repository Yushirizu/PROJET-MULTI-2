var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const e = require("express");

//---------Connection to the arduino---------

const port = "COM14";
//const port = "/dev/ttyUSB0";

const arduino = new SerialPort({
	path: port,
	baudRate: 9600,
});

arduino.on("error", (err) => {
	console.log("Error with arduino connection :", err);
});

//---------State of the system---------

const etat = {
	lastTimestamp: 0,
	lastAcquisitionPink: NaN,
	lastAcquisitionYellow: NaN,
	lastAcquisitionOther: NaN,
	idle: true,
};

let currentSession = null;

//---------Data acquisition---------

const parser = arduino.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", (data) => {
	etat.lastTimestamp = new Date();
	// Split the data into value pink, value yellow and value other
	const valueYellow = data.split(",")[0];
	const valuePink = data.split(",")[1];
	const valueOther = data.split(",")[2];
	etat.lastAcquisitionPink = Number(valuePink);
	etat.lastAcquisitionYellow = Number(valueYellow);
	etat.lastAcquisitionOther = Number(valueOther);
	// Save the data in the database
	if (etat.idle === false && currentSession) {
		console.log(etat);
		prisma.containerValues
			.create({
				data: {
					valuePink: etat.lastAcquisitionPink,
					valueYellow: etat.lastAcquisitionYellow,
					valueOthers: etat.lastAcquisitionOther,
				},
			})
			.then((containerValues) => {
				console.log("ContainerValues created:", containerValues);
				return prisma.measure.create({
					data: {
						idSession: currentSession.idSession,
						time: etat.lastTimestamp,
						idContainerValues: containerValues.idContainerValues,
					},
				});
			})
			.then((measure) => {
				console.log("Measure created:", measure);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}
});

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", {});
});

router.get("/log", async (req, res, next) => {
	const sessions = await prisma.session.findMany();
	res.render("historic", { sessions: sessions });
});

/*------Get the values of the last acquisition------*/

router.post("/api/getSessionValues", (req, res, next) => {
	const idSession = Number(req.body.idSession);
	console.log("idSession:", idSession);
	prisma.measure
		.findMany({
			where: {
				idSession: idSession,
			},
			include: {
				ContainerValues: true,
			},
		})
		.then((val) => {
			console.log("Fetched measures:", val);
			res.status(200).json(val);
		})
		.catch((error) => {
			console.error("Error fetching measures:", error);
		});
});

/*------Start the data acquisition------*/

router.post("/api/start", (req, res, next) => {
	if (etat.idle === true) {
		etat.idle = false;
		startLogging();
		res.status(200).send();
	} else {
		res.status(403).send();
	}
});

/*------Stop the data acquisition------*/

router.post("/api/stop", (req, res, next) => {
	if (etat.idle === false) {
		etat.idle = true;
		stopLogging();
		res.status(200).send();
	} else {
		res.status(403).send();
	}
});

/*------Send reset to the arduino----------*/

router.post("/api/reset", (req, res, next) => {
	arduino.write("RESET");
	reset();
	res.status(200).send();
});

router.post("/api/state", (req, res, next) => {
	console.log(req.body);
	res.status(200).json(etat);
});

async function startLogging() {
	currentSession = await prisma.session.create({});
	console.log(currentSession);
}

/*------Reset the values of the last acquisition------*/

function reset() {
	etat.lastAcquisitionPink = 0;
	etat.lastAcquisitionYellow = 0;
	etat.lastAcquisitionOther = 0;
	etat.idle = true;
}

/*------Stop the data acquisition------*/

function stopLogging() {
	prisma.session
		.update({
			// Update the stop time of the current session
			where: {
				idSession: currentSession.idSession,
			},
			data: {
				stop: new Date(),
			},
		})
		.then((v) => {
			currentSession = null;
			console.log("Session " + v.idSession + " closed");
		});
}

module.exports = router;
