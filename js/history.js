/* OS KESPER V3 - HISTORY */

const HistoryManager = {
  rows: [],

  async sync() {
    const data = await API.getHistory();

    this.rows = Database.mergeHistory(data.list);

    return {
      rows: this.rows,
      totalCount: data.totalCount || this.rows.length,
      totalPage: data.totalPage || 1
    };
  },

  getRows() {
    return this.rows.length
      ? this.rows
      : Database.getHistory();
  },

  getLatest() {
    return this.getRows()[0] || null;
  },

  getColor(row) {
    return String(row.color || "").toLowerCase();
  },

  getSize(row) {
    const n = Number(row.number);
    return n >= 5 ? "BIG" : "SMALL";
  }
};
