/* OS KESPER V3 - API CONNECTION */

const API = {
  currentURL:
    "https://maanwin.co/webapi/kv/issue/WinGo_1M",

  historyURL:
    "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json",

  async request(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*"
      },
      credentials: "omit",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("API HTTP Error: " + response.status);
    }

    return response.json();
  },

  async getCurrent() {
    const json = await this.request(this.currentURL);

    if (json.code !== 0 || !json.data) {
      throw new Error("Invalid current period response.");
    }

    return json.data;
  },

  async getHistory() {
    const json = await this.request(this.historyURL);

    if (
      json.code !== 0 ||
      !json.data ||
      !Array.isArray(json.data.list)
    ) {
      throw new Error("Invalid history response.");
    }

    return json.data;
  }
};
