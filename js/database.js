/* OS KESPER V3 - DATABASE */

const Database = {
  historyKey: "os-kesper-history-v3",
  analysisKey: "os-kesper-analysis-v3",

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.historyKey) || "[]");
    } catch {
      return [];
    }
  },

  saveHistory(rows) {
    localStorage.setItem(
      this.historyKey,
      JSON.stringify(rows.slice(0, 1000))
    );
  },

  mergeHistory(incoming) {
    const map = new Map(
      this.getHistory().map(row => [String(row.issueNumber), row])
    );

    incoming.forEach(row => {
      map.set(String(row.issueNumber), row);
    });

    const rows = [...map.values()]
      .sort((a, b) =>
        String(b.issueNumber).localeCompare(String(a.issueNumber))
      )
      .slice(0, 1000);

    this.saveHistory(rows);
    return rows;
  },

  getAnalysis() {
    try {
      return JSON.parse(localStorage.getItem(this.analysisKey) || "{}");
    } catch {
      return {};
    }
  },

  getPeriodAnalysis(period) {
    return this.getAnalysis()[String(period)] || null;
  },

  savePeriodAnalysis(period, result) {
    const all = this.getAnalysis();
    const key = String(period);

    // Never replace an existing result for the same period.
    if (all[key]) return all[key];

    all[key] = {
      ...result,
      period: key,
      createdAt: new Date().toISOString()
    };

    // Retain the most recent 500 period analyses.
    const keys = Object.keys(all).sort().slice(-500);
    const trimmed = {};

    keys.forEach(k => trimmed[k] = all[k]);

    localStorage.setItem(this.analysisKey, JSON.stringify(trimmed));
    return all[key];
  }
};
