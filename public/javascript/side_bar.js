// Called whenever jquery is ready
$(function() {
    var $side_bar_cont = $(".side-bar-cont");
    var $filter_cont = $(".filter-cont");
    var $time_cont = $(".time-cont");
    var $side_bar = $side_bar_cont.children(".side-bar");
    $side_bar.shown = true;
    var $close_button = $("#close-button");
    var $svg = $('svg')

    $close_button.on("click", function(event) {
        if ($side_bar.shown) {
            hide_side_bar();
        } else {
            expand_side_bar();
        }
    });

    var hide_side_bar = function() {
        var pos = $side_bar.width() - $close_button.outerWidth(true);
        $side_bar_cont.css("left", -pos + "px");
        $side_bar.css("overflow", "hidden");
        $close_button.html(' <i class="fas fa-angle-double-right"></i>');
        $svg.css('left', '0')
        $filter_cont.css('left', '0')
        $time_cont.css('left', '0')
        $side_bar.shown = false;
    }

    var expand_side_bar = function() {
        $side_bar_cont.css("left", 0 + "px");
        $side_bar.css("overflow", "auto");
        $close_button.html(' <i class="fas fa-angle-double-left"></i>');
        $svg.css('left', '10vw')
        $filter_cont.css('left', '10vw')
        $filter_cont.css('overflow', 'hidden')
        $time_cont.css('left', '10vw')
        $time_cont.css('overflow', 'hidden')
        $side_bar.shown = true;
    }
});

var sortDesc = "fa-angle-up";
var sortAsc = "fa-angle-down";
var sortNeither = "fa-angle-down";

var side_bar = (function() {
    var $side_bar_table = $("#side-bar-table");
    var $side_bar_title = $("#side-bar-title");
    var $side_bar_tbody = $("#side-bar-tbody");

    var $side_area_header = $("#area-header");
    $side_area_header.sortIcon = $side_area_header.children(".fas");
    $side_area_header.sortIcon.addClass(sortDesc);

    var $side_stat_header = $("#stat-header");
    $side_stat_header.sortIcon = $side_stat_header.children(".fas");
    $side_stat_header.sortIcon.addClass(sortAsc);
    $side_stat_header.sortIcon.addClass("text-muted");

    $side_area_header.sorted = 1;
    $side_stat_header.sorted = 0;

    var rows = [];

    var update_side_bar = function(title, data, showPercentage, shouldntChangeFilter) {
        console.log("Updating the side bar!");
        console.log("Title:" + title);
        console.log(data);
        $side_bar_title.html(title);
        $side_bar_tbody.html("");
        rows = [];

        if (!shouldntChangeFilter) {
            $side_area_header.sortIcon.addClass(sortDesc);
            $side_area_header.sortIcon.removeClass(sortAsc);
            $side_area_header.sortIcon.removeClass("text-muted");

            $side_stat_header.sortIcon.addClass(sortAsc);
            $side_stat_header.sortIcon.removeClass(sortDesc);
            $side_stat_header.sortIcon.addClass("text-muted");

            $side_area_header.sorted = 1;
            $side_stat_header.sorted = 0;
        }

        if (mapVisualization.getCurrentlyZoomedInStateId() !== null) {
        } else {
        }

        for (var i = 0; i < data.length; i++) {
            var element = data[i];
            rows.push({
                areaName: element.name,
                value: element.value,
                html:
                    '<tr scope="row"><td>' +
                    element.name +
                    "</td><td>" +
                    (showPercentage
                        ? element.value.toFixed(4) + "%"
                        : formatter.addCommas(element.value)) +
                    "</td></tr>"
            });
        }
        if (shouldntChangeFilter) {
            sortItems();
        }
        sideBarFromRows();
    };

    $side_stat_header.on("click", function(event) {
        $side_stat_header.sortIcon.removeClass("text-muted");
        if ($side_stat_header.sorted === 1) {
            $side_stat_header.sorted = -1;
            $side_stat_header.sortIcon.removeClass(sortDesc);
            $side_stat_header.sortIcon.addClass(sortAsc);
        } else {
            $side_stat_header.sorted = 1;
            $side_stat_header.sortIcon.removeClass(sortAsc);
            $side_stat_header.sortIcon.addClass(sortDesc);
        }

        $side_area_header.sortIcon.removeClass(sortDesc);
        $side_area_header.sortIcon.addClass(sortAsc);
        $side_area_header.sortIcon.addClass("text-muted");
        $side_area_header.sorted = 0;

        sortItems();
        sideBarFromRows();
    });

    $side_area_header.on("click", function(event) {
        $side_area_header.sortIcon.removeClass("text-muted");
        if ($side_area_header.sorted === 1) {
            $side_area_header.sorted = -1;
            $side_area_header.sortIcon.removeClass(sortDesc);
            $side_area_header.sortIcon.addClass(sortAsc);
        } else {
            $side_area_header.sorted = 1;
            $side_area_header.sortIcon.removeClass(sortAsc);
            $side_area_header.sortIcon.addClass(sortDesc);
        }

        $side_stat_header.sortIcon.removeClass(sortDesc);
        $side_stat_header.sortIcon.addClass(sortAsc);
        $side_stat_header.sortIcon.addClass("text-muted");
        $side_stat_header.sorted = 0;

        sortItems();
        sideBarFromRows();
    });

    var sideBarFromRows = function() {
        var tableHtml = "";

        rows.forEach(function(element) {
            tableHtml += element.html;
        });

        $side_bar_tbody.html(tableHtml);
    };

    var sortItems = function() {
        console.log($side_area_header.sorted);
        if ($side_stat_header.sorted !== 0) {
            rows.sort(function(a, b) {
                return $side_stat_header.sorted * (b.value - a.value);
            });
        } else {
            rows.sort(function(a, b) {
                return $side_area_header.sorted * a.areaName.localeCompare(b.areaName);
            });
        }
    };

    return {
        update_side_bar
    };
})();
