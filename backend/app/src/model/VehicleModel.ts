/// <reference path="../../_all.d.ts" />
import { _ } from 'lodash-node'
import Promise = require('bluebird');
import VehicleRepository = require("./../dal/repository/VehicleRepository");
import { IVehicleModel } from "./interfaces/IVehicleModel";
import BaseModel = require("./base/BaseModel");

/**
 * 
 * Vehicle  Model
 * 
 * @class VehicleModel
 */
class VehicleModel extends BaseModel<IVehicleModel> {

    private _alRepository: VehicleRepository;

    constructor() {
        super(new VehicleRepository());
        this._alRepository = this._repo;
    }

    updateToken(_id:string,model)
    {
        return this.findByIdAndUpdate(_id,model).then(result=>
        {
            console.log("this is what is got",result,"model is",model);
            return result;
        })

    }
    
}

Object.seal(VehicleModel);
export { VehicleModel };