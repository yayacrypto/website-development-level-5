import test from "node:test";
import assert from "node:assert/strict";
import { validateQuestion, makeRateLimiter, liveAnswer } from "../src/ask.js";
import { createServer } from "../src/server.js";

test("validateQuestion rejects empty, long, and non-object input", () => {
  assert.equal(validateQuestion(null).ok, false);
  assert.equal(validateQuestion({ question: "   " }).ok, false);
  assert.equal(validateQuestion({ question: "a".repeat(501) }).ok, false);
  assert.deepEqual(validateQuestion({ question: "  hi " }), { ok: true, question: "hi" });
});

test("rate limiter blocks after the limit and recovers", () => {
  let time = 0;
  const allow = makeRateLimiter(2, 1000, () => time);
  assert.equal(allow("a"), true);
  assert.equal(allow("a"), true);
  assert.equal(allow("a"), false);
  assert.equal(allow("b"), true);
  time = 1500;
  assert.equal(allow("a"), true);
});

test("liveAnswer sends the key only to the provider and hides provider errors", async () => {
  let seen;
  const ok = async (url, options) => {
    seen = { url, auth: options.headers.Authorization };
    return { ok: true, json: async () => ({ choices: [{ message: { content: "Hello" } }] }) };
  };
  const text = await liveAnswer("q", { url: "https://example.test", key: "secret", model: "m" }, ok);
  assert.equal(text, "Hello");
  assert.equal(seen.auth, "Bearer secret");

  const bad = async () => ({ ok: false, status: 401, text: async () => "account details" });
  await assert.rejects(() => liveAnswer("q", { url: "x", key: "k", model: "m" }, bad), /status 401/);
});

test("server: demo mode answers, bad input is rejected, path traversal is blocked", async () => {
  const server = createServer({});
  await new Promise((resolve) => server.listen(0, resolve));
  const base = "http://localhost:" + server.address().port;

  const good = await fetch(base + "/api/ask", { method: "POST", body: JSON.stringify({ question: "What is CSS?" }) });
  const data = await good.json();
  assert.equal(good.status, 200);
  assert.equal(data.mode, "demo");

  const bad = await fetch(base + "/api/ask", { method: "POST", body: "not json" });
  assert.equal(bad.status, 400);

  const page = await fetch(base + "/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /^<!doctype html>/i);

  const sneaky = await fetch(base + "/..%2Fpackage.json");
  assert.notEqual(sneaky.status, 200);

  server.close();
});
