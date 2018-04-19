var maxYear = 2016;
var minYear = 2009;

$(function() {
    var playButton = $(".play-button");
    var slider = $("#slider");
    var yearLabel = $(".year-label");
    var playing = false;
    var interval = {};

    window.addEventListener("YearChanged", function(event) {
        yearLabel.text(event.detail);
        slider.val(event.detail);
    });

    slider.on("input", function(event) {
        yearChanged(slider.val());
    });

    playButton.on("click", function(event) {
        if (playing) {
            playButton.text("Stop");
            moveTick(slider);
            interval = setInterval(moveTick, 1000, slider);
        } else {
            playButton.text("Play");
            clearInterval(interval);
        }

        playing = !playing;
    });
});

function moveTick(slider) {
    var val = slider.val();
    val++;
    if (val > maxYear) {
        val = minYear;
    }
    yearChanged(val);
}

function yearChanged(year) {
    window.dispatchEvent(new CustomEvent("YearChanged", { detail: year }));
}
