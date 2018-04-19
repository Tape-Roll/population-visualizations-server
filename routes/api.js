const express = require("express");
const router = express.Router();

const State = require("../model/State");

router.post("/state/:stateId", (req, res, next) => {
    console.log(req.params.stateId);
    res.json({ value: 3, name: "Georgia" });
});

router.post("/all_states", async (req, res, next) => {
    try {
        let states = await State.allStates();
        console.log(states);
        res.json({ states });
    } catch (e) {
        res.json({ error: e });
    }
});

module.exports = router;
