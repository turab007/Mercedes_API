import * as express from "express";
import DataAccess = require("./../dal/dataAccess/DataAccess");
import IUserModel = require("./../model/interfaces/IUserModel");
import UserModel = require("./../model/UserModel");
import ErrorMessages = require('../config/constants/Error.Messages');
import BaseController = require('./base/BaseController');

import { generateActivationKey, sendConfirmationEmail } from '../helpers/User.Helper';
//Load the request module
var request = require('request');
var mongoose = require('mongoose');


/**
 * User Controller
 * 
 * @class UserController
 */
class UsersController extends BaseController {



    /**
     * 
     * List all records.
     * 
     * @method index
     * @param req 
     * @param res 
     * @param next 
     */
    public index(req: express.Request, res: express.Response, next: express.NextFunction): void {

        try {
            console.log(req.query);
            let userModel = new UserModel();
            userModel.search({}, req.query).then((result) => {

                // Get total count
                userModel.count({}, req.query).then(totalCount => {
                    let returnResult = {
                        users: result,
                        totalCount: totalCount
                    }

                    return res.json(returnResult);
                });


            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }

    public getUsers(req: express.Request, res: express.Response, next: express.NextFunction): void {

        try {
            console.log(req.query);
            let userModel = new UserModel();
            console.log('this is query', req.query);
            req.query['select'] = ["first_name", "last_name","user_id"];
            userModel.search({}, req.query).then((result) => {

                // Get total count
                userModel.count({}, req.query).then(totalCount => {
                    let returnResult = {
                        users: result,
                        totalCount: totalCount
                    }
                    // console.log(result); 

                    return res.json(returnResult);
                });


            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }



    /**
     * 
     * View single record
     * 
     * @method view
     * @param req 
     * @param res 
     * @param next 
     */
    public view(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {

            let _id: string = req.params._id;
            let userModel = new UserModel();

            userModel.findById(_id).then((result) => {
                console.log(result.fullname);
                res.json(result);
            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }

    /**
 * 
 * View single record
 * 
 * @method view
 * @param req 
 * @param res 
 * @param next 
 */
    public getLoggedInUser(req, res: express.Response, next: express.NextFunction): void {
        try {
            let current_user = req.session.current_user;
            current_user.password_hash = current_user.work_spaces = null;
            res.json(current_user);
        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }

    /**
     * 
     * View single record by any attribute
     * 
     * @method view
     * @param req 
     * @param res 
     * @param next 
     */
    public view_by_attribute(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {


            var _attr: string = req.params.attr;
            var _attrValue: string = req.params.attr_value;
            // var _id: string = req.params.id;
            var userModel = new UserModel();
            var cond = {};

            cond[_attr] = _attrValue

            if (req.params.id && req.params.id != '') {
                cond['_id'] = { $ne: req.params.id.toString() }
            }

            userModel.findByAttribute(cond).then((result) => {
                res.json(result);
            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }

    /**
     * 
     * Create new record
     * 
     * @method create
     * @param req 
     * @param res 
     * @param next 
     */
    public create(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            let errorMessages = [];

            let User: IUserModel = <IUserModel>req.body;
            User.activation_token = generateActivationKey();
            User.status = false; // Todo:Low (need to set default from IUserModel)
            User.is_admin = true // PCM : because user wont be able to view his profile
            let userModel = new UserModel();
            userModel.create(User).then((result) => {
        let userObj = {
                    first_name: result.first_name,
                    last_name: result.last_name,
                    user_id: result.user_id,
                    status: result.status,
                    is_admin: result.is_admin,
                    is_employee:result.is_employee,
                    _id: result._id,
                    email_sent: false
                };
                return sendConfirmationEmail(result, req.headers.origin).then(resultEmail => {
                    console.log("==================================");
                    console.log(resultEmail)
                    userObj.email_sent = resultEmail.accepted.length > 0 ? true : false
                    res.json(userObj);

                }).catch(errorEmail => {
                    console.log(errorEmail);
                    userObj.email_sent = false
                    res.json(userObj);
                })
            }).catch(error => {

                return next(ErrorMessages.modelValidationMessages(error));
            })

        }
        catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }

    /**
     * 
     * Update existing record
     * 
     * @param req
     * @param res 
     * @param next 
     */
    public update(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {

            let User: IUserModel = <IUserModel>req.body;

            let _id: string = req.params._id;
            let userModel = new UserModel();
            //for now these requirements not to be entertained
            /*
                let userRoles = req.body.roles;
                let userBusinessGroups = req.body.businessGroups;
            */

            userModel.update(_id, User).then((result) => {
                return res.json(result);
            }).catch(error => {
                console.log(error);
                return next(ErrorMessages.modelValidationMessages(error));
            });
        }
        catch (e) {
            return ErrorMessages.errorHandler(e, next);

        }
    }

    /**
     * 
     * Delete single record.
     * 
     * @param req
     * @param res 
     * @param next 
     */
    public delete(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {

            let _id: string = req.params._id;
            let userModel = new UserModel();

            userModel.delete(_id).then((result) => {

                return res.json(result);

            }).catch(next);
        }
        catch (e) {
            return ErrorMessages.errorHandler(e, next);

        }
    }
    /**
     * TODO: low (take this logic to model level)
     * @param req 
     * @param res 
     * @param next 
     */
    public autoComplete(req: express.Request, res: express.Response, next: express.NextFunction): void {

        try {
            let userModel = new UserModel();
            let not_in_ids = req.query.filter_not_in._id != '' ? req.query.filter_not_in._id.split(',') : [];
            not_in_ids = userModel.stringIdstoMongoIds(not_in_ids);

            let cond = [
                {
                    $project: {
                        name: { $concat: ["$first_name", " ", "$last_name"] },
                    }
                },
                {
                    $match: {
                        $and: [
                            { name: new RegExp(req.query.filter.name, 'i') },
                            { _id: { $nin: not_in_ids } },
                        ]
                    },

                },
            ];
            userModel.aggregate(cond).then((result) => {
                return res.json(result);
            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }
    /**
     * Get Selected users from array
     * @param req 
     * @param res 
     * @param next 
     */
    public getSelectedUsers(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            let userModel = new UserModel();
            let ids = req.query.filter._ids != '' ? req.query.filter._ids.split(',') : [];

            userModel.findAllByIds(ids).then((result) => {
                return res.json(result);
            }).catch(next);

        } catch (e) {
            return ErrorMessages.errorHandler(e, next);
        }
    }

}
export = UsersController;    