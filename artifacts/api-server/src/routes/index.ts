import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import couplesRouter from "./couples.js";
import moodsRouter from "./moods.js";
import dashboardRouter from "./dashboard.js";
import aiRouter from "./ai.js";
import subscriptionsRouter from "./subscriptions.js";
import openaiChatRouter from "./openai-chat.js";
import questionsRouter from "./questions.js";
import achievementsRouter from "./achievements.js";
import loveLanguageRouter from "./love-language.js";
import memoriesRouter from "./memories.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/couples", couplesRouter);
router.use("/moods", moodsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/ai", aiRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/openai", openaiChatRouter);
router.use("/questions", questionsRouter);
router.use("/achievements", achievementsRouter);
router.use("/love-language", loveLanguageRouter);
router.use("/memories", memoriesRouter);

export default router;
