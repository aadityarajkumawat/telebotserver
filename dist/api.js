"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("./prisma");
const router = (0, express_1.Router)();
router.post("/todays-quiz", async (req, res) => {
    console.log(req.body.date);
    const date = new Date(req.body.date);
    const questions = await prisma_1.prisma.question.findMany({
        where: {
            scheduledAt: date,
        },
    });
    return res.json({ questions });
});
router.get("/past-quizzes", async (_, res) => {
    const quizzes = await prisma_1.prisma.question.findMany({
        orderBy: {
            scheduledAt: "desc",
        },
    });
    const quizzesGrouped = quizzes.reduce((acc, curr) => {
        const date = (0, moment_1.default)(curr.scheduledAt).format("MM/DD/YYYY");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(curr);
        return acc;
    }, {});
    return res.json({ quizzes: quizzesGrouped });
});
router.post("/save-questions", async (req, res) => {
    const date = new Date(req.body.date);
    await prisma_1.prisma.question.deleteMany({
        where: {
            scheduledAt: date,
        },
    });
    const questions = req.body.questions;
    await prisma_1.prisma.question.createMany({
        data: questions.map((q) => ({
            question: q.question,
            option1: q.options.option1,
            option2: q.options.option2,
            option3: q.options.option3,
            option4: q.options.option4,
            answers: q.answers,
            scheduledAt: date,
        })),
    });
    return res.json({
        message: "Questions added successfully",
        status: "success",
    });
});
exports.default = router;
//# sourceMappingURL=api.js.map