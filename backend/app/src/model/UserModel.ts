/// <reference path="../../_all.d.ts" />
import jsonwebtoken = require('jsonwebtoken');
import Promise = require("bluebird");
import _ = require('lodash-node');
import bcrypt = require('bcryptjs');

import { generateResetPasswordToken, sendResetPasswordEmail } from '../helpers/User.Helper'

import Constants = require('../config/constants/Constants');
import BaseModel = require("./base/BaseModel");
import UserRepository = require("./../dal/repository/UserRepository");
import IUserModel = require("./interfaces/IUserModel");
// import IUserBusinessGroupModel = require("./interfaces/IUserBusinessGroupModel");
import ErrorMessages = require('../config/constants/Error.Messages');

// import Pagination = require('./../helpers/Pagination');

/**
 * User Model
 * 
 * @class UserModel
 */
class UserModel extends BaseModel<IUserModel> {

    private validationRules = { first_name: 'required', last_name: 'required' }

    private _UserModel: IUserModel;

    constructor() {
        super(new UserRepository());
    }

    /**
     * initialize/generate new Json Web Token for user.
     * @class UserModel
     * @param user 
     */
    private _JWTInit(user: IUserModel): string {

        //TODO:high: 08 May: For now system is validating previous generated tokens. It shoud not do that. Save token in user table.

        let payLoad = {
            exp: Math.floor(Date.now() / 1000) + (60 * 180),//Two hour
            user_id: user.user_id,
            name: user.fullname,
        };

        return jsonwebtoken.sign(payLoad, Constants.jwtTokenSecret);

    }

    /**
     * Login 
     * 
     * @param user_id string
     */
     public login(user_id: string, password: string) {
        return this._repo.findByAttribute({ 'user_id': user_id }).then((result) => {

            if (result) {
                if (bcrypt.compareSync(password, result.password_hash)) {
                    return this.getLoginUserPermissionsAndToken(result);
                }
                else {
                    return null;
                }

            }

        })
    }
  
    /**
     * During the reset password prcesess it is required 
     * @param user_id 
     * @param password 
     */
    private autoLogin(user_id: string) {

        return this._repo.findByAttribute({ 'user_id': user_id }).then((result) => {

            if (result) {
                return this.getLoginUserPermissionsAndToken(result);
            }
            return result;

        })
    }
    /**
     * A helper method will be used for normal login process and auto login process
     * @param result 
     */
    private getLoginUserPermissionsAndToken(result: IUserModel) {
 
            // Create/initialize token
            let newToken = this._JWTInit(result);


            return {
                'user_id': result.user_id,
                'name': result.fullname,
                'auth_token': newToken,
                'userID':result._id
            }
     
    }

    /**
     * 
     * @param item 
     */
    private applyValidation(item: IUserModel) {
        let errors = {}
        for (let r in this.validationRules) {
            if (this.validationRules[r] == 'required' && item[r] == '') {
                errors[r] = ' is required ';
            }
        }
        return errors;
    }

    /**
     * 
     * @param user_id 
     * @param item 
     */
    findByUserIdAndupdatePassword(user_id: string, item: IUserModel) {
        let cond = {
            $and: [
                { 'user_id': { $exists: true } },
                { 'user_id': { $ne: null } },
                { 'user_id': user_id },
            ]
        }
        return this.findByAttribute(cond).then((result) => {
            if (result) {
                if (bcrypt.compareSync(item.old_password, result.password_hash)) {
                    item.password_hash = bcrypt.hashSync(item.password_hash, 10);
                    return this.update(result.id, item)
                }
                else {
                    throw null;
                }

            }
            else {
                console.log("dd");
                return { errors: ['Password does not match existing password'] };
            }
        })
    }

