import * as express from "express";
import EmployeeController = require("./../../controllers/EmployeeController");
var router = express.Router();
import SystemRouter = require("./../../lib/System.Router");


class EmployeeRoutes {
    private _employeeController: EmployeeController;

    constructor() {
        this._employeeController = new EmployeeController();
    }
    get routes() {
        var controller = this._employeeController;

        router = SystemRouter.setRouters("employee", controller);
        //custom routes
        return router;
    }
}

Object.seal(EmployeeRoutes);
export { EmployeeRoutes };