import * as express from "express";
import { _ } from "lodash-node";
import Promise = require('bluebird');
import moment = require('moment');

import { IEmployeeModel } from "./../model/interfaces/barrel/";
import UserModel = require("./../model/UserModel");
import { EmployeeModel } from "./../model/barrel";

import Constants = require('../config/constants/Constants');
import BaseController = require('./base/BaseController');
import ErrorMessages = require('../config/constants/Error.Messages');
//Load the request module
var request = require('request');

class EmployeeController extends BaseController {


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
            var model = new EmployeeModel();

            model.search(cond, req.query, 'updated_at').populate('created_by').populate('user').then((result) => {
                // Get total count
                model.count(cond, req.query).then(totalCount => {
                    let returnResult = {
                        employees: result,
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

            let model = new EmployeeModel();
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
            let ws: string = req.params.ws;
            let employee: IEmployeeModel = <IEmployeeModel>req.body;
            new UserModel().findById(employee.user).then(user => {
                if (user) {
                    console.log("this is res", user)
                    let model = new EmployeeModel();
                    model.create(employee).then((result) => {
                        res.json(result);
                    }).catch(next);
                }
                else {
                    return next(ErrorMessages.notFound());
                }
            })

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
            var employee: IEmployeeModel = <IEmployeeModel>req.body;

            var model = new EmployeeModel();

            model.update(_id, employee).then((result) => {
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
            var model = new EmployeeModel();

            model.delete(_id).then((result) => {
                return res.json(result);
            }).catch(next);
        }
        catch (e) {
            return ErrorMessages.errorHandler(e, next);

        }
    }
}

export = EmployeeController;


