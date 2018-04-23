var $dropDown1;
var $dropDown2;
var $dropDown3;
var $run;
var $clear;
var filter = {
    shouldFindPercentage: false,
    statName: "total_pop",
    shouldShowPercentage: false
};
var nextFilter = {
    shouldFindPercentage: false,
    shouldShowPercentage: false
};

$(function() {
    $dropDown1 = getDropDown("#drop1");
    $dropDown2 = getDropDown("#drop2");
    $dropDown3 = getDropDown("#drop3");
    $run = $("#run-button");
    $clear = $("#clear-button");

    $clear.on("click", clear);
    $run.on("click", run);

    hideStuff();
    $run.removeClass("disabled");

    Object.keys(filters).forEach(function(key) {
        if (key.includes("divider")) {
            $dropDown1.menu.append('<div class="dropdown-divider"></div>');
            return;
        }
        var name = filters[key].name || key;
        var $option = $('<div class="dropdown-item">' + name + "</div>");
        $option.obj = filters[key];

        // Handle menu1 clicks
        $option.on("click", function(event) {
            $dropDown1.button.html(name);
            $dropDown1.selectedStat = key;
            $dropDown2.menu.empty();
            $dropDown2.button.text("Filter");
            $dropDown3.css("visibility", "hidden");

            $run.addClass("disabled");

            if ($option.obj.categories !== undefined) {
                Object.keys($option.obj.categories).forEach(function(key) {
                    var name = $option.obj.categories[key].name || key;
                    var $subOption = $('<div class="dropdown-item">' + name + "</div>");
                    $subOption.obj = $option.obj.categories[key];

                    //Handle menu2 clicks
                    $subOption.on("click", function(event) {
                        $dropDown2.button.html(name);
                        $dropDown2.selectedStat = key;
                        $dropDown3.css("visibility", "hidden");

                        finalCategory($subOption.obj, $option.obj);
                    });

                    // Append menu 2
                    $dropDown2.menu.append($subOption);
                });

                $dropDown2.css("visibility", "visible");
            } else if ($option.obj.contains !== undefined) {
                $option.obj.contains.forEach(function(key) {
                    var name = filters["total_" + key].name || key;
                    var $subOption = $('<div class="dropdown-item">' + name + "</div>");
                    $subOption.obj = filters["total_" + key];

                    //Handle menu2 clicks
                    $subOption.on("click", function(event) {
                        $dropDown2.button.html(name);
                        $dropDown2.selectedStat = key;
                        $dropDown3.menu.empty();
                        $dropDown3.button.text("Filter");
                        $run.addClass("disabled");

                        Object.keys($subOption.obj.categories).forEach(function(key) {
                            var name = $subOption.obj.categories[key].name || key;
                            var $finalOption = $('<div class="dropdown-item">' + name + "</div>");
                            $finalOption.obj = $subOption.obj.categories[key];

                            //Handle menu3 clicks
                            $finalOption.on("click", function(event) {
                                $dropDown3.button.html(name);
                                $dropDown3.selectedStat = key;
                                finalCategory($finalOption.obj, $subOption.obj, $option.obj);
                            });

                            // Append menu 3
                            $dropDown3.menu.append($finalOption);
                        });
                        $dropDown3.css("visibility", "visible");
                    });

                    // Append menu 2
                    $dropDown2.menu.append($subOption);
                });

                $dropDown2.css("visibility", "visible");
            } else {
                $dropDown2.css("visibility", "hidden");
                $dropDown3.css("visibility", "hidden");
                finalCategory($option.obj);
            }
        });

        // Append menu 1
        $dropDown1.menu.append($option);
    });
});

function finalCategory(primaryFilterObj, secondaryFilterObj = {}, thirdFilterObj = {}) {
    $run.removeClass("disabled");
    if (thirdFilterObj.shouldShowPercentage !== undefined) {
        nextFilter.shouldShowPercentage = thirdFilterObj.shouldShowPercentage;
    } else if (secondaryFilterObj.shouldShowPercentage !== undefined) {
        nextFilter.shouldShowPercentage = secondaryFilterObj.shouldShowPercentage;
    } else if (primaryFilterObj.shouldShowPercentage !== undefined) {
        nextFilter.shouldShowPercentage = primaryFilterObj.shouldShowPercentage;
    } else {
        nextFilter.shouldShowPercentage = false;
    }

    if (thirdFilterObj.shouldFindPercentage !== undefined) {
        nextFilter.shouldFindPercentage = thirdFilterObj.shouldFindPercentage;
    } else if (secondaryFilterObj.shouldFindPercentage !== undefined) {
        nextFilter.shouldFindPercentage = secondaryFilterObj.shouldFindPercentage;
    } else if (primaryFilterObj.shouldFindPercentage !== undefined) {
        nextFilter.shouldFindPercentage = primaryFilterObj.shouldFindPercentage;
    } else {
        nextFilter.shouldFindPercentage = false;
    }

    console.log(nextFilter);
}

