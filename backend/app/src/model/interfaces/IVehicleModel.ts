/// <reference path="../../../_all.d.ts" />
import mongoose = require("mongoose");

export interface IVehicleModel extends mongoose.Document {
    _id?: string,
    id?: string,
    licenseplate?: string,
    salesdesignation?:string,
    finorvin?: string,
    nickname?:string,
    modelyear?:string,
    colorname?:string,
    fueltype?:string,
    powerhp?:string,
    powerkw?:string,
    numberofdoors?:string,
    numberofseats?:string
    created_at: number,
    updated_at: number,
    created_by?: any,
    updated_by?: any,
    //virtual attributes
    createdAgo?: any,

}