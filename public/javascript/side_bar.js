// Called whenever jquery is ready
$(function() {
    var $side_bar_cont = $(".side-bar-cont");
    var $side_bar = $side_bar_cont.children(".side-bar");
    $side_bar.shown = true;
    var $close_button = $("#close-button");

    $close_button.on("click", function(event) {
        if ($side_bar.shown) {
            var pos = $side_bar.width() - $close_button.outerWidth();
            $side_bar_cont.css("left", -pos + "px");
            $close_button.html(' <i class="fas fa-angle-double-right"></i>');
        } else {
            $side_bar_cont.css("left", 0 + "px");
            $close_button.html(' <i class="fas fa-angle-double-left"></i>');
        }
        $side_bar.shown = !$side_bar.shown;
    });
});
