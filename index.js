import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.js";
import questionRoutes from "./routes/question.js";
import answerRoutes from "./routes/answers.js";
import postRoutes from "./routes/post.js";
import dotenv from "dotenv";
import Stripe from "stripe";
import { Configuration, OpenAIApi } from "openai"
dotenv.config();
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API,
});
const openai = new OpenAIApi(configuration);

const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is stack overflow clone api");
});

const stripe = Stripe(
  process.env.STRIPE_API
);
app.post("/stripe", async (req, res) => {
  try {
    const { amount, source, receipt_email } = req.body;

    const charge = await stripe.charges.create({
      amount,
      currency: "usd",
      source,
      receipt_email,
    });

    if (!charge) throw new Error("charge unsuccessful");

    res.status(200).json({
      charge,
      message: "charge posted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { content } = req.body;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.status(200).json({
      message: response.data.choices[0].message.content,
    });
  } catch (error) {
    // console.log( error.message);
    res.status(500).json({
      message: error.message
    });
  }
});

app.use("/user", userRoutes);
app.use("/questions", questionRoutes);
app.use("/answers", answerRoutes);
app.use("/post", postRoutes);

const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.CONNECTION_URL;

mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb+srv://amansingh6574:l3ZeXJ1KjWymGVjB@cluster0.7uex9w0.mongodb.net/StackDataBase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(port, () => {
      console.log(`Server is running at port ${port} db connected`);
    })
  )
  .catch((err) => {
    console.log(err.message);
  });
