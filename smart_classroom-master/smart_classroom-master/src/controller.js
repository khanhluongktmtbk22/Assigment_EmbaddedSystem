// import { StatusCodes } from "http-status-codes";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import { dataBase } from "./server.js";
// import { ObjectId } from "mongodb";

// async function login(req, res) {
//   try {
//     if (req.cookies.token) throw new Error("You are already logged in");
//     const data = req.body;
//     const user = await dataBase
//       .collection("users")
//       .findOne({ username: data.username });
//     if (!user) throw new Error("User not found!");

//     const isValid = await bcrypt.compare(data.password, user.password);
//     if (!isValid) throw new Error("Password is incorrect!");

//     delete user.password;
//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
//     res.cookie("token", token);
//     res.status(StatusCodes.OK).json(user);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function register(req, res) {
//   try {
//     const data = req.body;
//     const user = await dataBase
//       .collection("users")
//       .findOne({ username: data.username });
//     if (user) throw new Error("Username already exists!");
//     const halt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(data.password, halt);
//     data.password = hashedPassword;

//     const result = await dataBase.collection("users").insertOne(data);
//     delete data.password;
//     data._id = result.insertedId;
//     res.status(StatusCodes.CREATED).json(data);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function logout(req, res) {
//   try {
//     res.clearCookie("token");
//     res.status(StatusCodes.OK).json({ message: "Logout success" });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// let fan = {
//   name: "fan",
//   isActive: false,
//   auto: false,
//   speed: 2,
//   tempThreshold: 35,
//   humidityThreshold: 60,
// };

// let light = {
//   name: "light",
//   isActive: false,
//   auto: false,
//   brightness: 2,
//   lightThreshold: 300,
// };

// let microphone = {
//   name: "microphone",
//   isActive: false,
// };

