import { IVehicleModel } from "./../../model/interfaces/barrel";
import VehicleSchema = require("./../dataAccess/schemas/VehicleSchema");
import RepositoryBase = require("./base/RepositoryBase");

/**
 * VehicleRepository
 * 
 * @class VehicleRepository
 */
class VehicleRepository extends RepositoryBase<IVehicleModel> {

    constructor() {
        super(VehicleSchema);
    }
}
export = VehicleRepository;