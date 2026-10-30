<img src="assets/hero.png" alt="Build the full project: a chat app, a small server, a locked secret key, and a finish flag" width="100%">

# Website development • Level 5 + AI

Build a complete small project: a web page, a server, and an AI service, with the secret key kept safe on the server.

Previous: [Level 1](https://github.com/yayacrypto/website-development-level-1), [Level 2](https://github.com/yayacrypto/website-development-level-2), [Level 3](https://github.com/yayacrypto/website-development-level-3), [Level 4](https://github.com/yayacrypto/website-development-level-4).

## Who this is for

Learners who finished Level 4. You need [Node.js](https://nodejs.org) 20.6 or newer. The project has no dependencies to install. A paid AI key is optional: the app has a demo mode.

## What you will build

Study Buddy: a page where you ask a beginner web development question. The browser sends it to your own server. The server checks the input, limits how often it can be used, and either returns a demo reply or asks an AI service. The key lives only on the server.

## Start here

```bash
npm start
```

Open `http://localhost:3000`. Without a key, the app runs in demo mode and says so on the page.

Run the tests:

```bash
npm test
```

To use a real AI service, you need an account and a key from a provider with an OpenAI-compatible chat API. Using it may cost money, so check the provider's pricing and set a spending limit first.

1. Copy `.env.example` to `.env`.
2. Fill in `AI_API_KEY` and `AI_MODEL`. Change `AI_API_URL` if your provider needs a different address.
3. Run `npm run start:env`.

`.env` is listed in `.gitignore`, so Git will not commit it. Keep it that way.

```text
website-development-level-5/
├── README.md
├── LICENSE
├── package.json
├── .env.example
├── .gitignore
├── src/
│   ├── server.js
│   └── ask.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── test/
│   └── ask.test.js
└── assets/
    └── hero.png
```

## What is new in Level 5

### 1. Front end, back end, and the request between them

The front end runs in the visitor's browser. Anyone can read its code. The back end runs on a computer you control. Browsers ask it for things using HTTP requests.

```text
Browser  --POST /api/ask {question}-->  Your server  --request with key-->  AI service
Browser  <--{answer}--------------------  Your server  <--answer-------------  AI service
```

`public/app.js` sends the question. `src/server.js` receives it.

### 2. Secrets belong on the server

Never put an API key in HTML, CSS, or front-end JavaScript. Visitors can read it in DevTools and spend your money. Here the key is read from an environment variable on the server and never sent to the browser.

```javascript
const config = { key: env.AI_API_KEY || "", model: env.AI_MODEL || "" };
```

If a key ever leaks, revoke it at the provider and create a new one. Deleting it from your code is not enough.

### 3. Validate every input

The server cannot trust the browser. Anyone can send a request without using your page. `src/ask.js` rejects empty, oversized, or malformed input before any AI call. It also hides provider error messages and blocks paths that try to leave the `public` folder.

### 4. Limit abuse and cost

A public endpoint that calls a paid service needs limits. This project has a small per-address rate limit, a request size cap, a response length cap, and a timeout. A real project also needs a spending limit at the provider and, for any private data, accounts and authentication.

### 5. Tests

Tests are small programs that check your code. `test/ask.test.js` uses Node's built-in test runner to check validation, the rate limiter, the AI call (with a fake service, so no key or cost), and the server. Write a test for each bug you fix.

## How to build with AI

### Step 1. Plan the architecture first

**Prompt to try**

> I am building a small web app where a browser page calls my own Node.js server, and the server calls an AI API. Draw the request flow in text and list where the secret key may exist and where it must not.

### Step 2. Build the smallest working path

**Prompt to try**

> Help me write a Node.js server with one POST route that returns a fixed JSON answer. No libraries. Explain each part. We will add the AI call afterward.

### Step 3. Have AI attack your design

**Prompt to try**

> Review this server code like a security tester. List ways someone could abuse /api/ask, such as huge input, too many requests, or file path tricks. For each, say how I can test it myself.

### Step 4. Ask for tests, then read them

**Prompt to try**

> Write node:test tests for this validation function, including empty input, oversized input, and wrong types. Explain what each test proves.

### Step 5. Check what AI claims

AI can invent API fields, model names, or prices. Check the provider's documentation for the exact request format, model names, and costs before you rely on any of them.

**Prompt to try**

> I will paste the provider's documentation. Compare it with my request code, and list differences. Quote the documentation lines you used.

## Safety habits

- Never commit `.env`, keys, or tokens. Check `git status` before each commit.
- Never paste a real key into an AI prompt, a screenshot, or an issue.
- Set a low spending limit before you use a paid key.
- Do not show raw error messages from other services to visitors.
- Do not send private or personal data to an AI service unless you understand its data policy.
- This demo has no login. Do not deploy it publicly with a real key attached unless you understand the cost risk.

## Test checklist

- [ ] `npm test` passes.
- [ ] Demo mode works with no key.
- [ ] Empty, very long, and `<script>` questions are handled safely.
- [ ] More than 10 requests in a minute get a "Too many questions" message.
- [ ] Searching your repository for your key finds nothing.
- [ ] DevTools Network tab shows no key in any request from the browser.

## Final project: design your own

Use the same structure to build your own capstone. Pick one:

1. A flashcard maker that asks the AI for quiz questions on a topic you enter.
2. A recipe helper that suggests a meal from ingredients you list.
3. A code explainer that explains a small pasted snippet.

Write down, before you code: who it is for, what one thing it does, what data it touches, and what could go wrong. Build the smallest version first. Add tests. Publish it only after the safety checklist passes.

## What comes next

You now have a map of the whole path: pages, styling, JavaScript, tools, publishing, and a small back end. Good next steps are databases, user accounts and authentication, a front-end framework such as React, and deploying a server. Each one is easier now that you can read errors, use Git, and test your own work.

## References

- [Node.js: Getting started](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [Node.js: Test runner](https://nodejs.org/api/test.html)
- [MDN: Server-side website programming](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side)
- [OWASP: API security top 10](https://owasp.org/API-Security/)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
