import { Router } from "express";
import { createFeedback } from "../Controllers/Feedback.controller.js";

const router = Router();

router.route("/").post(createFeedback);

export default router;
