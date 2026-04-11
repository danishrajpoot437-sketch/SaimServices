import { Router, type IRouter } from "express";
import healthRouter from "./health";
import papersRouter from "./papers";
import blogsRouter  from "./blogs";
import adminRouter  from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(papersRouter);
router.use(adminRouter);
router.use(blogsRouter);

export default router;