// async function getDeviceByName(req, res) {
//   try {
//     const name = req.params.name;
//     let device;
//     switch (name) {
//       case "fan":
//         device = fan;
//         break;
//       case "light":
//         device = light;
//         break;
//       case "microphone":
//         device = microphone;
//         break;
//       default:
//         throw new Error("Device not found");
//     }
//     res.status(StatusCodes.OK).json(device);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function toggleDevice(req, res) {
//   try {
//     const name = req.params.name;
//     let device;
//     let action = "";
//     switch (name) {
//       case "fan":
//         fan.isActive = !fan.isActive;
//         device = fan;
//         action = fan.isActive
//           ? `Turn on fan speed ${fan.speed}`
//           : "Turn off fan";
//         break;
//       case "light":
//         light.isActive = !light.isActive;
//         device = light;
//         action = light.isActive
//           ? `Turn on light brightness ${light.brightness}`
//           : "Turn off light";
//         break;
//       case "microphone":
//         microphone.isActive = !microphone.isActive;
//         device = microphone;
//         action = microphone.isActive
//           ? "Turn on microphone"
//           : "Turn off microphone";
//         break;
//       default:
//         throw new Error("Device not found");
//     }
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);
//     res.status(StatusCodes.OK).json(device);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function autoDevice(req, res) {
//   try {
//     const name = req.params.name;
//     let device;
//     let action = "";
//     switch (name) {
//       case "fan":
//         fan.auto = !fan.auto;
//         device = fan;
//         action = fan.auto ? "Turn on fan auto mode" : "Turn off fan auto mode";
//         break;
//       case "light":
//         light.auto = !light.auto;
//         device = light;
//         action = light.auto
//           ? "Turn on light auto mode"
//           : "Turn off light auto mode";
//         break;
//       default:
//         throw new Error("Device not found or not support auto mode");
//     }
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);
//     res.status(StatusCodes.OK).json(device);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function setDeviceLevel(req, res) {
//   try {
//     if (!req.body) throw new Error("Body is required");
//     const name = req.params.name;
//     const level = req.body.level;
//     if (level === undefined) throw new Error("Level is required");
//     if (level < 1 || level > 3)
//       throw new Error("Level must be between 1 and 3");
//     let device;
//     let action = "";
//     switch (name) {
//       case "fan":
//         if (!fan.isActive) throw new Error("Fan is not active");
//         fan.speed = level;
//         device = fan;
//         action = `Turn on fan speed ${fan.speed}`;
//         break;
//       case "light":
//         if (!light.isActive) throw new Error("Light is not active");
//         light.brightness = level;
//         device = light;
//         action = `Turn on light brightness ${light.brightness}`;
//         break;
//       default:
//         throw new Error("Device not found or not support set level");
//     }
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);
//     res.status(StatusCodes.OK).json(device);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function setDeviceThreshold(req, res) {
//   try {
//     if (!req.body) throw new Error("Body is required");
//     const name = req.params.name;
//     let device;
//     let action = "";
//     switch (name) {
//       case "fan":
//         const tempThreshold = req.body.tempThreshold;
//         const humidityThreshold = req.body.humidityThreshold;
//         if (tempThreshold === undefined || humidityThreshold === undefined)
//           throw new Error("tempThreshold and humidityThreshold are required");
//         if (tempThreshold < 0 || tempThreshold > 100)
//           throw new Error("Temperature threshold must be between 0 and 100");
//         if (humidityThreshold < 0 || humidityThreshold > 100)
//           throw new Error("Humidity threshold must be between 0 and 100");
//         fan.tempThreshold = tempThreshold;
//         fan.humidityThreshold = humidityThreshold;
//         device = fan;
//         action = `Set fan activation thresholds to ${fan.tempThreshold}°C or ${fan.humidityThreshold}%`;
//         break;
//       case "light":
//         const lightThreshold = req.body.lightThreshold;
//         if (lightThreshold === undefined)
//           throw new Error("lightThreshold is required");
//         if (lightThreshold < 0 || lightThreshold > 1000)
//           throw new Error("Light threshold must be between 0 and 1000");
//         light.lightThreshold = lightThreshold;
//         device = light;
//         action = `Set light activation threshold to ${light.lightThreshold}`;
//         break;
//       default:
//         throw new Error("Device not found or not support set threshold");
//     }
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);
//     res.status(StatusCodes.OK).json(device);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function resetDeviceThreshold(req, res) {
//   try {
//     const name = req.params.name;
//     let device;
//     let action = "";
//     switch (name) {
//       case "fan":
//         fan.tempThreshold = 35;
//         fan.humidityThreshold = 60;
//         device = fan;
//         action = `Reset fan activation thresholds to ${fan.tempThreshold}°C or ${fan.humidityThreshold}%`;
//         break;
//       case "light":
//         light.lightThreshold = 300;
//         device = light;
//         action = `Reset light activation threshold to ${light.lightThreshold}`;
//         break;
//       default:
//         throw new Error("Device not found or not support reset threshold");
//     }
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);
//     res.status(StatusCodes.OK).json(device);
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// let streamSensorResList = new Set();

// async function streamSensor(req, res) {
//   console.log("Client connected to api/stream/sensor");
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   streamSensorResList.add(res);

//   // const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

//   res.on("close", () => {
//     console.log("Client disconnected from api/stream/sensor");
//     // clearInterval(hb);
//     streamSensorResList.delete(res);
//     res.end();
//   });
// }

// let streamStatusResList = new Set();

// async function streamStatus(req, res) {
//   console.log("Client connected to api/stream/status");
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   streamStatusResList.add(res);

//   const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

//   res.on("close", () => {
//     console.log("Client disconnected from api/stream/status");
//     clearInterval(hb);
//     streamStatusResList.delete(res);
//     res.end();
//   });
// }

// let dem = 0;

// async function updateSensorData(req, res) {
//   const data = JSON.stringify(req.body);
//   for (const sensorRes of streamSensorResList) {
//     sensorRes.write(["event: sensor", `data: ${data}\n\n`].join("\n"));
//   }

//   res.status(200).send("Sensor data received");

//   // rdata = {
//   //   "TEMP": TEMP,
//   //   "HUMI": HUMI,
//   //   "LIGHT": LIGHT,
//   //   "PRES": PRES
//   // }
//   const rdata = req.body;
//   dem = dem % 5;
//   if (dem == 0) {
//     rdata.time = new Date(Date.now() + 7 * 60 * 60 * 1000);
//     dataBase.collection("sensorData").insertOne(rdata);
//   }
//   dem = dem + 1;

