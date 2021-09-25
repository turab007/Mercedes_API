import * as express from "express";
import { _ } from "lodash-node";
import Promise = require('bluebird');
import moment = require('moment');

import { IVehicleModel } from "./../model/interfaces/barrel/";
import UserModel = require("./../model/UserModel");
import { VehicleModel } from "./../model/barrel";

import Constants = require('../config/constants/Constants');
import BaseController = require('./base/BaseController');
import ErrorMessages = require('../config/constants/Error.Messages');
const nodeCron = require("node-cron");

//Load the request module
var request = require('request');

class VehicleController extends BaseController {


    /**
     *  List all records.
     * @param req 
     * @param res 
     * @param next 
     */
    public index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            let cond = {
            }
            var model = new VehicleModel();

            model.search(cond, req.query, 'updated_at').populate('created_by').populate('user').then((result) => {
                // Get total count
                model.count(cond, req.query).then(totalCount => {
                    let returnResult = {
                        vehicles: result,
                        totalCount: totalCount
                    }

                    return res.json(returnResult);
                }).catch(next);
            }).catch(next);
        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }


    }


    /**
     * View single record
     * @param req 
     * @param res 
     * @param next 
     */
    public view(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            let _id: string = req.params._id;
            let model = new VehicleModel();
            //sort({ "comments.created_at": -1 })
            model.findById(_id).populate('created_by').populate('updated_by').populate('user').then((result) => {
                res.json(result);
            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }

    }

    /**
     * Create new record
     * @param req 
     * @param res 
     * @param next 
     */
    public create(req: express.Request, res: express.Response, next: express.NextFunction): void {

        try {
            let vehicle: IVehicleModel = <IVehicleModel>req.body;
            let model = new VehicleModel();
            model.create(vehicle).then((result) => {
                res.json(result);
            }).catch(next);
        }

        catch (error) {

            return next(ErrorMessages.modelValidationMessages(error));
        }
    }

    /**
* Update existing record
* @param req 
* @param res 
* @param next 
*/
    public getData(req, res: express.Response, next: express.NextFunction): void {
        try {
            // const job = nodeCron.schedule("0 0 * * *", function getVehicleData() {
                var options = {
                    'method': 'GET',
                    'url': 'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v2/vehicles',
                    'headers': {
                        'Authorization': 'Bearer a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6'
                    }
                };
                request(options, function (error, response) {
                    if (error) throw new Error(error);
                    console.log(response.body);
                    let vehicles: IVehicleModel[] = <IVehicleModel[]>JSON.parse(response.body);
                    vehicles.forEach(vehicle => {
                        console.log('Inside for each')

                        var options = {
                            'method': 'GET',
                            'url': `https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v2/vehicles/${vehicle.id}`,
                            'headers': {
                                'Authorization': 'Bearer a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6'
                            }
                        };
                        request(options, function (error, response) {
                            if (error) throw new Error(error);
                            let vehicleObj: IVehicleModel = <IVehicleModel>JSON.parse(response.body);
                            console.log(response.body);
                            let model = new VehicleModel();
                            // console.log(model)
                            model.create(vehicleObj).then((result) => {
                            }).catch(next);
                        });
                    })
                    res.json();
                });
            // });
        }
        catch (error) {
            return next(ErrorMessages.modelValidationMessages(error));
        }
    }

    /**
     * Update existing record
     * @param req 
     * @param res 
     * @param next 
     */
    public update(req, res: express.Response, next: express.NextFunction): void {
        try {
            var _id: string = req.params._id;
            var vehicle: IVehicleModel = <IVehicleModel>req.body;

            var model = new VehicleModel();

            model.update(_id, vehicle).then((result) => {
                return res.json(result);
            }).catch(next);
        }
        catch (error) {
            return next(ErrorMessages.modelValidationMessages(error));
        }
    }

    /**
    * Delete single record.
    * @param req 
    * @param res 
    * @param next 
    */
    public delete(req: express.Request, res: express.Response, next: express.NextFunction): void {

        try {
            var _id: string = req.params._id;
            var model = new VehicleModel();

            model.delete(_id).then((result) => {
                return res.json(result);
            }).catch(next);
        }
        catch (e) {
            return ErrorMessages.errorHandler(e, next);

        }
    }

}

export = VehicleController;


