const mongoose = require("mongoose");

const stateSchema = mongoose.Schema({
    name: { type: String, unique: true },
    state_id: Number,
    years: {},
    counties: [
        {
            name: String,
            county_id: Number,
            years: {}
        }
    ]
});

stateSchema.statics.stateWithId = function(id, statisticsLabel, cb) {
    let projection = { _id: 0, "counties.county_id": 1, "counties.name": 1 };

    addYearProjections(projection, "counties.years.", `.statisticsTable.${statisticsLabel}`);

    return this.findOne({ state_id: id }, projection, cb);
};

stateSchema.statics.allStates = function(statisticsLabel, cb) {
    // Stat_id < 1000000 because this also finds counties for some reason

    let projection = { _id: 0, state_id: 1, name: 1 };

    addYearProjections(projection, "years.", `.statisticsTable.${statisticsLabel}`);

    return this.find({}, projection, cb);
};

function addYearProjections(obj, pre = "years.", post = ".statisticsTable.total_pop") {
    lowYear = 2009;
    highYear = 2016;
    for (let i = lowYear; i <= highYear; i++) {
        obj[`${pre}${i}${post}`] = 1;
    }
    return obj;
}

module.exports = mongoose.model("State", stateSchema);
