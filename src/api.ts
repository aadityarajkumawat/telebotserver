import { Router } from "express";
import moment from "moment";
import { prisma } from "./prisma";

const router = Router();

router.post("/todays-quiz", async (req, res) => {
  console.log(req.body.date);

  const date = new Date(req.body.date);
  const questions = await prisma.question.findMany({
    where: {
      scheduledAt: date,
    },
  });

  return res.json({ questions });
});

router.get("/past-quizzes", async (_, res) => {
  const quizzes = await prisma.question.findMany({
    orderBy: {
      scheduledAt: "desc",
    },
  });

  const quizzesGrouped = quizzes.reduce((acc: any, curr: any) => {
    const date = moment(curr.scheduledAt).format("MM/DD/YYYY");
    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(curr);
    return acc;
  }, {});

  return res.json({ quizzes: quizzesGrouped });
});

router.post("/save-questions", async (req, res) => {
  // delete previous questions
  const date = new Date(req.body.date);

  await prisma.question.deleteMany({
    where: {
      scheduledAt: date,
    },
  });

  // add new questions
  const questions = req.body.questions as Array<{
    question: string;
    options: {
      option1: string;
      option2: string;
      option3: string;
      option4: string;
    };
    answers: Array<string>;
  }>;

  await prisma.question.createMany({
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

export default router;
