/* OS KESPER V3 - API CONNECTOR */

const API = {

  endpoints: {
    current:
      "https://maanwin.co/webapi/kv/issue/WinGo_1M",

    history:
      "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"
  },

  async request(url) {

    let response;

    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json, text/plain, */*"
        },
        cache: "no-store",
        credentials: "omit"
      });
    } catch (error) {
      throw new Error("Network/CORS error: " + error.message);
    }

    if (!response.ok) {
      throw new Error("HTTP Error: " + response.status);
    }

    return response.json();
  },

  async getCurrent() {

    const json = await this.request(this.endpoints.current);

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

    const url = this.endpoints.history +
      "?pageNo=" + pageNo;

    const json = await this.request(url);

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
