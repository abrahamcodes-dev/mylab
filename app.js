const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const trackLabel = document.getElementById("trackLabel");

const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const back10Btn = document.getElementById("back10Btn");
const forward10Btn = document.getElementById("forward10Btn");

const volume = document.getElementById("volume");
const volumeOut = document.getElementById("volumeOut");

const speed = document.getElementById("speed");

const seek = document.getElementById("seek");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");

let objectUrl = null;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function setEnabled(enabled) {
  playPauseBtn.disabled = !enabled;
  muteBtn.disabled = !enabled;
  forward10Btn.disabled = !enabled;
  volume.disabled = !enabled;
  speed.disabled = !enabled;
  seek.disabled = !enabled;
}

function updatePlayPauseLabel() {
  playPauseBtn.textContent = audio.paused ? "Play" : "Pause";
}

function updateMuteLabel() {
  muteBtn.textContent = audio.muted ? "Unmute" : "Mute";
}

function updateVolumeLabel() {
  const pct = Math.round(Number(volume.value) * 100);
  volumeOut.textContent = `${pct}%`;
}

function updateTimeUI() {
  timeCurrent.textContent = formatTime(audio.currentTime);
  timeTotal.textContent = formatTime(audio.duration);
  if (Number.isFinite(audio.duration)) {
    seek.max = String(audio.duration);
    seek.value = String(audio.currentTime);
  } else {
    seek.max = "0";
    seek.value = "0";
  }
}

function skipBy(deltaSeconds) {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const next = clamp((audio.currentTime || 0) + deltaSeconds, 0, Math.max(0, duration));
  audio.currentTime = next;
}

function loadFromFile(file) {
  if (!file) return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);

  objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  audio.load();

  trackLabel.textContent = file.name;
  setEnabled(true);

  audio.muted = false;
  updateMuteLabel();
  updatePlayPauseLabel();

  audio.playbackRate = Number(speed.value);

  audio.volume = Number(volume.value);
  updateVolumeLabel();
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  loadFromFile(file);
});

playPauseBtn.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch {

    }
  } else {
    audio.pause();
  }
  updatePlayPauseLabel();
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  updateMuteLabel();
});

back10Btn.addEventListener("click", () => skipBy(-10));
forward10Btn.addEventListener("click", () => skipBy(10));

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  if (audio.volume > 0 && audio.muted) {
    audio.muted = false;
    updateMuteLabel();
  }
  updateVolumeLabel();
});

speed.addEventListener("change", () => {
  audio.playbackRate = Number(speed.value);
});

seek.addEventListener("input", () => {
  audio.currentTime = Number(seek.value);
});

audio.addEventListener("play", updatePlayPauseLabel);
audio.addEventListener("pause", updatePlayPauseLabel);
audio.addEventListener("volumechange", updateMuteLabel);
audio.addEventListener("timeupdate", updateTimeUI);
audio.addEventListener("durationchange", updateTimeUI);
audio.addEventListener("loadedmetadata", updateTimeUI);
audio.addEventListener("ended", updatePlayPauseLabel);

function isTypingTarget(el) {
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return Boolean(el.isContentEditable);
}

document.addEventListener("keydown", (e) => {
  if (playPauseBtn.disabled) return;
  if (e.defaultPrevented) return;
  if (isTypingTarget(e.target)) return;

  if (e.code === "Space") {
    e.preventDefault();
    playPauseBtn.click();
    return;
  }

  if (e.code === "ArrowRight") {
    e.preventDefault();
    skipBy(10);
    return;
  }

  if (e.code === "ArrowLeft") {
    e.preventDefault();
    skipBy(-10);
    return;
  }
});

setEnabled(false);
audio.volume = Number(volume.value);
audio.playbackRate = Number(speed.value);
updateVolumeLabel();
updateMuteLabel();
updatePlayPauseLabel();
updateTimeUI();

window.addEventListener("beforeunload", () => {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});

