/*
 * Jquery Droplist插件 更新于2013.4.20 新增回掉
 * 感谢葛子徐的技术支持
 * 使用例子:
 * $('.btn').droplist(); 默认列表跟随在按钮后面
 * $('.btn').droplist('.list');  查找指定列表
 * $('.btn').droplist([0,0,0,0]);  显示列表的四位偏差 上左高宽
 * $('.btn').droplist('.list',[0,0,0,0]);
 * $('.btn').droplist('.list',{
 *  position:[-2,0,0,0]
 * });
 * 
 * $.droplist_ext.setting = { 可全局设置
 *         position: [-2,0,0,0],
 *         isOnly: false
 *      };
 */

(function($) {
    $.droplist_ext = {
        // 全局默认设置
        setting: {
            prefix: 'dropdown__',
            position: [0, 0, 0, 0], //偏差设置
            isOnly: false, //是否多个列表显示
            autoHide: 300, //移开自动隐藏
            onOpen: function(){
            }, //打开回调
            onClose: function() {
            } //关闭回掉
        },
        // 初始化
        init: function(btn, list, options) {
            this.options = $.extend({}, this.setting, options);

            this.position = this.options.position;
            this.style = {};

            this.btn = btn;
            this.list = this.get_list(list);

            this.check_position();
            this.check_list();

            this.bind_event();
            this.for_ie6();
        },
        // 设置列表位置
        set_position: function() {
            var style = {
                left: this.btn.offset().left,
                top: this.btn.offset().top,
                height: this.btn.outerHeight(),
                width: this.btn.outerWidth()
            };

            if (this.isPosition) {
                style.top = this.btn.position().top;
                style.left = this.btn.position().left;
            }

            if (style.left != this.style.left || style.top != this.style.top || style.height != this.style.height) {
                var forIE = 0;
                if ($.browser.msie && $.browser.version < 8) {
                    forIE = 5;
                }
                this.list.css({
                    left: style.left + this.position[1] + forIE,
                    top: style.top + style.height + this.position[0]
                });
                this.style.top =  style.top;
                this.style.left = style.left;
                this.style.height = style.height;
            }

            if (this.position[2] && style.height > 0 && (style.height != this.style.height)) {
                this.list.css('height', this.list.outerHeight() + this.position[2]);
                this.style.height = style.height;
            }

            if (this.position[3] && style.width > 0 && (style.width != this.style.width)) {
                this.list.css({
                    'width': this.list.outerWidth() + this.position[3],
                    'min-width': 0
                });
                this.style.width = style.width;
            }
        },
        // 位置容错处理
        check_position: function() {
            var pos = this.position;
            for (var i = 0; i < 4; i++) {
                if (pos[i] === undefined) {
                    pos[i] = 0;
                }
            }
            this.position = pos;
        },
        // 绑定点击事件
        bind_event: function() {
            var ths = this,
                    btnClass = ths.setting.prefix + (ths.setting.isOnly ? $('[class*=' + ths.setting.prefix + ']').size() : 'together');
            this.btn.bind('click', function(e) {
                var btn = $(this);
                if (ths.list.is(':hidden')) {
                    $('.' + ths.setting.prefix + 'together').each(function() {
                        if ($(this).next('ul').is(':visible')) {
                            $(this).trigger('click');
                        }
                    });
                    ths.list.show(1,function(){
                        ths.set_position();
                        ths.options.onOpen(btn, $(this));
                    });
                    $(this).addClass('active');
                } else {
                    ths.close();
                }
                e.stopPropagation();
            }).addClass(btnClass);

            $('body').bind('click', function(e) {
                if ($(e.target).hasClass(btnClass) || $(e.target).parents('.' + btnClass).size()) {
                    e.stopPropagation();
                    return;
                }
                ths.close();
            });

            $(window).scroll(function() {
                ths.set_position();
            });

            if (ths.options.autoHide) {
                ths.list.on('mouseleave', function() {
                    ths.timer = setTimeout(function() {
                        ths.close();
                    }, ths.options.autoHide);
                });
                ths.btn.on('mouseleave', function() {
                    if ($(this).hasClass('active')) {
                        ths.timer = setTimeout(function() {
                            ths.close();
                        }, ths.options.autoHide);
                    }
                });
                ths.list.add(ths.btn).on('mouseenter', function() {
                    ths.timer && clearTimeout(ths.timer);
                });
            }
        },
        // 查找下拉列表
        get_list: function(list) {
            if (list === undefined) {
                return this.btn.next();
            } else {
                var listObj = list;
                if ($.type(list) === 'string') {
                    listObj = $(list).eq(0);
                }
                if (!listObj.prev('[class*=' + this.setting.prefix + ']').size()) {
                    listObj = listObj.clone(true);
                }
                this.btn.after(listObj);
                return listObj;
            }
        },
        // 检测按钮位置
        check_list: function() {
            var parent = this.btn.parent(),
                    flag = true;
            while (flag) {
                if (parent.is('body')) {
                    break;
                }
                if (parent.css('position') != 'static') {
                    flag = false;
                } else {
                    parent = parent.parent();
                }
            }
            if (!flag) {
                this.isPosition = true;
            }
        },
        // IE6的子栏目
        for_ie6: function() {
            if ($.browser.msie && $.browser.version == '6.0') {
                this.list.find('ul').parents('li').hover(function() {
                    $(this).children('a:first').addClass('active');
                    $(this).find('ul').css({
                        left: $(this).outerWidth(),
                        top: $(this).position().top,
                        width: $(this).outerWidth()
                    }).show();
                }, function() {
                    $(this).children('a:first').removeClass('active');
                    $(this).find('ul').hide();
                });
            }
        },
        close: function() {
            var ths = this;
            if (ths.list.is(':visible')) {
                ths.list.hide(0, function() {
                    ths.options.onClose(ths.btn, ths.list);
                });
                ths.btn.removeClass('active');
            }
        }
    };

    $.fn.droplist = function(arg1, arg2) {
        if (!$(this).size()) {
            return;
        }
        var list, options = {};
        switch ($.type(arg2)) {
            case 'array' :
                options.position = arg2;
                break;
            case 'object' :
                options = arg2;
        }
        switch ($.type(arg1)) {
            case 'string' :
                list = arg1;
                break;
            case 'array' :
                options.position = arg1;
                break;
            case 'object' :
                {
                    if (arg1.length) {
                        list = arg1;
                    } else {
                        options = arg1;
                    }
                }

        }
        $(this).each(function() {
            $.extend({}, $.droplist_ext).init($(this), list, options);
        });
    };

    $.droplist = {
        close: function() {
            $('[class*=' + $.droplist_ext.setting.prefix + ']').each(function() {
                if ($(this).hasClass('active')) {
                    $(this).trigger('click');
                }
            });
        }
    };
})(jQuery);