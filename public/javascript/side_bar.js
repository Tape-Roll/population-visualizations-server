// Called whenever jquery is ready
$(function() {
    var $side_bar_cont = $(".side-bar-cont");
    var $side_bar = $side_bar_cont.children(".side-bar");
    $side_bar.shown = true;
    var $close_button = $("#close-button");

    $close_button.on("click", function(event) {
        if ($side_bar.shown) {
            var pos = $side_bar.width() - $close_button.outerWidth(true);
            $side_bar_cont.css("left", -pos + "px");
            $close_button.html(' <i class="fas fa-angle-double-right"></i>');
        } else {
            $side_bar_cont.css("left", 0 + "px");
            $close_button.html(' <i class="fas fa-angle-double-left"></i>');
        }
        $side_bar.shown = !$side_bar.shown;
    });
});

var side_bar = (function() {
    var update_side_bar = function(title, data, showPercentage) {
        console.log("Updating the side bar!");
        console.log('Title:' + title);
        console.log(data);
        var $side_bar_title = $('#side-bar-title');
        var $side_bar_table = $('#side-bar-table');
        $side_bar_title.html(title);
        $side_bar_table.html('');
        var tableHtml = '';
        for (var i = 0; i < data.length; i++) {
            var element = data[i];
            tableHtml += '<tr><td>' + element.name + '</td><td>'
                         + (showPercentage ? element.value + '%' : formatter.addCommas(element.value))
                         + '</td></tr>'
        }
        $side_bar_table.html(tableHtml);
    }
    return  {
        update_side_bar
    }
}())