//   if (fan.auto) {
//     let fanFlag = false;
//     let action = "";
//     if (
//       rdata.TEMP >= fan.tempThreshold ||
//       rdata.HUMI <= fan.humidityThreshold
//     ) {
//       if (!fan.isActive) {
//         fanFlag = true;
//         fan.isActive = true;
//         action = "Turn on fan speed " + fan.speed;
//       }
//     } else {
//       if (fan.isActive) {
//         fanFlag = true;
//         fan.isActive = false;
//         action = "Turn off fan";
//       }
//     }
//     if (fanFlag) {
//       let deviceStatus = {
//         fan: fan.isActive,
//         light: light.isActive,
//       };
//       updateDeviceStatus(deviceStatus);

//       const actionHistory = {
//         time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//         action,
//         trigger: "Auto",
//       };
//       dataBase.collection("actionHistory").insertOne(actionHistory);
//     }
//   }

//   if (light.auto) {
//     let lightFlag = false;
//     let action = "";
//     if (rdata.LIGHT <= light.lightThreshold) {
//       if (!light.isActive) {
//         lightFlag = true;
//         light.isActive = true;
//         action = "Turn on light brightness " + light.brightness;
//       }
//     } else {
//       if (light.isActive) {
//         lightFlag = true;
//         light.isActive = false;
//         action = "Turn off light";
//       }
//     }
//     if (lightFlag) {
//       let deviceStatus = {
//         fan: fan.isActive,
//         light: light.isActive,
//       };
//       updateDeviceStatus(deviceStatus);

//       const actionHistory = {
//         time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//         action,
//         trigger: "Auto",
//       };
//       dataBase.collection("actionHistory").insertOne(actionHistory);
//     }
//   }
// }

// async function updateDeviceStatus(data) {
//   // data = {
//   //   fan: false,
//   //   light: true,
//   // };
//   data = JSON.stringify(data);
//   for (const statusRes of streamStatusResList) {
//     statusRes.write(["event: status", `data: ${data}\n\n`].join("\n"));
//   }
// }

// let commandStreamRes = null;

// async function commandStream(req, res) {
//   console.log("Client connected to api/iot/commandStream");
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   commandStreamRes = res;

//   const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

//   res.on("close", () => {
//     console.log("Client disconnected from api/iot/commandStream");
//     clearInterval(hb);
//     commandStreamRes = null;
//     res.end();
//   });
// }

// async function getStudyDuration(req, res) {
//   try {
//     const duration = [2, 1, 3, 5, 7, 4, 0, 6];
//     res.status(StatusCodes.OK).json({ duration });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function getTemperature(req, res) {
//   let duration = req.query.duration || 5;
//   duration = parseInt(duration);
//   if (duration <= 0 || duration > 1440) throw new Error("Duration invalid");
//   const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
//   const startTime = new Date(now.getTime() - duration * 60 * 1000);
//   try {
//     const temperatures = await dataBase
//       .collection("sensorData")
//       .find({ time: { $gte: startTime } })
//       .project({ _id: 0, TEMP: 1, time: 1 })
//       .sort({ time: 1 })
//       .toArray();

//     const step = Math.round(duration / 5);
//     let result = [];
//     for (let i = 0; i < temperatures.length; i += step) {
//       result.push(temperatures[i]);
//     }

//     res.status(StatusCodes.OK).json({ temperatures: result });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function getHumidity(req, res) {
//   let duration = req.query.duration || 5;
//   duration = parseInt(duration);
//   if (duration <= 0 || duration > 1440) throw new Error("Duration invalid");
//   const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
//   const startTime = new Date(now.getTime() - duration * 60 * 1000);
//   try {
//     const humidities = await dataBase
//       .collection("sensorData")
//       .find({ time: { $gte: startTime } })
//       .project({ _id: 0, HUMI: 1, time: 1 })
//       .sort({ time: 1 })
//       .toArray();

