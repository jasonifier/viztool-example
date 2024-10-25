const testDataValues = [
  {"date":"2015-12-20","value":"19"},
  {"date":"2015-12-21","value":"18"},
  {"date":"2015-12-22","value":"25"},
  {"date":"2015-12-23","value":"28"},
  {"date":"2016-12-24","value":"30"}
];

function nestDataByYear(data) {
    const groupByResult = {};
    data.forEach( entry => {
      const dateObj = new Date(entry.date);
      const year = dateObj.getUTCFullYear();
      if (year in groupByResult) {
        groupByResult[year].push(entry);
      } else {
        groupByResult[year] = [entry];
      }
    });
    const result = [];
    const entries = Object.entries(groupByResult);
    entries.forEach(([k, v]) => {result.push({"key": k, "values": v})});
    result.sort((b, a) => a.key - b.key);
    return result;
};