process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_for_taskflow";
process.env.CLIENT_URL = "http://localhost:5173";

const assert = require("node:assert/strict");
const { after, before, beforeEach, describe, it } = require("node:test");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

let mongoServer;

const api = () => request(app);

const authHeader = (token) => `Bearer ${token}`;

const registerUser = async (email = `user-${Date.now()}@taskflow.test`) => {
  const response = await api()
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email,
      password: "Password123"
    })
    .expect(201);

  return response.body;
};

const createBoard = async (token, title = "Launch Board") => {
  const response = await api()
    .post("/api/boards")
    .set("Authorization", authHeader(token))
    .send({
      title,
      description: "Track release work"
    })
    .expect(201);

  return response.body;
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("auth API", () => {
  it("registers a user, returns a token, and supports /me", async () => {
    const registered = await registerUser("auth-user@taskflow.test");

    assert.ok(registered.token);
    assert.equal(registered.user.email, "auth-user@taskflow.test");
    assert.equal(registered.user.password, undefined);

    const me = await api()
      .get("/api/auth/me")
      .set("Authorization", authHeader(registered.token))
      .expect(200);

    assert.equal(me.body.user.email, "auth-user@taskflow.test");
  });

  it("rejects duplicate registration and invalid login", async () => {
    await registerUser("duplicate@taskflow.test");

    const duplicate = await api()
      .post("/api/auth/register")
      .send({
        name: "Duplicate User",
        email: "duplicate@taskflow.test",
        password: "Password123"
      })
      .expect(409);

    assert.equal(duplicate.body.message, "Email is already registered");

    const invalidLogin = await api()
      .post("/api/auth/login")
      .send({
        email: "duplicate@taskflow.test",
        password: "wrong-password"
      })
      .expect(401);

    assert.equal(invalidLogin.body.message, "Invalid email or password");
  });
});

describe("board API", () => {
  it("keeps boards scoped to the authenticated owner", async () => {
    const owner = await registerUser("board-owner@taskflow.test");
    const outsider = await registerUser("board-outsider@taskflow.test");
    const board = await createBoard(owner.token, "Owner Board");

    const ownerBoards = await api()
      .get("/api/boards")
      .set("Authorization", authHeader(owner.token))
      .expect(200);

    assert.equal(ownerBoards.body.length, 1);
    assert.equal(ownerBoards.body[0].title, "Owner Board");
    assert.equal(ownerBoards.body[0].totalTasks, 0);

    await api()
      .get(`/api/boards/${board._id}`)
      .set("Authorization", authHeader(outsider.token))
      .expect(404);
  });
});

describe("task API", () => {
  it("creates, filters, moves, and deletes tasks for an owned board", async () => {
    const user = await registerUser("task-user@taskflow.test");
    const board = await createBoard(user.token);

    const created = await api()
      .post("/api/tasks")
      .set("Authorization", authHeader(user.token))
      .send({
        title: "Build smoke tests",
        description: "Cover the most important API flow",
        priority: "high",
        estimatedEffort: 3,
        board: board._id
      })
      .expect(201);

    assert.equal(created.body.status, "todo");
    assert.equal(created.body.priority, "high");

    const filtered = await api()
      .get("/api/tasks?status=todo&search=smoke")
      .set("Authorization", authHeader(user.token))
      .expect(200);

    assert.equal(filtered.body.pagination.total, 1);
    assert.equal(filtered.body.data[0].title, "Build smoke tests");

    const moved = await api()
      .patch(`/api/tasks/${created.body._id}/move`)
      .set("Authorization", authHeader(user.token))
      .send({ status: "done" })
      .expect(200);

    assert.equal(moved.body.status, "done");

    await api()
      .delete(`/api/tasks/${created.body._id}`)
      .set("Authorization", authHeader(user.token))
      .expect(200);

    const afterDelete = await api()
      .get("/api/tasks")
      .set("Authorization", authHeader(user.token))
      .expect(200);

    assert.equal(afterDelete.body.pagination.total, 0);
  });

  it("does not allow tasks to be created on another user's board", async () => {
    const owner = await registerUser("task-owner@taskflow.test");
    const outsider = await registerUser("task-outsider@taskflow.test");
    const board = await createBoard(owner.token, "Private Board");

    const response = await api()
      .post("/api/tasks")
      .set("Authorization", authHeader(outsider.token))
      .send({
        title: "Unauthorized task",
        board: board._id
      })
      .expect(404);

    assert.equal(response.body.message, "Board not found");
  });
});
