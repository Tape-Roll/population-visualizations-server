const express = require("express");
const router = express.Router();

const State = require("../model/State");

router.post("/state/:stateId", async (req, res, next) => {
    var stat = req.body.requestedStat || "total_pop";
    console.log(stat);
    try {
        let state = await State.stateWithId(req.params.stateId, stat);
        res.json({ state });
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
});

router.post("/all_states", async (req, res, next) => {
    var stat = req.body.requestedStat || "total_pop";
    console.log(stat);
    try {
        let states = await State.allStates(stat);
        res.json({ states });
    } catch (e) {
        res.json({ error: e });
    }
});

module.exports = router;
