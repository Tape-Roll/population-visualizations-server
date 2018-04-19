const express = require("express");
const router = express.Router();

router.post("/state/:stateId", (req, res, next) => {
    console.log(req.params.stateId);
    req.json({ error: false });
});

module.exports = router;
