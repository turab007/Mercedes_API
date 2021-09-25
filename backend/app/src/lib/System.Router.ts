import * as express from "express";
var router = express.Router();
// import AppletAccessController = require("./../controllers/AppletAccessController");
/**
 * Version: 1.0.0
 * Purpose of this class to wrap all crud methods on one place, 
 *  index
 *  view
 *  create
 *  update
 *  delete
 *  
 * How To use it 
 *** var controller = this._tagsController;
 *** var router = SystemRouter.setRouters("tags",controller);   
 *** router.route("/tags/types").get(controller.getTypes);   // custom routes
 *** return router       
 */
class SystemRouter {

    public static setRouters(controllerName: string, controller) {
        router.route(`/${controllerName}/index`).get(controller.index);
        router.route(`/${controllerName}/view/:_id`).get(controller.view);
        router.route(`/${controllerName}/create`).post(controller.create);
        router.route(`/${controllerName}/update/:_id`).put(controller.update);
        router.route(`/${controllerName}/delete/:_id`).delete(controller.delete);

        return router;

    }

}

Object.seal(SystemRouter);
export = SystemRouter;