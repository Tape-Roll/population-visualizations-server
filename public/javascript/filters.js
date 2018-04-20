$(function() {
    var $dropDown1 = getDropDown("#drop1");
    Object.keys(filters).forEach(function(key) {
        $dropDown1.menu.prepend('<div class="dropdown-item">' + key + "</div>");
    });
});

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
    total_nativity: {
        categories: {
            Native: {},
            "Naturalized U.S. citizen": {},
            "Not a U.S. citizen": {}
        },
        showPercentage: false
    },
    total_marital_status: {
        categories: {
            "Never married": {},
            "Now married, except separated": {},
            "Divorced or separated": {},
            Widowed: {}
        },
        showPercentage: false
    },
    total_marital_status: {
        categories: {
            "Less than high school graduate": {},
            "High school graduate (includes equivalency)": {},
            "Some college or associate's degree": {},
            "Bachelor's degree": {},
            "Graduate or professional degree": {}
        },
        showPercentage: false
    },
    same_county: {
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"]
    },
    moved_county: {
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"]
    },
    moved_state: {
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"]
    },
    abroad: {
        contains: ["age", "gender", "race", "nativity", "marital_status", "education"]
    }
};
