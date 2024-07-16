import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import ShopController from '../controllers/shop';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = ShopController(container);

    router.get('/api/shop/galacticcredits/purchase',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.purchase,
            mw.core.handleError)
    );

    router.get('/api/shop/galacticcredits/purchase/process',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.process,
            mw.core.handleError)
    );

    return router;
}