//     const step = Math.round(duration / 5);
//     let result = [];
//     for (let i = 0; i < humidities.length; i += step) {
//       result.push(humidities[i]);
//     }
//     res.status(StatusCodes.OK).json({ humidities: result });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function getLightLevel(req, res) {
//   let duration = req.query.duration || 5;
//   duration = parseInt(duration);
//   if (duration <= 0 || duration > 1440) throw new Error("Duration invalid");
//   const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
//   const startTime = new Date(now.getTime() - duration * 60 * 1000);
//   try {
//     const lightLevels = await dataBase
//       .collection("sensorData")
//       .find({ time: { $gte: startTime } })
//       .project({ _id: 0, LIGHT: 1, time: 1 })
//       .sort({ time: 1 })
//       .toArray();

//     const step = Math.round(duration / 5);
//     let result = [];
//     for (let i = 0; i < lightLevels.length; i += step) {
//       result.push(lightLevels[i]);
//     }

//     res.status(StatusCodes.OK).json({ lightLevels: result });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function getActionHistory(req, res) {
//   let page = req.query.page || 1;
//   let limit = req.query.limit || 20;
//   page = parseInt(page);
//   limit = parseInt(limit);
//   const startDate = req.query.startDate;
//   const endDate = req.query.endDate;
//   const skip = (page - 1) * limit;
//   const filter = {};

//   if (startDate && endDate) {
//     filter.time = {
//       $gte: new Date(startDate),
//       $lte: new Date(endDate),
//     };
//   }

//   try {
//     const total = await dataBase
//       .collection("actionHistory")
//       .countDocuments(filter);
//     const totalPages = Math.ceil(total / limit);
//     if (page > totalPages && totalPages !== 0) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         error: "Page number is out of range",
//       });
//     }
//     const actions = await dataBase
//       .collection("actionHistory")
//       .find(filter)
//       .sort({ time: -1 })
//       .skip(skip)
//       .limit(limit)
//       .toArray();
//     res.status(StatusCodes.OK).json({
//       totalPages,
//       actions,
//     });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function configureWifi(req, res) {
//   try {
//     const { ssid, password } = req.body;

//     // Send WiFi configuration to gateway via command stream
//     if (commandStreamRes) {
//       const wifiConfig = {
//         type: "wifi",
//         ssid: ssid,
//         password: password,
//       };
//       const data = JSON.stringify(wifiConfig);
//       commandStreamRes.write([`event: wifi`, `data: ${data}\n\n`].join("\n"));
//       console.log(`WiFi configuration sent to gateway: SSID=${ssid}`);
//     } else {
//       console.warn("No gateway connected to command stream");
//     }

//     // Log to action history
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action: `Configure WiFi network: ${ssid}`,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);

//     res.status(StatusCodes.OK).json({
//       message: "WiFi configuration sent successfully",
//       ssid: ssid,
//     });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// async function configureInterval(req, res) {
//   try {
//     const { interval } = req.body;

//     // Validate interval
//     if (!interval || interval <= 0) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         error: "Data send interval must be a positive number",
//       });
//     }

//     // Send interval configuration to gateway via command stream
//     if (commandStreamRes) {
//       const intervalConfig = {
//         type: "interval",
//         value: interval,
//       };
//       const data = JSON.stringify(intervalConfig);
//       commandStreamRes.write([`event: interval`, `data: ${data}\n\n`].join("\n"));
//       console.log(`Data send interval configuration sent to gateway: ${interval} seconds`);
//     } else {
//       console.warn("No gateway connected to command stream");
//     }

//     // Log to action history
//     const actionHistory = {
//       time: new Date(Date.now() + 7 * 60 * 60 * 1000),
//       action: `Configure data send interval: ${interval}s`,
//       trigger: "Manual",
//     };
//     dataBase.collection("actionHistory").insertOne(actionHistory);

//     res.status(StatusCodes.OK).json({
//       message: "Interval configuration sent successfully",
//       interval: interval,
//     });
//   } catch (err) {
//     const newErr = new Error(err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: err.message,
//       stack: newErr.stack,
//     });
//   }
// }

// export const controllers = {
//   login,
//   register,
//   logout,
//   getDeviceByName,
//   toggleDevice,
//   autoDevice,
//   setDeviceLevel,
//   setDeviceThreshold,
//   resetDeviceThreshold,
//   streamSensor,
//   streamStatus,
//   updateSensorData,
//   commandStream,
//   getStudyDuration,
//   getTemperature,
//   getHumidity,
//   getLightLevel,
//   getActionHistory,
//   configureWifi,
//   configureInterval,
// };
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { dataBase } from "./server.js";
import { ObjectId } from "mongodb";

