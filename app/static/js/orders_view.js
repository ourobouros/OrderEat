$(function() {
    $('.delete-entry').on('click', function(event) {
        var id = event.target.id;
        var data = {'id' : id};
        $.getJSON($SCRIPT_ROOT + '/del_orderItem', data);
    });
});

$(function() {
    $('.update-entry').on('click', function(event) {
        window.history.back();
    });
});