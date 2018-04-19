"use strict";
/*

                __
               /\/'-,
       ,--'''''   /"
 ____,'.  )       \___
'"""""------'"""`-----'

*/

var loadStates = function() {
    return new Promise(function(resolve, reject) {
        axios
            .post("/api/all_states", {})
            .then(function(res) {
                res = res.data;
                if (res.error) {
                    console.log(res.error);
                    reject();
                } else {
                    resolve(res.states);
                }
            })
            .catch(function(err) {
                console.log(err);
                reject();
            });
    });
};

var loadCounties = function(stateId) {
    return new Promise(function(resolve, reject) {
        axios
            .post("/api/state/" + stateId, {})
            .then(function(res) {
                console.log(res);
                res = res.data;
                if (res.error) {
                    console.log(res.error);
                    reject();
                } else {
                    resolve(res.state.counties);
                }
            })
            .catch(function(err) {
                console.log(err);
                reject();
            });
    });
};
