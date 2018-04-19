const express = require("express");
const router = express.Router();

const State = require("../model/State");

router.post("/state/:stateId", async (req, res, next) => {
    try {
        let state = await State.stateWithId(req.params.stateId);
        res.json({ state });
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
});

router.post("/all_states", async (req, res, next) => {
    try {
        let states = await State.allStates();
        res.json({ states });
    } catch (e) {
        res.json({ error: e });
    }
});

module.exports = router;
