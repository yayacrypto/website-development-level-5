const form = document.querySelector("#ask-form");
const question = document.querySelector("#question");
const send = document.querySelector("#send");
const answer = document.querySelector("#answer");
const mode = document.querySelector("#mode");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  send.disabled = true;
  answer.hidden = false;
  answer.className = "answer";
  answer.textContent = "Thinking...";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.value }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");

    // textContent: the answer is untrusted text, never HTML.
    answer.textContent = data.answer;
    mode.hidden = false;
    mode.textContent = data.mode === "live" ? "Live AI answer" : "Demo mode: no AI key is set";
  } catch (error) {
    answer.className = "answer error";
    answer.textContent = "Sorry: " + error.message;
  } finally {
    send.disabled = false;
  }
});
