const display = document.getElementById("time-display");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const result = document.getElementById("result");
const scene = document.querySelector(".scene");

let remainingSeconds = 0;
let timerId = null;
let isRunning = false;

const pad = (value) => String(value).padStart(2, "0");

const updateDisplay = () => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  display.textContent = `${pad(minutes)}:${pad(seconds)}`;
};

const setInputsDisabled = (disabled) => {
  minutesInput.disabled = disabled;
  secondsInput.disabled = disabled;
};

const playAlarm = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 740;
  gainNode.gain.value = 0.12;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, 900);
};

const finishTimer = () => {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  updateDisplay();
  playAlarm();
  result.classList.add("show");
  result.setAttribute("aria-hidden", "false");
  scene.classList.add("finish");
  pauseButton.disabled = true;
  resetButton.disabled = false;
  startButton.disabled = false;
  setInputsDisabled(false);
};

const tick = () => {
  if (remainingSeconds <= 0) {
    finishTimer();
    return;
  }
  remainingSeconds -= 1;
  updateDisplay();
};

const startTimer = () => {
  if (isRunning) {
    return;
  }
  const minutes = Number(minutesInput.value);
  const seconds = Number(secondsInput.value);
  const total = minutes * 60 + seconds;

  if (Number.isNaN(total) || total <= 0) {
    display.textContent = "00:00";
    return;
  }

  if (!timerId) {
    remainingSeconds = total;
    updateDisplay();
  }

  isRunning = true;
  setInputsDisabled(true);
  scene.classList.remove("finish");
  result.classList.remove("show");
  result.setAttribute("aria-hidden", "true");
  startButton.disabled = true;
  pauseButton.disabled = false;
  resetButton.disabled = false;

  timerId = setInterval(tick, 1000);
};

const pauseTimer = () => {
  if (!isRunning) {
    return;
  }
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  startButton.disabled = false;
  pauseButton.disabled = true;
};

const resetTimer = () => {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  remainingSeconds = 0;
  updateDisplay();
  setInputsDisabled(false);
  startButton.disabled = false;
  pauseButton.disabled = true;
  resetButton.disabled = true;
  scene.classList.remove("finish");
  result.classList.remove("show");
  result.setAttribute("aria-hidden", "true");
};

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

updateDisplay();
