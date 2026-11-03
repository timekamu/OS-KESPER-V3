/* OS KESPER V3 - LIVE HISTORICAL ANALYSIS */

const AnalysisEngine = {

  calculate(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("No historical data available.");
    }

    const numbers = {};
    const colors = {};
    const sizes = { BIG: 0, SMALL: 0 };

    for (let i = 0; i <= 9; i++) {
      numbers[i] = 0;
    }

    const validRows = rows.filter(row => {
      return /^\d$/.test(String(row.number));
    });

    if (!validRows.length) {
      throw new Error("No valid historical results.");
    }

    validRows.forEach(row => {
      const number = Number(row.number);
      const color = String(row.color || "").toLowerCase();

      numbers[number]++;

      if (number >= 5) {
        sizes.BIG++;
      } else {
        sizes.SMALL++;
      }

      color.split(",").forEach(c => {
        c = c.trim();
        if (c) {
          colors[c] = (colors[c] || 0) + 1;
        }
      });
    });

    const ranked = Object.entries(numbers).sort(
      (a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0])
    );

    const selectedNumber = Number(ranked[0][0]);

    const selectedSize =
      selectedNumber >= 5 ? "BIG" : "SMALL";

    const matching = validRows.find(
      row => Number(row.number) === selectedNumber
    );

    const selectedColor = matching
      ? String(matching.color || "UNKNOWN").toUpperCase()
      : "UNKNOWN";

    const total = validRows.length;

    return {
      number: selectedNumber,
      size: selectedSize,
      color: selectedColor,
      sampleCount: total,
      frequency: (
        ranked[0][1] / total * 100
      ).toFixed(1) + "%",
      numberFrequencies: numbers,
      colorFrequencies: colors,
      sizeFrequencies: sizes,
      method: "Live Historical Frequency",
      updatedAt: Date.now()
    };
  },

  analyze(period, rows) {
    // Always calculate again from the latest supplied history.
    const result = this.calculate(rows);

    return {
      result: result,
      reused: false
    };
  }
};
