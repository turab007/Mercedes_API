import * as express from "express";
import {    UserRoutes, LoginRoutes, EmployeeRoutes, VehicleRoutes
} from "./";

import fs = require("fs")
import path = require('path');

var app = express();
// TODO:low (it was not working on middlewares, need to find best way set following line to set in middlewares)
app.set('views', path.join(fs.realpathSync(`${__dirname}/../../../views/`)));

/**
 * Include all route classes and use them here.
 * 
 * @class BaseRoutes
 */
class BaseRoutes {

    get routes() {
        app.use("/", new LoginRoutes().routes);
        app.use("/", new LoginRoutes().routes);
        app.use("/", new UserRoutes().routes);
        app.use("/", new EmployeeRoutes().routes);
        app.use("/", new VehicleRoutes().routes);


        return app;
    } 
}
export { BaseRoutes };