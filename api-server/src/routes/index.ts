import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import categoriesRouter from "./categories";
import gameRouter from "./game";
import codesRouter from "./codes";
import productsRouter from "./products";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(categoriesRouter);
router.use(gameRouter);
router.use(codesRouter);
router.use(productsRouter);
router.use(adminRouter);

export default router;
