/**
 * {options} object 伸缩的配置参数
 *         {direction} string 伸缩的方向
 *         {interval} string 伸缩在指定的时间完成
 *         {child_lenth} number 当前有多少个元素需要伸缩
 *         {child_tag_name} string 指定的伸缩元素的元素名
 *         {child_two_tag_name} string 指定的伸缩元素的子元素的元素名
 *         {child_tag_event} string 触发伸缩的事件名
 * 
 * **/
$.fn.slideBar = function(options){
  var _this = $(this);
  var _defaults = {
        "direction":"bottom",
        "interval":400,
        "child_length":_this.children().length,
        "child_tag_name":"div",
        "child_two_tag_name":"p",
        "child_tag_event":"click"
  }
  var _currentDefaults = $.extend({},_defaults,options),
   _direction = _currentDefaults["direction"] === "bottom" ? "slideDown" : "slideUp",
   _only_direction = _direction === "slideDown" ? "slideUp" : "slideDown",
   _current_ele =  _this.children(_currentDefaults["child_tag_name"].split(0)).children(_currentDefaults["child_tag_name"].split(1));
_current_ele.each(function(){
    $(this).on(_currentDefaults["child_tag_event"],function(){
           var _child_two_name = $(this).siblings(_currentDefaults["child_two_tag_name"]);
           var _child_two_siblings_name = $(this).parent().siblings().children(_currentDefaults["child_two_tag_name"]);
           if($(this).attr("class").indexOf("a_updates") >= 0){$(this).find("span").find("i").addClass("updates_span_slide")}
           $(this).find("span").addClass("changeBlue");
           $(this).parent().siblings().find("span").removeClass("changeBlue").parent().find("span").find("i").removeClass("updates_span_slide");
           _child_two_name[_direction](_currentDefaults["interval"]);
           _child_two_siblings_name[_only_direction](_currentDefaults["interval"]);  
               
    })   
   
   
 });
 return function(fn){
      fn.call(_current_ele);
 }
  
  
}


