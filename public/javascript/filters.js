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

$(function() {
    $dropDown1 = getDropDown("#drop1");
    $dropDown2 = getDropDown("#drop2");
    $dropDown3 = getDropDown("#drop3");
    $run = $("#run-button");
    $clear = $("#clear-button");

    $clear.on("click", clear);
    $run.on("click", run);

    hideStuff();

    Object.keys(filters).forEach(function(key) {
        if (key.includes("divider")) {
            $dropDown1.menu.append('<div class="dropdown-divider"></div>');
            return;
        }
        var $option = $('<div class="dropdown-item">' + key + "</div>");
        $option.obj = filters[key];

        // Handle menu1 clicks
        $option.on("click", function(event) {
            $dropDown1.button.text(key);
            $dropDown2.menu.empty();
            $dropDown2.button.text("Filter");
            $dropDown3.css("visibility", "hidden");

            $run.addClass("disabled");

            if ($option.obj.categories !== undefined) {
                Object.keys($option.obj.categories).forEach(function(key) {
                    var $subOption = $('<div class="dropdown-item">' + key + "</div>");
                    $subOption.obj = $option.obj.categories[key];

                    //Handle menu2 clicks
                    $subOption.on("click", function(event) {
                        $dropDown2.button.text(key);
                        $dropDown3.css("visibility", "hidden");

                        finalCategory();
                    });

                    // Append menu 2
                    $dropDown2.menu.append($subOption);
                });

                $dropDown2.css("visibility", "visible");
            } else if ($option.obj.contains !== undefined) {
                $option.obj.contains.forEach(function(key) {
                    var $subOption = $('<div class="dropdown-item">' + key + "</div>");
                    $subOption.obj = filters["total_" + key];

                    //Handle menu2 clicks
                    $subOption.on("click", function(event) {
                        $dropDown2.button.text(key);
                        $dropDown3.menu.empty();
                        $dropDown3.button.text("Filter");
                        $run.addClass("disabled");

                        Object.keys($subOption.obj.categories).forEach(function(key) {
                            console.log("3rd added");
                            var $finalOption = $('<div class="dropdown-item">' + key + "</div>");
                            $finalOption.obj = $subOption.obj.categories[key];

                            //Handle menu3 clicks
                            $finalOption.on("click", function(event) {
                                $dropDown3.button.text(key);
                                finalCategory();
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
                finalCategory();
            }
        });

        // Append menu 1
        $dropDown1.menu.append($option);
    });
});

function finalCategory() {
    $run.removeClass("disabled");
}

function clear() {
    hideStuff();
    $dropDown1.button.text("Filter");
}

function run() {
    var statSelected = $dropDown1.button.text();
    filter.shouldShowPercentage = false;
    filter.shouldFindPercentage = false;

    if ($dropDown2.css("visibility") === "visible") {
        statSelected += "." + $dropDown2.button.text();
        filter.shouldFindPercentage = true;

        if ($dropDown3.css("visibility") === "visible") {
            statSelected += "." + $dropDown3.button.text();
            filter.shouldShowPercentage = true;
            filter.shouldFindPercentage = false;
        }
    }

    console.log(statSelected);
    filter.statName = statSelected;

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
        showPercentage: false
    },
    median_age: {
        showPercentage: false
    },
    divider1: {},
    total_age: {
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
        },
        showPercentage: false
    },
    total_gender: {
        categories: {
            Male: {},
            Female: {}
        },
        showPercentage: false
    },
    total_race: {
        categories: {
            White: {},
            "Black or African American": {},
            "American Indian and Alaska Native": {},
            Asian: {},
            "Native Hawaiian and Other Pacific Islander": {},
            "Some other race": {},
            "Two or more races": {}
        },
        showPercentage: false
    },
    // total_nativity: {
    //     categories: {
    //         Native: {},
    //         "Naturalized U.S. citizen": {},
    //         "Not a U.S. citizen": {}
    //     },
    //     showPercentage: false
    // },
    total_marital_status: {
        categories: {
            "Never married": {},
            "Now married, except separated": {},
            "Divorced or separated": {},
            Widowed: {}
        },
        showPercentage: false
    },
    total_education: {
        categories: {
            "Less than high school graduate": {},
            "High school graduate (includes equivalency)": {},
            "Some college or associate's degree": {},
            "Bachelor's degree": {},
            "Graduate or professional degree": {}
        },
        showPercentage: false
    },
    divider2: {},
    same_county: {
        contains: ["age", "gender", "race", /*"nativity",*/ "marital_status", "education"]
    },
    moved_county: {
        contains: ["age", "gender", "race", /*"nativity",*/ "marital_status", "education"]
    },
    moved_state: {
        contains: ["age", "gender", "race", /*"nativity",*/ "marital_status", "education"]
    },
    abroad: {
        contains: ["age", "gender", "race", /*"nativity",*/ "marital_status", "education"]
    }
};
