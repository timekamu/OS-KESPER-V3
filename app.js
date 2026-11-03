/* =====================================
   OS KESPER V3
   MAIN APPLICATION CONTROLLER
   DEVELOPED BY @time.kamu
===================================== */

const App = {

  currentPeriod: null,
  busy: false,
  syncInterval: null,

  // INTRO ANIMATION
  async startIntro() {

    const intro = document.getElementById("introScreen");
    const main = document.getElementById("mainApp");

    const logo = document.getElementById("introLogo");
    const fallback = document.getElementById("logoFallback");

    logo.onerror = () => {
      logo.classList.remove("loaded");
      fallback.style.display = "block";
    };

    logo.onload = () => {
      logo.classList.add("loaded");
      fallback.style.display = "none";
    };

    if (logo.complete && logo.naturalWidth) {
      logo.classList.add("loaded");
      fallback.style.display = "none";
    }

    const checks = [
      "Identity verification",
      "Server connection",
      "Data initialization",
      "Interface preparation"
    ];

    for (let i = 0; i < checks.length; i++) {

      const label = document.getElementById("check" + (i + 1));
      const bar = document.getElementById("bar" + (i + 1));
      const count = document.getElementById("manifestCount");
      const steps = document.querySelectorAll(".intro-steps span");

      label.textContent = "SCANNING";

      for (let progress = 0; progress <= 100; progress += 10) {
        bar.style.width = progress + "%";
        await new Promise(resolve => setTimeout(resolve, 35));
      }

      label.textContent = i === 1 ? "READY" : "OK";
      count.textContent = (i + 1) + "/4";

      steps.forEach((step, index) => {
        step.classList.toggle("active", index <= i);
      });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    intro.style.opacity = "0";
    intro.style.transition = "opacity .5s";

    await new Promise(resolve => setTimeout(resolve, 500));

    intro.style.display = "none";
    main.classList.add("visible");
  },


  // PERIOD DISPLAY
  updatePeriod(period) {

    const previous = this.currentPeriod;
    this.currentPeriod = String(period);

    document.getElementById("periodNumber").textContent =
      this.currentPeriod;

    if (previous !== this.currentPeriod) {

      const saved = Database.getPeriodAnalysis(this.currentPeriod);

      if (saved) {
        this.showResult(saved);
      } else {
        this.clearResult();
      }
    }
  },


  // CLEAR RESULT
  clearResult() {

    document.getElementById("sizeResult").textContent = "--";
    document.getElementById("numberResult").textContent = "?";
    document.getElementById("colorResult").textContent = "--";

    document.getElementById("resultSubtitle").textContent =
      "Press Analysis to calculate";

    document.getElementById("analysisDetails").classList.remove("show");
  },


  // DISPLAY RESULT
  showResult(result) {

    document.getElementById("sizeResult").textContent =
      result.size;

    document.getElementById("numberResult").textContent =
      result.number;

    document.getElementById("colorResult").textContent =
      result.color;

    document.getElementById("sampleCount").textContent =
      result.sampleCount;

    document.getElementById("confidence").textContent =
      result.frequency;

    document.getElementById("resultSubtitle").textContent =
      "Historical frequency estimate";

    document.getElementById("analysisDetails").classList.add("show");

    this.applyResultColor(result.color);
  },


  // RESULT COLOR
  applyResultColor(color) {

    const circle = document.getElementById("numberResult");

    const value = String(color).toLowerCase();

    if (value.includes("violet")) {
      circle.style.background =
        "radial-gradient(circle at 35% 25%, #c17aff, #7220ba)";
      circle.style.borderColor = "#d2a0ff";

    } else if (value.includes("green")) {
      circle.style.background =
        "radial-gradient(circle at 35% 25%, #45e6a0, #087c4a)";
      circle.style.borderColor = "#72f0ba";

    } else {
      circle.style.background =
        "radial-gradient(circle at 35% 25%, #fa2739, #c40016)";
      circle.style.borderColor = "#ff6570";
    }
  },


  // ANALYSIS BUTTON
  async runAnalysis() {

    if (this.busy) return;

    if (!this.currentPeriod) {
      document.getElementById("resultSubtitle").textContent =
        "Waiting for current period";
      return;
    }

    this.busy = true;

    const button = document.getElementById("analysisButton");
    const progress = document.getElementById("analysisProgress");
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("analysisText");

    button.disabled = true;
    progress.classList.add("active");

    const messages = [
      "Collecting historical data...",
      "Checking number frequency...",
      "Analyzing colour distribution...",
      "Calculating statistical estimate..."
    ];

    try {

      const rows = HistoryManager.getRows();

      if (!rows.length) {
        throw new Error("No historical data available.");
      }

      for (let i = 0; i < messages.length; i++) {

        text.textContent = messages[i];

        const target = ((i + 1) / messages.length) * 100;

        for (
          let value = i * 25;
          value <= target;
          value += 5
        ) {
          fill.style.width = value + "%";
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const outcome = AnalysisEngine.analyze(
        this.currentPeriod,
        rows
      );

      this.showResult(outcome.result);

    } catch (error) {

      document.getElementById("resultSubtitle").textContent =
        error.message;

    } finally {

      await new Promise(resolve => setTimeout(resolve, 250));

      progress.classList.remove("active");
      fill.style.width = "0%";
      button.disabled = false;
      this.busy = false;
    }
  },


  // HIDE TOOL
  hideTool() {

    document.getElementById("floatingTool")
      .classList.add("hidden");

    document.getElementById("miniButton")
      .classList.add("visible");
  },


  // RESTORE TOOL
  restoreTool() {

    document.getElementById("floatingTool")
      .classList.remove("hidden");

    document.getElementById("miniButton")
      .classList.remove("visible");
  },


  // DRAG TOOL
  enableDrag() {

    const panel = document.getElementById("floatingTool");
    const handle = document.getElementById("dragHandle");

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("pointerdown", event => {

      if (event.target.closest("button")) return;

      dragging = true;

      const rect = panel.getBoundingClientRect();

      panel.style.transform = "none";
      panel.style.left = rect.left + "px";
      panel.style.top = rect.top + "px";

      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;

      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener("pointermove", event => {

      if (!dragging) return;

      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;

      const x = Math.max(
        0,
        Math.min(maxX, event.clientX - offsetX)
      );

      const y = Math.max(
        0,
        Math.min(maxY, event.clientY - offsetY)
      );

      panel.style.left = x + "px";
      panel.style.top = y + "px";
    });

    const stop = () => dragging = false;

    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  },


  // API SYNC
  async syncData() {

    try {

      const current = await API.getCurrent();

      if (!current.issueNumber) {
        throw new Error("Period number unavailable.");
      }

      this.updatePeriod(current.issueNumber);

      TimerManager.update(current);

      const history = await HistoryManager.sync();

      document.getElementById("connectionStatus")?.textContent;

      return history;

    } catch (error) {

      document.getElementById("frameNote").textContent =
        "Data sync: " + error.message;

      throw error;
    }
  },


  // INITIALIZATION
  async init() {

    await this.startIntro();

    this.enableDrag();

    document.getElementById("analysisButton")
      .addEventListener("click", () => this.runAnalysis());

    document.getElementById("hideButton")
      .addEventListener("click", () => this.hideTool());

    document.getElementById("miniButton")
      .addEventListener("click", () => this.restoreTool());

    TimerManager.start();

    try {
      await this.syncData();
    } catch (error) {
      console.warn("Initial API sync failed:", error.message);
    }

    // Refresh period and history periodically.
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncData();
      } catch (error) {
        console.warn("API refresh failed:", error.message);
      }
    }, 15000);
  }
};


// START APPLICATION
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
