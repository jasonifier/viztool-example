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

function reduceByWeek(data) {
    const groupByYear = {};
    data.forEach( entry => {
      const dateObj = new Date(entry.date);
      const year = dateObj.getUTCFullYear();
      const timeWeek = d3.utcSunday;
      // add week number as attribute for splitting data
      entry.weekNum = timeWeek.count(
        d3.utcYear(d3.timeDay(dateObj)),
        d3.timeDay(dateObj)
      ).toString();
      if (year in groupByYear) {
        groupByYear[year].push(entry);
      } else {
        groupByYear[year] = [entry];
      }
    });

    // Collect records per weekNum in each year of data
    const tmpResult = {};
    var tmpEntries = {};
    for (year in groupByYear) {
      const yearEntries = groupByYear[year];
      yearEntries.forEach( entry => {
        if (entry.weekNum in tmpEntries) {
          tmpEntries[entry.weekNum]["dates"].push(entry.date);
          tmpEntries[entry.weekNum]["values"].push(entry.value);
        } else {
          tmpEntries[entry.weekNum] = {
            "dates": [entry.date],
            "values": [entry.value]
          };
        }
      });
      tmpResult[year] = JSON.parse(JSON.stringify(tmpEntries));
      Object.keys(tmpEntries).forEach(k => {delete tmpEntries[k]});
    };

    // Compute aggregations in each year of data
    const result = [];
    var tmpAgg = {};
    for (year in tmpResult) {
      var arr = [];
      Object.entries(tmpResult[year]).forEach(([key, d]) => {
        tmpAgg.weekNum = key;
        tmpAgg.minDate = d3.min(d.dates);
        tmpAgg.maxDate = d3.max(d.dates);
        tmpAgg.totalCount = d3.sum(d.values.map(v => Number(v)));
        const rec = JSON.parse(JSON.stringify(tmpAgg));
        arr.push(rec);
        Object.keys(tmpAgg).forEach(k => {delete tmpAgg[k]});
      });
      result.push({"key": year, "values": arr});
    };
    return result;
};

function collectValues(d,
  {fieldName = "fieldName"} = {}
) {
  var values = [];
  d.forEach( entry => {
    const vals = entry.values;
    const fieldValues = vals.map(v => {return v[fieldName]});
    values = values.concat(fieldValues);
  });
  return values;
};