    /**
     * Following function will fetch the user from given token if exists in the database as key and value also
     * @param activation_token 
     *   e.g ff00d4c421b908fadb7ac594251b3cd0f8522a4f0e7e69a3
     */
    verifyAndActivate(activation_token: string) {

        /* e.g 
            Select from user where (activation_token IS NOT NULL AND activation_token !='')  
            AND activation_token = {activation_token}
        */
        let cond = {
            $and: [
                { 'activation_token': { $exists: true } },
                { 'activation_token': { $ne: null } },
                { 'activation_token': activation_token }
            ]
        }

        return this.findByAttribute(cond).then((result) => {
            if (result) {
                 console.log("---==----");
                if(result.work_spaces && _.size(result.work_spaces)>0){
                     return this.activateUser(result);
                }
                else {
                    console.log("---------");
                    //when user wont have any workspace,create personal workSpace
                    return this.activateUser(result);
                    // return new WorkSpaceModel().createPersonalWorkSpace(result).then(ws=>{
                    //       console.log(ws);
                    // })
                  
                }
               
            }
        })
    }
    /**
     * This will activate the user make status is true and will alot the password_reset_token
     * @param user 
     */
    activateUser(user: IUserModel) {

        console.log(user);
        let userAttr: IUserModel = <IUserModel>{
            status: true,
            activation_token: null,
            password_reset_token: generateResetPasswordToken()
        };

        return this.update(user._id, userAttr).then(result => {
            result.password_reset_token = userAttr.password_reset_token
            return result;

        })
    }
    /**
     * 
     * @param password_reset_token 
     * @param new_password 
     * @param confirm_new_passwoord 
     */
    verifyAndResetPassword(password_reset_token: string, new_password: string, confirm_new_password) {

        return this.verifyResetPasswordToken(password_reset_token).then((result) => {

            if (this.validateNewPassword(new_password, confirm_new_password)) {

                return this.updatePasswordAndLogin(result, new_password);
            }
        })
    }
    /**
     * It will verify the reset password token and fetch the user against it
     * query will be applied that in sql style
     * e.g Select * from user where  (password_reset_token IS NOT NULL AND password_reset_token !='')  
            AND password_reset_token = {password_reset_token}
     * @param password_reset_token 
     */
    verifyResetPasswordToken(password_reset_token: string) {
        let cond = {
            $and: [
                { 'password_reset_token': { $exists: true } },
                { 'password_reset_token': { $ne: null } },
                { 'password_reset_token': password_reset_token }
            ]
        }
        return this.findByAttribute(cond);
    }
    /**
     * 
     * @param new_password 
     * @param confirm_new_password 
     */
    validateNewPassword(new_password: string, confirm_new_password): boolean {
        console.log("al..")
        console.log(new_password)
        console.log(confirm_new_password)

        if ((!new_password || !confirm_new_password)) {
            return false;
        }
        else if (new_password != confirm_new_password) {
            return false;
        }
        return true;
    }
    /**
     * This method will update the new password and auto login with login_id
     * @param user 
     * @param new_password 
     */
    updatePasswordAndLogin(user: IUserModel, new_password) {
        new_password = bcrypt.hashSync(new_password, 10);
        let userAttr: IUserModel = <IUserModel>{
            password_reset_token: null,
            password_hash: new_password // encrypted password with the hash and salt
        };

        return this.update(user._id, userAttr).then(result => {
            if (result) {
                return this.autoLogin(user.user_id).then((resultLogin) => {
                    return resultLogin;

                })
            }
        })
    }
    /**
     * 
     * @param user_id 
     * @param originUrl 
     */
    verifyUserAndSetPasswordToken(user_id: string, originUrl: string) {
        let cond = {
            $and: [
                { 'user_id': { $exists: true } },
                { 'user_id': { $ne: null } },
                { 'user_id': user_id }
            ]
        }
        return this.findByAttribute(cond).then((result) => {
            return this.updateNewPasswordToken(result, originUrl);
        })
    }
    /**
     * It will update the auto generated Reset password token
     * @param user 
     * @param originUrl 
     */
    updateNewPasswordToken(user: IUserModel, originUrl: string) {
        let userAttr: IUserModel = <IUserModel>{
            password_reset_token: generateResetPasswordToken()
        };

        return this.update(user._id, userAttr).then(result => {
            return this.sendResetTokenInEmail(user, userAttr.password_reset_token, originUrl);
        })
    }
    /**
     * It will send the email with given reset password token
     * @param user 
     * @param resetToken 
     * @param originUrl 
     */
    sendResetTokenInEmail(user: IUserModel, resetToken: string, originUrl: string) {
        return sendResetPasswordEmail(user, resetToken, originUrl).then(resultEmail => {

            // TODO:low:17May18: For now I am unable to map result to IUserModel. 
            // It should be some kind of casting/maping like result = <IUserModel>result instead of assigning the values manually in other variable.
            let emailObj = {
                email_sent: resultEmail.accepted.length > 0 ? true : false
            };
            return emailObj;

        })
    }
    /**
     * Find BY Email 
     * @param email 
     */
    findByEmail(email: string) {
        let cond = {
            $and: [
                { 'user_id': { $exists: true } },
                { 'user_id': { $ne: null } },
                { 'user_id': email },
            ]
        }
        return this.findByAttribute(cond)
    }

    /**
     * Find Users by ids 
     *  => e.g Select * from users WHERE _id IN (2,3,5)
     * @param ids 
    */
    public findAllByIds(ids:any[]) {
        //'Technologies' (is a Tag data_type)
        let cond = {
            $and: [
                { '_id': { $ne: null } },
                { '_id': { $in: ids } },
            ]
        }
        console.log(cond);
        return this.findAllByAttributes(cond).select('first_name last_name ').sort({ first_name: 'asc' }).then((result) => {
            console.log(result);
            return result;
        })
    }



}

export =  UserModel;