import * as express from "express";
import VehicleController = require("./../../controllers/VehicleController");
var router = express.Router();
import SystemRouter = require("./../../lib/System.Router");


class VehicleRoutes {
    private _vehicleController: VehicleController;

    constructor() {
        this._vehicleController = new VehicleController();
    }
    get routes() {
        var controller = this._vehicleController;

        router = SystemRouter.setRouters("vehicle", controller);
        //custom routes
        router.route('/vehicle/getData').get(controller.getData)
        return router;
    }
}

Object.seal(VehicleRoutes);
export { VehicleRoutes };