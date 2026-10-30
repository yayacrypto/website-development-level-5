// All "ask" logic lives here so it is easy to test without starting a server.

const MAX_QUESTION_LENGTH = 500;

export function validateQuestion(body) {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Send a JSON object." };
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (question === "") return { ok: false, error: "Please type a question." };
  if (question.length > MAX_QUESTION_LENGTH) {
    return { ok: false, error: "Keep the question under " + MAX_QUESTION_LENGTH + " characters." };
  }
  return { ok: true, question };
}

export function demoAnswer(question) {
  return (
    "Demo answer. No AI key is configured, so this is a fixed reply.\n\n" +
    'You asked: "' + question + '"\n\n' +
    "Break the problem into one small step, test it in the browser, and read the exact error message. " +
    "Add an AI key on the server to get real answers (see README)."
  );
}

// Calls an OpenAI-compatible chat completions endpoint. The key comes from the
// environment on the server. It is never sent to the browser.
export async function liveAnswer(question, config, fetchImpl = fetch) {
  const response = await fetchImpl(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + config.key,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are a patient tutor for beginners learning HTML, CSS, and JavaScript. " +
            "Answer in under 150 words. If you are not sure, say so.",
        },
        { role: "user", content: question },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    // Do not forward provider error text: it can reveal account details.
    throw new Error("The AI service returned status " + response.status + ".");
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || text === "") throw new Error("The AI service sent an empty answer.");
  return text;
}

export function makeRateLimiter(limit, windowMs, now = Date.now) {
  const hits = new Map();
  return function allow(id) {
    const time = now();
    const recent = (hits.get(id) || []).filter((t) => time - t < windowMs);
    if (recent.length >= limit) {
      hits.set(id, recent);
      return false;
    }
    recent.push(time);
    hits.set(id, recent);
    return true;
  };
}
