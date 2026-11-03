/* OS KESPER V3 - LIVE HISTORY MANAGER */

const HistoryManager = {
  rows: [],

  async sync() {
    const data = await API.getHistory(1);

    this.rows = Database.mergeHistory(data.list);

    return {
      rows: this.rows,
      totalCount: data.totalCount || this.rows.length,
      totalPage: data.totalPage || 1
    };
  },

  async syncAll() {
    // First page
    const first = await API.getHistory(1);

    let allRows = [...first.list];

    const totalPages = Math.min(
      Number(first.totalPage) || 1,
      50
    );

    // Fetch remaining pages in batches of 5
    for (let start = 2; start <= totalPages; start += 5) {
      const end = Math.min(start + 4, totalPages);

      const requests = [];

      for (let page = start; page <= end; page++) {
        requests.push(API.getHistory(page));
      }

      const results = await Promise.all(requests);

      results.forEach(data => {
        allRows.push(...data.list);
      });
    }

    // Remove duplicate issue numbers
    const unique = new Map();

    allRows.forEach(row => {
      unique.set(String(row.issueNumber), row);
    });

    const sorted = [...unique.values()]
      .sort((a, b) =>
        String(b.issueNumber).localeCompare(
          String(a.issueNumber)
        )
      )
      .slice(0, 500);

    // Replace old cache with complete fresh history
    Database.saveHistory(sorted);

    this.rows = sorted;

    return {
      rows: this.rows,
      totalCount: first.totalCount || this.rows.length,
      totalPage: totalPages
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
