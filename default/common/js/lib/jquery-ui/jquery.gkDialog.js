/**
 * User: George
 * Date: 13-6-23
 * Time: 下午2:47
 */
$.fn.gkDialog = function(arg) {
    if ($.type(arg) === 'string') {
        $(this).dialog(arg);
    } else {
        var defaults = {
            resizable: false,
            draggable: false,
            modal: false,
            closeText: '×',
            close: function() {
                $(this).remove();
            }
        };
        $(this).dialog($.extend(defaults, arg));
    }
};