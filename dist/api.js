"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moment_1 = __importDefault(require("moment"));
const consts_1 = require("./consts");
const prisma_1 = require("./prisma");
const redis_1 = __importDefault(require("./redis"));
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
router.post("/game-time", async (req, res) => {
    await redis_1.default.connect();
    const roomStartHour = req.body.roomStartHour;
    const roomStartMinutes = req.body.roomStartMinute;
    const gameStartHour = req.body.gameStartHour;
    const gameStartMinutes = req.body.gameStartMinute;
    await redis_1.default.set(consts_1.GAME_START_KEY, `${gameStartHour}:${gameStartMinutes}`);
    await redis_1.default.set(consts_1.ROOM_START_KEY, `${roomStartHour}:${roomStartMinutes}`);
    await redis_1.default.disconnect();
    return res.json({
        message: "Game time set successfully",
        status: "success",
    });
});
router.get("/game-time", async (_, res) => {
    try {
        await redis_1.default.connect();
        const gameStart = await redis_1.default.get(consts_1.GAME_START_KEY);
        const roomStart = await redis_1.default.get(consts_1.ROOM_START_KEY);
        console.log(gameStart, roomStart);
        if (!gameStart || !roomStart) {
            await redis_1.default.disconnect();
            return res.json({
                message: "Game time not set",
                status: "error",
            });
        }
        return res.json({
            gameStart,
            roomStart,
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            message: "Game time not set",
            status: "error",
        });
    }
    finally {
        await redis_1.default.disconnect();
    }
});
exports.default = router;
//# sourceMappingURL=api.js.map