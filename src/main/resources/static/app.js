"use strict";
const MAX_MISTAKES = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function requireElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`The game UI is missing ${selector}.`);
    }
    return element;
}
const hintElement = requireElement("#hint");
const mistakesElement = requireElement("#mistakes");
const wrongLettersElement = requireElement("#wrong-letters");
const wordElement = requireElement("#word");
const messageElement = requireElement("#message");
const keyboardElement = requireElement("#keyboard");
const restartButton = requireElement("#restart");
const state = {
    puzzle: null,
    guessedLetters: new Set(),
    wrongLetters: new Set(),
    remainingAttempts: MAX_MISTAKES,
    status: "loading",
};
async function fetchPuzzle() {
    state.status = "loading";
    render();
    try {
        const response = await fetch("/api/word");
        const puzzle = (await response.json());
        state.puzzle = {
            word: puzzle.word.toUpperCase(),
            hint: puzzle.hint,
        };
        state.guessedLetters = new Set();
        state.wrongLetters = new Set();
        state.remainingAttempts = MAX_MISTAKES;
        state.status = "playing";
    }
    catch (error) {
        state.puzzle = null;
        state.status = "lost";
        messageElement.textContent = "The server disappeared. Refresh and try again.";
        messageElement.className = "message lose";
        console.error(error);
    }
    render();
}
function guessLetter(letter) {
    if (state.status !== "playing" || !state.puzzle) {
        return;
    }
    const upperLetter = letter.toUpperCase();
    if (state.guessedLetters.has(upperLetter) || state.wrongLetters.has(upperLetter)) {
        return;
    }
    if (state.puzzle.word.includes(upperLetter)) {
        state.guessedLetters.add(upperLetter);
    }
    else {
        state.wrongLetters.add(upperLetter);
        state.remainingAttempts -= 1;
    }
    updateStatus();
    render();
}
function updateStatus() {
    if (!state.puzzle) {
        return;
    }
    const allLettersRevealed = [...state.puzzle.word].every((letter) => state.guessedLetters.has(letter));
    if (allLettersRevealed) {
        state.status = "won";
        return;
    }
    if (state.remainingAttempts <= 0) {
        state.status = "lost";
    }
}
function render() {
    renderHint();
    renderStats();
    renderWord();
    renderKeyboard();
    renderMessage();
}
function renderHint() {
    if (state.status === "loading") {
        hintElement.textContent = "Loading puzzle...";
        return;
    }
    hintElement.textContent = state.puzzle?.hint ?? "No puzzle loaded.";
}
function renderStats() {
    const mistakes = MAX_MISTAKES - state.remainingAttempts;
    mistakesElement.textContent = `${mistakes} / ${MAX_MISTAKES}`;
    wrongLettersElement.textContent =
        state.wrongLetters.size > 0 ? [...state.wrongLetters].join(", ") : "None";
}
function renderWord() {
    if (!state.puzzle) {
        wordElement.innerHTML = "";
        return;
    }
    const letters = [...state.puzzle.word]
        .map((letter) => {
        const shouldReveal = state.guessedLetters.has(letter) || state.status === "lost";
        const visibleCharacter = shouldReveal ? letter : "_";
        return `<span class="slot">${visibleCharacter}</span>`;
    })
        .join("");
    wordElement.innerHTML = letters;
}
function renderKeyboard() {
    keyboardElement.innerHTML = "";
    for (const letter of ALPHABET) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "key";
        button.textContent = letter;
        button.disabled = state.status !== "playing";
        if (state.guessedLetters.has(letter)) {
            button.classList.add("correct");
            button.disabled = true;
        }
        if (state.wrongLetters.has(letter)) {
            button.classList.add("wrong");
            button.disabled = true;
        }
        button.addEventListener("click", () => guessLetter(letter));
        keyboardElement.appendChild(button);
    }
}
function renderMessage() {
    messageElement.className = "message";
    if (state.status === "loading") {
        messageElement.textContent = "Calling in a new word...";
        return;
    }
    if (!state.puzzle) {
        messageElement.textContent = "No puzzle available.";
        return;
    }
    if (state.status === "won") {
        messageElement.textContent = `You won. "${state.puzzle.word}" is safe.`;
        messageElement.classList.add("win");
        return;
    }
    if (state.status === "lost") {
        messageElement.textContent = `Out of guesses. The word was "${state.puzzle.word}".`;
        messageElement.classList.add("lose");
        return;
    }
    messageElement.textContent = "Use the on-screen keys or your keyboard.";
}
document.addEventListener("keydown", (event) => {
    const { key } = event;
    if (key.length !== 1 || key < "a" || key > "z") {
        return;
    }
    guessLetter(key);
});
restartButton.addEventListener("click", () => {
    void fetchPuzzle();
});
void fetchPuzzle();
