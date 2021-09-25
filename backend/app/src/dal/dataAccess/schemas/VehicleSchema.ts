import DataAccess = require("./../../dataAccess/DataAccess");
import ta = require('time-ago');
import moment = require('moment');
import IVehicleModel = require("./../../../model/interfaces/IVehicleModel");

var mongoose = DataAccess.mongooseInstance;
var mongooseConnection = DataAccess.mongooseConnection;



class VehicleSchema {
    static get schema() {

        var schema = mongoose.Schema({

            id: {
                type: String,
                unique:true
            },
            licenseplate: {
                type: String
            },
            salesdesignation: {
                type: String
            },
            nickname: {
                type: String
            },
            modelyear: {
                type: Number
            },
            colorname: {
                type: String
            },
            finorvin: {
                type: String
            },
            fueltype: {
                type: String
            },
            created_at: {
                type: String,
                required: false
            },
            powerhp: {
                type: String,
            },
            powerkw: {
                type: String,
            },
            numberofdoors: {
                type: String,
            },
            numberofseats: {
                type: String,
            },            
            updated_at: {
                type: Number,
                required: false
            },
            created_by: {
                type: String,
                ref: 'Useres'
            },
            updated_by: {
                type: String,
                ref: 'Useres'
            }
        })
        schema.pre('save', function (next) {
            // get the current date unix_timestamp
            var timeStamp = Math.round(+new Date());

            // change the updated_at field to current date
            this.updated_at = timeStamp;

            // if created_at doesn't exist, add to that field
            if (!this.created_at)
                this.created_at = timeStamp;

            next();
        });
        /**
        * setting virtual elements
        */
        schema.set('toJSON', {
            virtuals: true
        });
        schema.virtual('createdAgo').get(function () {
            let t = ta();
            return t.ago(new Date(this.created_at - 1000));
        })

        return schema;
    }
}

var schema = mongooseConnection.model<IVehicleModel>("Vehicle", VehicleSchema.schema);
export = schema