/* OS KESPER V3 - LIVE TIMER */

const TimerManager = {
  endAt: null,

  update(currentData) {
    const serverTime = Number(currentData.serverTime);
    const endTime = Number(currentData.endTime);

    if (!Number.isFinite(serverTime) ||
        !Number.isFinite(endTime)) {
      this.endAt = null;
      this.render();
      return;
    }

    // Convert server countdown to local clock deadline.
    this.endAt = Date.now() + (endTime - serverTime);
    this.render();
  },

  render() {
    const element = document.getElementById("timer");

    if (!this.endAt) {
      element.textContent = "--:--";
      return;
    }

    const seconds = Math.max(
      0,
      Math.ceil((this.endAt - Date.now()) / 1000)
    );

    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    element.textContent =
      String(minutes).padStart(2, "0") +
      ":" +
      String(remaining).padStart(2, "0");
  },

  start() {
    this.stop();
    this.interval = setInterval(() => this.render(), 250);
  },

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
};
