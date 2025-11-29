import express from "express";
import { verifyToken } from "./middleware.js";
import { validations } from "./validation.js";
import { controllers } from "./controller.js";
export const router = express.Router();

router.post("/iot/sensor", controllers.updateSensorData);
router.get("/iot/commandStream", controllers.commandStream);

router.post("/register", validations.register, controllers.register);
router.post("/login", validations.login, controllers.login);
router.use(verifyToken);
router.get("/logout", controllers.logout);

router.get("/device/getInfoDevice/:name", controllers.getDeviceByName);
router.post("/device/statusToggle/:name", controllers.toggleDevice);
router.post("/device/autoToggle/:name", controllers.autoDevice);
router.post("/device/setLevel/:name", controllers.setDeviceLevel);
router.post("/device/setThreshold/:name", controllers.setDeviceThreshold);
router.post("/device/resetThreshold/:name", controllers.resetDeviceThreshold);

router.get("/stream/sensor", controllers.streamSensor);
router.get("/stream/status", controllers.streamStatus);

// router.get("/studyDuration", controllers.getStudyDuration);
router.get("/temperature", controllers.getTemperature);
router.get("/humidity", controllers.getHumidity);
router.get("/lightLevel", controllers.getLightLevel);
router.get("/actionHistory", controllers.getActionHistory);
