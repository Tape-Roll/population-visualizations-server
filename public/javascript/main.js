// Object that responds to events by modifying the map
// It also holds the data
function MapController() {
    this.states = {};
    this.counties = {};
    this.currYear = 2016;
    this.maxStateValue = 0;
    this.minStateValue = 100;
    this.maxCountyPop = 0;
    this.minCountyPop = 100;
    this.leftColor = "white";
    this.rightColor = "red";
    this.currentlySelectedStateId = null;
    this.init = function() {
        // Load data for states right at the beginning
        loadStates(filter.statName).then(
            function(stateArray) {
                // setup this.states
                this.findStateValues(stateArray);
                mapVisualization.setStateColor(
                    d3
                        .scaleLinear()
                        .domain([this.minStateValue, this.maxStateValue])
                        .range([this.leftColor, this.rightColor])
                );

                // Setup side bar initially
                this.updateSideBar(this.currentlySelectedStateId);

                // Set up tool tip
                mapVisualization.setMouseoverFormatterPercent(
                    filter.shouldFindPercentage || filter.shouldShowPercentage
                );

                // Setup map
                mapVisualization.requestUSTopoJSON(
                    function(err, geographyData) {
                        if (err) {
                            throw err;
                        } else {
                            // To rescale the key, rescale the colors, reset the key, and then
                            // rerender the key
                            //mapVisualization.renderKeyOnSVG("Test Statistic", this.color);
                            mapVisualization.renderUSOnSVG(
                                geographyData,
                                function(stateId) {
                                    // Getting state info
                                    return this.getState(stateId);
                                }.bind(this),
                                function(stateId) {
                                    return new Promise(
                                        function(resolve, reject) {
                                            return loadCounties(stateId, filter.statName).then(
                                                function(counts) {
                                                    // Getting county info
                                                    this.findCountyValues(counts);
                                                    mapVisualization.setCountyColor(
                                                        d3
                                                            .scaleLinear()
                                                            .domain([
                                                                this.minCountyValue,
                                                                this.maxCountyValue
                                                            ])
                                                            .range([
                                                                this.leftColor,
                                                                this.rightColor
                                                            ])
                                                    );

                                                    return resolve(
                                                        function(countyId) {
                                                            return this.getCounty(countyId);
                                                        }.bind(this)
                                                    );
                                                }.bind(this)
                                            );
                                        }.bind(this)
                                    );
                                }.bind(this)
                            );
                        }
                    }.bind(this)
                );
            }.bind(this)
        );
        window.addEventListener(
            "YearChanged",
            function(event) {
                this.currYear = event.detail;
                this.updateMap();
                this.updateSideBar(this.currentlySelectedStateId);
            }.bind(this)
        );

        window.addEventListener(
            "StatChanged",
            function(event) {
                this.updateMap(
                    function() {
                        this.updateSideBar(this.currentlySelectedStateId);
                    }.bind(this),
                    true
                );
            }.bind(this)
        );
        window.addEventListener(
            "SelectionChanged",
            function(event) {
                this.currentlySelectedStateId = event.detail;
                this.updateSideBar(this.currentlySelectedStateId);
            }.bind(this)
        );
    };
    this.updateSideBar = function(selectedStateId) {
        var elements;
        var title;
        if (selectedStateId) {
            elements = this.getCountiesInState(selectedStateId);
            title = this.states[parseFloat(selectedStateId)].name;
        } else {
            elements = this.statesToArray();
            title = "United States";
        }
        side_bar.update_side_bar(
            title,
            elements,
            filter.shouldShowPercentage || filter.shouldFindPercentage
        );
    };
    // Updates the map. Call this when some data has changed
    this.updateMap = function(postUpdate, stat_change = false) {
        var cb = function() {
            mapVisualization.setMouseoverFormatterPercent(
                filter.shouldFindPercentage || filter.shouldShowPercentage
            );

            mapVisualization.setStateColor(
                d3
                    .scaleLinear()
                    .domain([this.minStateValue, this.maxStateValue])
                    .range([this.leftColor, this.rightColor])
            );

            mapVisualization.setCountyColor(
                d3
                    .scaleLinear()
                    .domain([this.minCountyValue, this.maxCountyValue])
                    .range([this.leftColor, this.rightColor])
            );

            mapVisualization.recolorMap(
                function(id) {
                    var ret = this.getState(id);
                    if (ret === undefined) {
                        ret = this.getCounty(id);
                    } else {
                    }

                    return ret;
                }.bind(this)
            );

            if (postUpdate !== undefined) {
                postUpdate();
            }
        }.bind(this);

        if (stat_change) {
            // Stat changed!! uh oh
            var cbCount = 0;
            var expectedCount = 1;
            var callMe = function() {
                cbCount++;
                if (cbCount >= expectedCount) {
                    cb();
                }
            };
            if (mapVisualization.getCurrentlyZoomedInStateId() !== null) {
                // Need to load county
                expectedCount++;
                loadCounties(mapVisualization.getCurrentlyZoomedInStateId(), filter.statName).then(
                    function(counts) {
                        this.findCountyValues(counts);
                        console.log("County stat loaded");
                        callMe();
                    }.bind(this)
                );
            }

            // Load states
            loadStates(filter.statName).then(
                function(stateArray) {
                    this.findStateValues(stateArray);
                    console.log("State stat loaded");
                    callMe();
                }.bind(this)
            );
        } else {
            // Just a year change
            this.findStateValues();
            this.findCountyValues();

            cb();
        }
    };
    // Returns the state with the given id if it exists
    this.getState = function(id) {
        id = parseFloat(id);
        return this.states[parseFloat(id)];
    };
    this.statesToArray = function() {
        var states = [];
        for (stateId in this.states) {
            if (this.states.hasOwnProperty(stateId)) {
                states.push(this.states[stateId]);
            }
        }
        return states;
    };
    // Returns the county with the given id if it exists
    this.getCounty = function(id) {
        id = parseFloat(id);
        if (this.counties[id] === undefined || this.counties[id].value === undefined) {
            console.log("Missing county: ", this.counties);
            // Uh oh. The county isn't found or set up right
            return { name: "unknown", value: -1 };
        }
        return this.counties[id];
    };
    // Returns the counties of the state with the given id if it exists
    this.getCountiesInState = function(stateId) {
        stateId = "" + parseFloat(stateId);
        var countiesInState = [];
        for (countyId in this.counties) {
            if (this.counties.hasOwnProperty(countyId) && countyId.startsWith(stateId)) {
                countiesInState.push(this.counties[countyId]);
            }
        }
        return countiesInState;
    };
    // Updates the value for each state based on the currYear
    // Also updates minPop and maxPop for states
    this.findStateValues = function(stateArray) {
        this.maxStateValue = 0;
        this.minStateValue = 10000000000;
        var total = 0;
        if (stateArray !== undefined) {
            stateArray.forEach(
                function(element) {
                    var value = parseFloat(this.findValue(element));
                    element.value = value;
                    this.states[element.state_id] = element;
                    total += value;
                    if (value >= 0) {
                        this.minStateValue = Math.min(value, this.minStateValue);
                        this.maxStateValue = Math.max(value, this.maxStateValue);
                    }
                }.bind(this)
            );
        } else {
            Object.keys(this.states).forEach(
                function(key) {
                    var value = 0;
                    if (this.getState(key).years[this.currYear] === undefined) {
                        value = -1;
                    } else {
                        value = parseFloat(this.findValue(this.getState(key)));
                    }
                    this.getState(key).value = value;
                    total += value;
                    if (value >= 0) {
                        this.minStateValue = Math.min(value, this.minStateValue);
                        this.maxStateValue = Math.max(value, this.maxStateValue);
                    }
                }.bind(this)
            );
        }

        if (filter.shouldFindPercentage) {
            this.maxStateValue = 0;
            this.minStateValue = 100;
            Object.keys(this.states).forEach(
                function(key) {
                    this.getState(key).value /=
                        this.getState(key).years[this.currYear].statisticsTable.total_pop / 100;
                    if (this.getState(key).value >= 0) {
                        this.minStateValue = Math.min(this.getState(key).value, this.minStateValue);
                        this.maxStateValue = Math.max(this.getState(key).value, this.maxStateValue);
                    }
                }.bind(this)
            );
        }
    };

    this.findCountyValues = function(countyArray) {
        this.maxCountyValue = 0;
        this.minCountyValue = 10000000000;
        var total = 0;
        if (countyArray !== undefined) {
            try {
                countyArray.forEach(
                    function(element) {
                        this.counties[element.county_id] = element;
                        var pop = parseFloat(this.findValue(element));
                        element.value = pop;
                        total += pop;
                        if (pop >= 0) {
                            this.minCountyValue = Math.min(pop, this.minCountyValue);
                            this.maxCountyValue = Math.max(pop, this.maxCountyValue);
                        }
                    }.bind(this)
                );
            } catch (e) {
                console.log(e);
            }
        } else {
            Object.keys(this.counties).forEach(
                function(key) {
                    var value = 0;
                    if (this.getCounty(key).years[this.currYear] === undefined) {
                        value = -1;
                    } else {
                        value = parseFloat(this.findValue(this.getCounty(key)));
                    }
                    this.getCounty(key).value = value;
                    total += value;
                    if (value >= 0) {
                        this.minCountyValue = Math.min(value, this.minCountyValue);
                        this.maxCountyValue = Math.max(value, this.maxCountyValue);
                    }
                }.bind(this)
            );
        }

        if (filter.shouldFindPercentage) {
            this.maxCountyValue = 0;
            this.minCountyValue = 100;
            Object.keys(this.counties).forEach(
                function(key) {
                    this.getCounty(key).value /=
                        this.getCounty(key).years[this.currYear].statisticsTable.total_pop / 100;
                    if (this.getCounty(key).value >= 0) {
                        this.minCountyValue = Math.min(
                            this.getCounty(key).value,
                            this.minCountyValue
                        );
                        this.maxCountyValue = Math.max(
                            this.getCounty(key).value,
                            this.maxCountyValue
                        );
                    }
                }.bind(this)
            );
        }
    };

    this.findValue = function(obj) {
        if (
            obj === undefined ||
            obj.years === undefined ||
            obj.years[this.currYear] === undefined ||
            obj.years[this.currYear].statisticsTable === undefined
        ) {
            return -1;
        }
        var table = obj.years[this.currYear].statisticsTable;
        keys = filter.statName.split(".");

        var notFoundFlag = false;
        keys.forEach(
            function(element) {
                if (notFoundFlag) {
                    return;
                }
                table = table[element];
                if (table === undefined) {
                    notFoundFlag = true;
                }
            }.bind(this)
        );

        if (notFoundFlag) {
            return -1;
        }

        return table;
    };
}

new MapController().init();
