/* OS KESPER V3 - CLOUDFLARE API CONNECTOR */

const API = {

  baseURL: "https://wingo-proxy.indrajitbhunia502.workers.dev",

  async request(path) {
    let response;

    try {
      response = await fetch(this.baseURL + path, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store",
        credentials: "omit"
      });
    } catch (error) {
      throw new Error("Network error: " + error.message);
    }

    if (!response.ok) {
      throw new Error("API HTTP Error: " + response.status);
    }

    return response.json();
  },

  async getCurrent() {
    const json = await this.request("/current");

    if (json.code !== 0 || !json.data) {
      throw new Error("Invalid current period data");
    }

    return {
      issueNumber: String(json.data.issueNumber),
      startTime: Number(json.data.startTime),
      endTime: Number(json.data.endTime),
      countdown: Number(json.data.countdown),
      serverTime: Number(json.serverTime),
      gameCode: json.data.gameCode
    };
  },

  async getHistory(pageNo = 1) {
    const page = Number(pageNo);

    if (!Number.isInteger(page) || page < 1 || page > 50) {
      throw new Error("Invalid history page");
    }

    const json = await this.request(
      "/history?pageNo=" + page
    );

    if (
      json.code !== 0 ||
      !json.data ||
      !Array.isArray(json.data.list)
    ) {
      throw new Error("Invalid history data");
    }

    return {
      list: json.data.list.map(item => ({
        issueNumber: String(item.issueNumber),
        number: Number(item.number),
        color: String(item.color || ""),
        premium: String(item.premium || "")
      })),
      totalCount: json.data.totalCount,
      totalPage: json.data.totalPage
    };
  },

  async testConnection() {
    const result = {
      current: false,
      history: false
    };

    try {
      await this.getCurrent();
      result.current = true;
    } catch (error) {
      result.currentError = error.message;
    }

    try {
      await this.getHistory();
      result.history = true;
    } catch (error) {
      result.historyError = error.message;
    }

    return result;
  }

};
