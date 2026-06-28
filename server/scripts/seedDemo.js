const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Board = require("../models/Board");
const Task = require("../models/Task");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const demoUser = {
  name: "Demo User",
  email: "demo@taskflow.local",
  password: "Demo@12345"
};

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seed = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow_ai_pro";
  await mongoose.connect(mongoUri);

  let user = await User.findOne({ email: demoUser.email });
  if (!user) {
    user = await User.create(demoUser);
  }

  await Task.deleteMany({ owner: user._id });
  await Board.deleteMany({ owner: user._id });
  await ActivityLog.deleteMany({ user: user._id });

  const board = await Board.create({
    title: "Product Launch",
    description: "Demo board with tasks across each workflow column.",
    owner: user._id
  });

  await Task.create([
    {
      title: "Draft launch checklist",
      description: "Write the core launch steps and owners.",
      status: "todo",
      priority: "medium",
      dueDate: addDays(3),
      estimatedEffort: 4,
      board: board._id,
      owner: user._id
    },
    {
      title: "Connect analytics dashboard",
      description: "Verify status, priority, and effort charts for the launch board.",
      status: "in-progress",
      priority: "high",
      dueDate: addDays(5),
      estimatedEffort: 8,
      board: board._id,
      owner: user._id
    },
    {
      title: "Review security copy",
      description: "Check authentication and privacy notes before publishing.",
      status: "review",
      priority: "urgent",
      dueDate: addDays(1),
      estimatedEffort: 3,
      board: board._id,
      owner: user._id
    },
    {
      title: "Create first release board",
      description: "Prepare a sample board for demo credentials.",
      status: "done",
      priority: "low",
      dueDate: addDays(-1),
      estimatedEffort: 2,
      board: board._id,
      owner: user._id
    }
  ]);

  await ActivityLog.create({
    action: "demo_seeded",
    user: user._id,
    board: board._id
  });

  console.log("Demo data ready");
  console.log(`Email: ${demoUser.email}`);
  console.log(`Password: ${demoUser.password}`);
};

seed()
  .catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