function clear() {
    hideStuff();
    $dropDown1.button.text("Filter");
}

function run() {
    var statSelected = $dropDown1.selectedStat;
    filter.shouldShowPercentage = nextFilter.shouldShowPercentage;
    filter.shouldFindPercentage = nextFilter.shouldFindPercentage;

    if ($dropDown2.css("visibility") === "visible") {
        statSelected += "." + $dropDown2.selectedStat;

        if ($dropDown3.css("visibility") === "visible") {
            statSelected += "." + $dropDown3.selectedStat;
        }
    }

    filter.statName = statSelected.trim();
    console.log(filter);

    window.dispatchEvent(new CustomEvent("StatChanged", { detail: filter }));
}

function hideStuff() {
    $dropDown2.css("visibility", "hidden");
    $dropDown3.css("visibility", "hidden");
    $run.addClass("disabled");
}

function getDropDown(id) {
    var drop = $(id);
    drop.menu = $(drop.children(".dropdown-menu"));
    drop.button = $(drop.children(".btn"));
    return drop;
}

var filters = {
    total_pop: {
        name: "Total population",
        shouldShowPercentage: false
    },
    median_pop: {
        name: "Median age of residents",
        shouldShowPercentage: false
    },
    divider0: {},
    total_same_county: {
        name: "% population that moved<br>within the same county",
        shouldShowPercentage: true
    },
    total_moved_county: {
        name: "% population that moved counties",
        shouldShowPercentage: true
    },
    total_moved_state: {
        name: "% population that moved states",
        shouldShowPercentage: true
    },
    total_abroad: {
        name: "% population that moved from abroad",
        shouldShowPercentage: true
    },
    divider1: {},
    total_age: {
        name: "% population by age group",
        shouldFindPercentage: true,
        categories: {
            "1 to 4 years": {},
            "5 to 17 years": {},
            "18 to 24 years": {},
            "25 to 34 years": {},
            "35 to 44 years": {},
            "45 to 54 years": {},
            "55 to 64 years": {},
            "65 to 74 years": {},
            "75 years and over": {}
        }
    },
    total_gender: {
        name: "% population by gender group",
        shouldFindPercentage: true,
        categories: {
            Male: {},
            Female: {}
        }
    },
    total_race: {
        name: "% population by racial group",
        shouldFindPercentage: true,
        categories: {
            White: {},
            "Black or African American": {},
            "American Indian and Alaska Native": {},
            Asian: {},
            "Native Hawaiian and Other Pacific Islander": {},
            "Some other race": {},
            "Two or more races": {}
        }
    },
    total_nativity: {
        name: "% population by nativity group",
        shouldFindPercentage: true,
        categories: {
            Native: {},
            "Naturalized US citizen": {},
            "Not a US citizen": {}
        }
    },
    total_marital_status: {
        name: "% population by marital group",
        shouldFindPercentage: true,
        categories: {
            "Never married": {},
            "Now married, except separated": {},
            "Divorced or separated": {},
            Widowed: {}
        }
    },
    total_education: {
        name: "% population by education group",
        shouldFindPercentage: true,
        categories: {
            "Less than high school graduate": {},
            "High school graduate (includes equivalency)": {},
            "Some college or associate's degree": {},
            "Bachelor's degree": {},
            "Graduate or professional degree": {}
        }
    },
    divider2: {},
    same_county: {
        name: "Moved inside county (further broken down)",
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"],
        shouldShowPercentage: true,
        shouldFindPercentage: false
    },
    moved_county: {
        name: "Moved counties (further broken down)",
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"],
        shouldShowPercentage: true,
        shouldFindPercentage: false
    },
    moved_state: {
        name: "Moved states (further broken down)",
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"],
        shouldShowPercentage: true,
        shouldFindPercentage: false
    },
    abroad: {
        name: "Moved into the US (further broken down)",
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"],
        shouldShowPercentage: true,
        shouldFindPercentage: false
    }
};