async function login(req, res) {
  try {
    if (req.cookies.token) throw new Error("You are already logged in");
    const data = req.body;
    const user = await dataBase
      .collection("users")
      .findOne({ username: data.username });
    if (!user) throw new Error("User not found!");

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error("Password is incorrect!");

    delete user.password;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function register(req, res) {
  try {
    const data = req.body;
    const user = await dataBase
      .collection("users")
      .findOne({ username: data.username });
    if (user) throw new Error("Username already exists!");
    const halt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, halt);
    data.password = hashedPassword;

    const result = await dataBase.collection("users").insertOne(data);
    delete data.password;
    data._id = result.insertedId;
    res.status(StatusCodes.CREATED).json(data);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token");
    res.status(StatusCodes.OK).json({ message: "Logout success" });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

let fan = {
  name: "fan",
  isActive: false,
  auto: false,
  speed: 2,
  tempThreshold: 35,
  humidityThreshold: 60,
};

let light = {
  name: "light",
  isActive: false,
  auto: false,
  brightness: 2,
  lightThreshold: 300,
};

let microphone = {
  name: "microphone",
  isActive: false,
};

async function getDeviceByName(req, res) {
  try {
    const name = req.params.name;
    let device;
    switch (name) {
      case "fan":
        device = fan;
        break;
      case "light":
        device = light;
        break;
      case "microphone":
        device = microphone;
        break;
      default:
        throw new Error("Device not found");
    }
    res.status(StatusCodes.OK).json(device);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function toggleDevice(req, res) {
  try {
    const name = req.params.name;
    let device;
    let action = "";
    switch (name) {
      case "fan":
        fan.isActive = !fan.isActive;
        device = fan;
        action = fan.isActive
          ? `Turn on fan speed ${fan.speed}`
          : "Turn off fan";
        break;
      case "light":
        light.isActive = !light.isActive;
        device = light;
        action = light.isActive
          ? `Turn on light brightness ${light.brightness}`
          : "Turn off light";
        break;
      case "microphone":
        microphone.isActive = !microphone.isActive;
        device = microphone;
        action = microphone.isActive
          ? "Turn on microphone"
          : "Turn off microphone";
        break;
      default:
        throw new Error("Device not found");
    }
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);

    // Send command to gateway
    if (device.name === 'fan') {
      const value = fan.isActive ? `MANUAL${fan.speed}` : 'MANUAL0';
      sendCommandToGateway('FAN', value);
    } else if (device.name === 'light') {
      const value = light.isActive ? `MANUAL${light.brightness}` : 'MANUAL0';
      sendCommandToGateway('LIGHT', value);
    }

    res.status(StatusCodes.OK).json(device);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function autoDevice(req, res) {
  try {
    const name = req.params.name;
    let device;
    let action = "";
    switch (name) {
      case "fan":
        fan.auto = !fan.auto;
        device = fan;
        action = fan.auto ? "Turn on fan auto mode" : "Turn off fan auto mode";
        break;
      case "light":
        light.auto = !light.auto;
        device = light;
        action = light.auto
          ? "Turn on light auto mode"
          : "Turn off light auto mode";
        break;
      default:
        throw new Error("Device not found or not support auto mode");
    }
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);

    // Send command to gateway
    if (device.name === 'fan') {
      const value = fan.auto ? 'AUTO' : `MANUAL${fan.isActive ? fan.speed : 0}`;
      sendCommandToGateway('FAN', value);
    } else if (device.name === 'light') {
      const value = light.auto ? 'AUTO' : `MANUAL${light.isActive ? light.brightness : 0}`;
      sendCommandToGateway('LIGHT', value);
    }

    res.status(StatusCodes.OK).json(device);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function setDeviceLevel(req, res) {
  try {
    if (!req.body) throw new Error("Body is required");
    const name = req.params.name;
    const level = req.body.level;
    if (level === undefined) throw new Error("Level is required");
    if (level < 1 || level > 3)
      throw new Error("Level must be between 1 and 3");
    let device;
    let action = "";
    switch (name) {
      case "fan":
        if (!fan.isActive) throw new Error("Fan is not active");
        fan.speed = level;
        device = fan;
        action = `Turn on fan speed ${fan.speed}`;
        break;
      case "light":
        if (!light.isActive) throw new Error("Light is not active");
        light.brightness = level;
        device = light;
        action = `Turn on light brightness ${light.brightness}`;
        break;
      default:
        throw new Error("Device not found or not support set level");
    }
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);

    // Send command to gateway
    if (device.name === 'fan') {
      sendCommandToGateway('FAN', `MANUAL${fan.speed}`);
    } else if (device.name === 'light') {
      sendCommandToGateway('LIGHT', `MANUAL${light.brightness}`);
    }

    res.status(StatusCodes.OK).json(device);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function setDeviceThreshold(req, res) {
  try {
    if (!req.body) throw new Error("Body is required");
    const name = req.params.name;
    let device;
    let action = "";
    switch (name) {
      case "fan":
        const tempThreshold = req.body.tempThreshold;
        const humidityThreshold = req.body.humidityThreshold;
        if (tempThreshold === undefined || humidityThreshold === undefined)
          throw new Error("tempThreshold and humidityThreshold are required");
        if (tempThreshold < 0 || tempThreshold > 100)
          throw new Error("Temperature threshold must be between 0 and 100");
        if (humidityThreshold < 0 || humidityThreshold > 100)
          throw new Error("Humidity threshold must be between 0 and 100");
        fan.tempThreshold = tempThreshold;
        fan.humidityThreshold = humidityThreshold;
        device = fan;
        action = `Set fan activation thresholds to ${fan.tempThreshold}°C or ${fan.humidityThreshold}%`;
        break;
      case "light":
        const lightThreshold = req.body.lightThreshold;
        if (lightThreshold === undefined)
          throw new Error("lightThreshold is required");
        if (lightThreshold < 0 || lightThreshold > 1000)
          throw new Error("Light threshold must be between 0 and 1000");
        light.lightThreshold = lightThreshold;
        device = light;
        action = `Set light activation threshold to ${light.lightThreshold}`;
        break;
      default:
        throw new Error("Device not found or not support set threshold");
    }
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);
    res.status(StatusCodes.OK).json(device);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function resetDeviceThreshold(req, res) {
  try {
    const name = req.params.name;
    let device;
    let action = "";
    switch (name) {
      case "fan":
        fan.tempThreshold = 35;
        fan.humidityThreshold = 60;
        device = fan;
        action = `Reset fan activation thresholds to ${fan.tempThreshold}°C or ${fan.humidityThreshold}%`;
        break;
      case "light":
        light.lightThreshold = 300;
        device = light;
        action = `Reset light activation threshold to ${light.lightThreshold}`;
        break;
      default:
        throw new Error("Device not found or not support reset threshold");
    }
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);
    res.status(StatusCodes.OK).json(device);
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

let streamSensorResList = new Set();

async function streamSensor(req, res) {
  console.log("Client connected to api/stream/sensor");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  streamSensorResList.add(res);

  // const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

  res.on("close", () => {
    console.log("Client disconnected from api/stream/sensor");
    // clearInterval(hb);
    streamSensorResList.delete(res);
    res.end();
  });
}

let streamStatusResList = new Set();

async function streamStatus(req, res) {
  console.log("Client connected to api/stream/status");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  streamStatusResList.add(res);

  const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

  res.on("close", () => {
    console.log("Client disconnected from api/stream/status");
    clearInterval(hb);
    streamStatusResList.delete(res);
    res.end();
  });
}

let dem = 0;

async function updateSensorData(req, res) {
  const data = JSON.stringify(req.body);
  for (const sensorRes of streamSensorResList) {
    sensorRes.write(["event: sensor", `data: ${data}\n\n`].join("\n"));
  }

  res.status(200).send("Sensor data received");

  // rdata = {
  //   "TEMP": TEMP,
  //   "HUMI": HUMI,
  //   "LIGHT": LIGHT,
  //   "PRES": PRES
  // }
  const rdata = req.body;
  dem = dem % 5;
  if (dem == 0) {
    rdata.time = new Date(Date.now() + 7 * 60 * 60 * 1000);
    dataBase.collection("sensorData").insertOne(rdata);
  }
  dem = dem + 1;

  if (fan.auto) {
    let fanFlag = false;
    let action = "";
    if (
      rdata.TEMP >= fan.tempThreshold ||
      rdata.HUMI >= fan.humidityThreshold
    ) {
      if (!fan.isActive) {
        fanFlag = true;
        fan.isActive = true;
        action = "Turn on fan speed " + fan.speed;
      }
    } else {
      if (fan.isActive) {
        fanFlag = true;
        fan.isActive = false;
        action = "Turn off fan";
      }
    }
    if (fanFlag) {
      let deviceStatus = {
        fan: fan.isActive,
        light: light.isActive,
      };
      updateDeviceStatus(deviceStatus);

      const actionHistory = {
        time: new Date(Date.now() + 7 * 60 * 60 * 1000),
        action,
        trigger: "Auto",
      };
      dataBase.collection("actionHistory").insertOne(actionHistory);

      // Send command to gateway
      const fanValue = fan.isActive ? `MANUAL${fan.speed}` : 'MANUAL0';
      sendCommandToGateway('FAN', fanValue);
    }
  }

  if (light.auto) {
    let lightFlag = false;
    let action = "";
    if (rdata.LIGHT <= light.lightThreshold) {
      if (!light.isActive) {
        lightFlag = true;
        light.isActive = true;
        action = "Turn on light brightness " + light.brightness;
      }
    } else {
      if (light.isActive) {
        lightFlag = true;
        light.isActive = false;
        action = "Turn off light";
      }
    }
    if (lightFlag) {
      let deviceStatus = {
        fan: fan.isActive,
        light: light.isActive,
      };
      updateDeviceStatus(deviceStatus);

      const actionHistory = {
        time: new Date(Date.now() + 7 * 60 * 60 * 1000),
        action,
        trigger: "Auto",
      };
      dataBase.collection("actionHistory").insertOne(actionHistory);

      // Send command to gateway
      const lightValue = light.isActive ? `MANUAL${light.brightness}` : 'MANUAL0';
      sendCommandToGateway('LIGHT', lightValue);
    }
  }
}

async function updateDeviceStatus(data) {
  // data = {
  //   fan: false,
  //   light: true,
  // };
  data = JSON.stringify(data);
  for (const statusRes of streamStatusResList) {
    statusRes.write(["event: status", `data: ${data}\n\n`].join("\n"));
  }
}

let commandStreamRes = null;

async function commandStream(req, res) {
  console.log("Client connected to api/iot/commandStream");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  commandStreamRes = res;

  const hb = setInterval(() => res.write(": keep-alive\n\n"), 15000);

  res.on("close", () => {
    console.log("Client disconnected from api/iot/commandStream");
    clearInterval(hb);
    commandStreamRes = null;
    res.end();
  });
}

// Helper function to send command to gateway
function sendCommandToGateway(device, value) {
  if (commandStreamRes) {
    const command = {
      type: "command",
      device: device,
      value: value
    };
    const data = JSON.stringify(command);
    commandStreamRes.write(['event: command', `data: ${data}\n\n`].join('\n'));
    console.log(`Sent command to gateway: ${device}:${value}`);
  } else {
    console.warn('Gateway not connected to commandStream');
  }
}

async function getStudyDuration(req, res) {
  try {
    const duration = [2, 1, 3, 5, 7, 4, 0, 6];
    res.status(StatusCodes.OK).json({ duration });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function getTemperature(req, res) {
  let duration = req.query.duration || 5;
  duration = parseInt(duration);
  if (duration <= 0 || duration > 1440) throw new Error("Duration invalid");
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const startTime = new Date(now.getTime() - duration * 60 * 1000);
  try {
    const temperatures = await dataBase
      .collection("sensorData")
      .find({ time: { $gte: startTime } })
      .project({ _id: 0, TEMP: 1, time: 1 })
      .sort({ time: 1 })
      .toArray();

    const step = Math.round(duration / 5);
    let result = [];
    for (let i = 0; i < temperatures.length; i += step) {
      result.push(temperatures[i]);
    }

    res.status(StatusCodes.OK).json({ temperatures: result });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function getHumidity(req, res) {
  let duration = req.query.duration || 5;
  duration = parseInt(duration);
  if (duration <= 0 || duration > 1440) throw new Error("Duration invalid");
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const startTime = new Date(now.getTime() - duration * 60 * 1000);
  try {
    const humidities = await dataBase
      .collection("sensorData")
      .find({ time: { $gte: startTime } })
      .project({ _id: 0, HUMI: 1, time: 1 })
      .sort({ time: 1 })
      .toArray();

    const step = Math.round(duration / 5);
    let result = [];
    for (let i = 0; i < humidities.length; i += step) {
      result.push(humidities[i]);
    }
    res.status(StatusCodes.OK).json({ humidities: result });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function getLightLevel(req, res) {
  let duration = req.query.duration || 5;
  duration = parseInt(duration);
  if (duration <= 0 || duration > 1440) throw new Error("Duration invalid");
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const startTime = new Date(now.getTime() - duration * 60 * 1000);
  try {
    const lightLevels = await dataBase
      .collection("sensorData")
      .find({ time: { $gte: startTime } })
      .project({ _id: 0, LIGHT: 1, time: 1 })
      .sort({ time: 1 })
      .toArray();

    const step = Math.round(duration / 5);
    let result = [];
    for (let i = 0; i < lightLevels.length; i += step) {
      result.push(lightLevels[i]);
    }

    res.status(StatusCodes.OK).json({ lightLevels: result });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function getActionHistory(req, res) {
  let page = req.query.page || 1;
  let limit = req.query.limit || 20;
  page = parseInt(page);
  limit = parseInt(limit);
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const skip = (page - 1) * limit;
  const filter = {};

  if (startDate && endDate) {
    filter.time = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  try {
    const total = await dataBase
      .collection("actionHistory")
      .countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages && totalPages !== 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Page number is out of range",
      });
    }
    const actions = await dataBase
      .collection("actionHistory")
      .find(filter)
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.status(StatusCodes.OK).json({
      totalPages,
      actions,
    });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function configureWifi(req, res) {
  try {
    const { ssid, password } = req.body;

    // Send WiFi configuration to gateway via command stream
    if (commandStreamRes) {
      const wifiConfig = {
        type: "wifi",
        device: ssid,
        value: password,
      };
      const data = JSON.stringify(wifiConfig);
      commandStreamRes.write([`event: wifi`, `data: ${data}\n\n`].join("\n"));
      console.log(`WiFi configuration sent to gateway: SSID=${ssid}`);
    } else {
      console.warn("No gateway connected to command stream");
    }

    // Log to action history
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action: `Configure WiFi network: ${ssid}`,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);

    res.status(StatusCodes.OK).json({
      message: "WiFi configuration sent successfully",
      ssid: ssid,
    });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

async function configureInterval(req, res) {
  try {
    const { interval } = req.body;

    // Validate interval
    if (!interval || interval <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Data send interval must be a positive number",
      });
    }

    // Send interval configuration to gateway via command stream
    if (commandStreamRes) {
      const intervalConfig = {
        type: "command",
        device: "INTERVAL",
        value: interval,

      };
      const data = JSON.stringify(intervalConfig);
      commandStreamRes.write([`event: interval`, `data: ${data}\n\n`].join("\n"));
      console.log(`Data send interval configuration sent to gateway: ${interval} seconds`);
    } else {
      console.warn("No gateway connected to command stream");
    }

    // Log to action history
    const actionHistory = {
      time: new Date(Date.now() + 7 * 60 * 60 * 1000),
      action: `Configure data send interval: ${interval}s`,
      trigger: "Manual",
    };
    dataBase.collection("actionHistory").insertOne(actionHistory);

    res.status(StatusCodes.OK).json({
      message: "Interval configuration sent successfully",
      interval: interval,
    });
  } catch (err) {
    const newErr = new Error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      stack: newErr.stack,
    });
  }
}

export const controllers = {
  login,
  register,
  logout,
  getDeviceByName,
  toggleDevice,
  autoDevice,
  setDeviceLevel,
  setDeviceThreshold,
  resetDeviceThreshold,
  streamSensor,
  streamStatus,
  updateSensorData,
  commandStream,
  getStudyDuration,
  getTemperature,
  getHumidity,
  getLightLevel,
  getActionHistory,
  configureWifi,
  configureInterval,
};
