const mongoose = require("mongoose");

const stateSchema = mongoose.Schema({
    name: { type: String, unique: true },
    state_id: Number,
    years: [
        {
            year: Number,
            statisticsTable: {}
        }
    ],
    counties: [
        {
            name: String,
            county_id: Number,
            years: [
                {
                    year: Number,
                    statisticsTable: {}
                }
            ]
        }
    ]
});

module.exports = mongoose.model("State", stateSchema);
