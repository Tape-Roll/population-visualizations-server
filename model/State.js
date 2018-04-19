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

stateSchema.statics.allStates = function(cb) {
    // Stat_id < 1000000 because this also finds counties for some reason
    lowYear = 2009;
    highYear = 2016;
    let projection = { _id: 0, state_id: 1, name: 1 };
    for (let i = lowYear; i <= highYear; i++) {
        projection[`years.${i}.statisticsTable.total_age`] = 1;
    }
    return this.find({}, projection, cb);
};

module.exports = mongoose.model("State", stateSchema);
