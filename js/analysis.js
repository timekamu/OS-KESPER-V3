/* OS KESPER V3 - STATISTICAL ANALYSIS */

const AnalysisEngine = {

  calculate(rows) {
    if (!rows || rows.length === 0) {
      throw new Error("No historical data available.");
    }

    const numbers = {};
    const colors = {};
    const sizes = {};

    for (let i = 0; i <= 9; i++) {
      numbers[i] = 0;
    }

    rows.forEach(row => {
      const number = Number(row.number);
      const color = String(row.color || "").toLowerCase();

      if (number >= 0 && number <= 9) {
        numbers[number]++;
      }

      color.split(",").forEach(c => {
        c = c.trim();
        if (c) colors[c] = (colors[c] || 0) + 1;
      });

      const size = number >= 5 ? "BIG" : "SMALL";
      sizes[size] = (sizes[size] || 0) + 1;
    });

    // Select the most frequent historical number.
    // Ties are resolved by the smaller number.
    const ranked = Object.entries(numbers)
      .sort((a, b) =>
        b[1] - a[1] || Number(a[0]) - Number(b[0])
      );

    const selectedNumber = Number(ranked[0][0]);
    const selectedSize = selectedNumber >= 5 ? "BIG" : "SMALL";

    // Find the most recently observed colour for that number.
    const matching = rows.find(
      row => Number(row.number) === selectedNumber
    );

    const selectedColor = matching
      ? String(matching.color || "UNKNOWN").toUpperCase()
      : "UNKNOWN";

    const total = rows.length;
    const numberFrequency = total
      ? (ranked[0][1] / total) * 100
      : 0;

    return {
      number: selectedNumber,
      size: selectedSize,
      color: selectedColor,
      sampleCount: total,
      frequency: numberFrequency.toFixed(1) + "%",
      numberFrequencies: numbers,
      colorFrequencies: colors,
      sizeFrequencies: sizes,
      method: "Historical frequency"
    };
  },

  analyze(period, rows) {
    // One saved analysis per period.
    const existing = Database.getPeriodAnalysis(period);

    if (existing) {
      return {
        result: existing,
        reused: true
      };
    }

    const result = this.calculate(rows);

    const saved = Database.savePeriodAnalysis(period, result);

    return {
      result: saved,
      reused: false
    };
  }
};
