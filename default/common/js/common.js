/*
 *语言函数
 *
 **/
function L(name) {
    var args = Array.prototype.slice.call(arguments), val = '';
    val = LANG[name.toLowerCase()] ||  LANG[name.toUpperCase()] || String(name);
    if (args.length == 1) {
        return val;
    }
    for (var i = 1; i < args.length; i++) {
        val = val.replace('$' + i, args[i]);
    }
    return val;
}

/*URL,HASH管理*/
var gkLocation = {
    FILES: 'files',
    FAVORITES: 'favorites',
    SHARES: 'shares',
    RECYCLEBIN: 'recyclebin',
    UPDATES: 'updates',
    LINKS: 'links',
    CONTACTS: 'contacts',
    MY_CONTACTS: "my_contacts",
    ORG_MEMBERS: 'org_members',
    ORG_CONTACTS: 'org_contacts',
    GROUPS: "groups",
    MEMBERS: "members",
    TEAM_CONTACTS: "team_contacts",
    TEAM_GROUPS: "team_groups",
    APPS: "apps",
    SOFTWARE: "software",
    PLUGIN: "plugin",
    LIBRARY: "library",
    TEAM_LIBRARY: 'team_library',
    TEAM_NEWS: 'team_news',
    LINK_FILES: 'v',
    TEAM_FILES:'team_files',
    ROOT:'root',
    NOTICES: 'notices',
    HASH_FORMAT: {
        'files': ['showDel', 'fullpath', 'file', 'tab'], //'#!files[showDel]:[fullpath]:[file]:[tab],
        'team_files': ['showDel', 'fullpath', 'file', 'tab'], //'#!team_files[showDel]:[fullpath]:[file]:[tab]
        'favorites': [],
        'shares': ['showType', 'isDir', 'mid'],
        'recyclebin': [],
        'org_members': ['group_id'],
        'updates': ['keyword'],
        'links': [],
        'v': ['relfullpath', 'act'],
        'root': []
    },
    init: function() {
        $(window).on('hashchange', function() {
            gkLocation.fetchURL();
            //去除弹出层
            gkUI.closePopDetail('.contact_detail');
        });
    },
    hashDecode: function(hash) {
        var params = {
            ac: ''
        };
        if (hash.indexOf('#!') != 0) {
            return params;
        }
        var arr = hash.split(':');
        params.ac = arr[0].substr(2);
        var format = gkLocation.HASH_FORMAT[params.ac];
        if (!format || !format.length) {
            return params;
        }
        for (var i = 0; i < format.length; i++) {
            params[format[i]] = arr[i + 1] === undefined ? undefined : decodeURIComponent(arr[i + 1]);
        }
        return params;
    },
    setHash: function(ac, params) {
        
    	params = arguments[1] === undefined ? null : arguments[1];
        var location_hash = '#!' + ac;
        if (params) {
            var format = gkLocation.HASH_FORMAT[ac];
            if (format && format.length) {
                for (var i = 0; i < format.length; i++) {
                    location_hash += (params[format[i]] === undefined ? '' : ':' + encodeURIComponent(params[format[i]]));
                }
            }
        }
        //hash相同不会触发hashchange事件，手动刷新
        if (location.hash === location_hash) {
            gkLocation.fetchURL(true);
        } else {
            location.hash = location_hash;
        }
    },
    setCurrentAc: function(ac) {
        $('#left_sidebar .vertical_nav_list > li').removeClass('active');
        $('#left_sidebar .vertical_nav_list > li.ac_' + ac).addClass('active');
        // 左侧菜单变成更多
        gkUI.moreVerticalMenu();
    },
    //force 是否强制刷新
    fetchURL: function(force) {
        force = arguments[0] === undefined ? false : true;
        var params = gkLocation.hashDecode(location.hash);
        var ac = params.ac;
        if(params.ac == gkLocation.FILES || params.ac == gkLocation.TEAM_FILES || params.ac == gkLocation.RECYCLEBIN){
            ac = gkLocation.ROOT;
        }

        this.setCurrentAc(ac);
        switch (params.ac) {
            case this.ROOT:
                gkStorage.root();
               break;
            case this.FILES:
                var fullpath = params.fullpath || '';
                var params = {
                    showDel: params.showDel,
                    file: params.file,
                    tab: params.tab,
                    force: force,
                    ac:params.ac
                };
                gkStorage.files(fullpath, params);
                break;
            case this.UPDATES:
            	gkUpdates.init();
                break;
            case this.NOTICES:
                gkStorage.notices();
                break;
            case this.FAVORITES:
                gkStorage.favorites();
                break;
            case this.RECYCLEBIN:
                gkStorage.recyclebin();
                break;
            case this.CONTACTS:
                gkContact.getContactMain();
                break;
            case this.MEMBERS:
                gkTeam.getMemberPage();
                break;
            case this.TEAM_GROUPS:
                gkContact.getGroupPage();
                break;
            case this.LINK_FILES:
            	gkLink.getFiles({
                    relfullpath: params.relfullpath,
                    act: params.act,
                    force: force
                });
                break;
            case this.TEAM_FILES:
                gkStorage.files(params.fullpath || '', {
                    showDel: params.showDel || 0,
                    file: params.file,
                    tab: params.tab,
                    force: force,
                    ac:gkLocation.TEAM_FILES
                });
                break;
            default:
                break;
        }
    },
    getCurrentLocation: function() {
        return PAGE_CONFIG.ac || gkLocation.hashDecode(location.hash).ac;
    },
    isFiles: function() {
        return PAGE_CONFIG && (PAGE_CONFIG.ac === this.FILES || PAGE_CONFIG.ac === this.TEAM_FILES || gkLocation.hashDecode(location.hash).ac === this.FILES || gkLocation.hashDecode(location.hash).ac === this.TEAM_FILES);
    },
    isTeamFiles: function() {
        return PAGE_CONFIG && (PAGE_CONFIG.ac === this.TEAM_FILES || gkLocation.hashDecode(location.hash).ac === this.TEAM_FILES);
    },
    isUpdates: function() {
        return PAGE_CONFIG.ac === this.UPDATES || gkLocation.hashDecode(location.hash).ac === this.UPDATES;
    },
    isNotices: function() {
        return PAGE_CONFIG.ac === this.NOTICES || gkLocation.hashDecode(location.hash).ac === this.NOTICES;
    },
    isFavorites: function() {
        return PAGE_CONFIG.ac === this.FAVORITES || gkLocation.hashDecode(location.hash).ac === this.FAVORITES;
    },
    isShares: function() {
        return PAGE_CONFIG.ac === this.SHARES || gkLocation.hashDecode(location.hash).ac === this.SHARES;
    },
    isTeamShares: function() {
        return PAGE_CONFIG.ac === this.SHARES || gkLocation.hashDecode(location.hash).ac === this.SHARES;
    },
    isLinks: function() {
        return PAGE_CONFIG.ac === this.LINKS || gkLocation.hashDecode(location.hash).ac === this.LINKS;
    },
    isRecyclebin: function() {
        return PAGE_CONFIG.ac === this.RECYCLEBIN || gkLocation.hashDecode(location.hash).ac === this.RECYCLEBIN;
    },
    isContacts: function() {
        return PAGE_CONFIG.ac === this.CONTACTS || gkLocation.hashDecode(location.hash).ac === this.CONTACTS;
    },
    isMyContacts: function() {
        return PAGE_CONFIG.ac === this.MY_CONTACTS || gkLocation.hashDecode(location.hash).ac === this.MY_CONTACTS;
    },
    isTeamContacts: function() {
        return PAGE_CONFIG.ac === this.TEAM_CONTACTS || gkLocation.hashDecode(location.hash).ac === this.TEAM_CONTACTS;
    },
    isMembers: function() {
        return PAGE_CONFIG.ac === this.MEMBERS || gkLocation.hashDecode(location.hash).ac === this.MEMBERS;
    },
    isOrgMembers: function() {
        return PAGE_CONFIG.ac === this.ORG_MEMBERS || gkLocation.hashDecode(location.hash).ac === this.ORG_MEMBERS;
    },
    isGroups: function() {
        return PAGE_CONFIG.ac === this.GROUPS || gkLocation.hashDecode(location.hash).ac === this.GROUPS;
    },
    isTeamGroups: function() {
        return PAGE_CONFIG.ac === this.TEAM_GROUPS || gkLocation.hashDecode(location.hash).ac === this.TEAM_GROUPS;
    },
    isManagePage: function() {           //是否管理页
        return this.isMembers() || this.isTeamGroups() ||this.isTeamShares();
    },
    isSearch: function() {
        return !!PAGE_CONFIG.search;
    },
    isApps: function() {
        return PAGE_CONFIG.ac === this.APPS || gkLocation.hashDecode(location.hash).ac === this.APPS;
    },
    isSoftware: function() {
        return PAGE_CONFIG.ac === this.SOFTWARE || gkLocation.hashDecode(location.hash).ac === this.SOFTWARE;
    },
    isPlugin: function() {
        return PAGE_CONFIG.ac === this.PLUGIN || gkLocation.hashDecode(location.hash).ac === this.PLUGIN;
    },
    isLibrary: function() {
        return PAGE_CONFIG.ac === this.LIBRARY || gkLocation.hashDecode(location.hash).ac === this.LIBRARY;
    },
    isTeamNews: function() {
        return PAGE_CONFIG.ac === this.TEAM_NEWS || gkLocation.hashDecode(location.hash).ac === this.TEAM_NEWS;
    },
    isTeamLibrary: function() {
        return PAGE_CONFIG.ac === this.TEAM_LIBRARY || gkLocation.hashDecode(location.hash).ac === this.TEAM_LIBRARY;
    },
    getNavs: function(navs) {
        navs = !$.isArray(navs) || !navs.length ? [] : navs;
        if (!navs.length) {
            var activeNavItem = $('#left_sidebar .vertical_nav_list li.active:not(.ac_more) a');
            var nav = [];
            nav[0] = activeNavItem.size() ? activeNavItem.text() : '';
            nav[1] = '/storage#!' + PAGE_CONFIG.ac;
            navs.push(nav);
        }
        var fNavs = [];
        if (gkLocation.isFiles() || gkLocation.isTeamFiles()) {
            $.each(navs, function(i, n) {
                var ac =  gkLocation.FILES;
                if(!n[1] && gkLocation.isTeamFiles()){
                    ac = gkLocation.TEAM_FILES;
                }
                var href = gkStorage.getFileLocation(n[1], 1, PAGE_CONFIG.showDel,ac,1);
                var navItem = [n[0], href];
                fNavs.push(navItem);
            });
        } else {
            fNavs = navs;
        }
        if(gkLocation.isFiles() || gkLocation.isTeamFiles() || gkLocation.isRecyclebin()) {
            var lNav = [];
            lNav[0] = L('files');
            lNav[1] = '/storage#!' + gkLocation.ROOT;
            fNavs.unshift(lNav);
        }
        return fNavs;
    }
};

/*路径导航*/
var gkBread = {
    //@todo bread在文件名较长的情况下，BUG
    bread_timeout: null,
    breadlist_hover: false,
    current_bread: null,
    init: function(meta) {
        var horizonNav = $('.horizon_nav');
        if (!horizonNav.size()) {
            return;
        }
        $(document.body).unbind("click", this.hideShrinkBread).bind("click", this.hideShrinkBread);
        if (!$('#breadWrpTmpl').size()) {
            return;
        };
        var breadWrpTmpl = $('#breadWrpTmpl').tmpl(meta);
        horizonNav.find('.bread_wrp').remove();
        var FBBtns = horizonNav.find('.forward_backward_btns');
        if (FBBtns.size()) {
            FBBtns.after(breadWrpTmpl);
        } else {
            horizonNav.prepend(breadWrpTmpl);
        }
        gkBread.setBreadWrpWidth(breadWrpTmpl);
        //如果面包屑超长，隐藏最前面的路径
        //gkBread.shrink();
        $(window).on('resize', function() {
            gkBread.setBreadWrpWidth($('#wrapper_top .bread_wrp'));
        });

    },
    setBreadWrpWidth: function(breadWrpTmpl) {
        if (!breadWrpTmpl.size()) {
            return;
        }
        var breadWrpWidth = $('.horizon_nav').width() - 300, breadListWidth = breadWrpWidth;
        var breadIcon = breadWrpTmpl.find('.bread_icon');
        if (breadIcon.size()) {
            breadListWidth -= breadIcon.outerWidth();
        }
        var FBBtns = breadWrpTmpl.find('.forward_backward_btns');
        if (FBBtns.size()) {
            breadListWidth -= FBBtns.outerWidth();
        }
        breadWrpTmpl.css({
            width: breadWrpWidth
        });
        breadWrpTmpl.find('.browser_bread_list').css({
            width: breadListWidth
        });
    },
    shrink: function() {     //收缩
        var bread_list = $('.bread_wrp .browser_bread_list');
        var row_height = 41;
        if (bread_list.next('.hide_bread_wrapper').length) {
            return;
        }
        var bread_list_height = bread_list.height();
        var hide_bread_list = $('<div class="hide_bread_list"></div>');
        var hide_bread_wrapper = $('<div class="hide_bread_wrapper"><div class="arrow up_arrow"><span>◆</span><em>◆</em></div></div>');
        hide_bread_wrapper.append(hide_bread_list);
        bread_list.after(hide_bread_wrapper);
        while (bread_list_height > row_height) {
            var first_bread = bread_list.find('.bread_link:first');
            bread_list.find('.bread_link:first').remove();
            hide_bread_list.prepend(first_bread);
            bread_list.find('.bread_separate:first').remove();
            bread_list_height = bread_list.outerHeight();
        }
        if (hide_bread_list.find('.bread_link').size()) {
            $('.bread_wrp .bread_icon').addClass('has_bread_links');
        } else {
            $('.bread_wrp .bread_icon').removeClass('has_bread_links');
        }
        $('.bread_wrp .bread_icon').unbind('click').click(function(e) {
            if (hide_bread_list.find('.bread_link').size()) {
                hide_bread_wrapper.css({
                    left: $(this).position().left - 6 < 0 ? hide_bread_wrapper.css("left") + 4 : $(this).position().left - 6
                });
                hide_bread_wrapper.toggle();
                e.stopPropagation();
            }
        });
        bread_list.show();
        this.initBreadLink();
    },
    hideShrinkBread: function() {
        $(".bread_wrp .hide_bread_wrapper").hide();
    },
    extend: function() {//展开
        var hideBreadList = $(".bread_wrp .hide_bread_wrapper"), breadList = $('.bread_wrp .browser_bread_list');
        while (hideBreadList.find('.bread_link').length > 0) {
            var previousBread = hideBreadList.find('.bread_link:first');
            breadList.prepend('<span class="bread_separate">&gt;</span>');
            breadList.prepend(previousBread);
        }
        hideBreadList.remove();
        $(".bread_wrp .bread_icon").removeClass("has_bread_links").unbind('click');
        this.initBreadLink();
    }
};

var gkUI = {
    initSlideWrapper: function(slide_wrapper) {
        slide_wrapper.find('.slide_top').click(function() {
            var slideWrapper = $(this).parents('.slide_wrapper'),
                    slideContent = slideWrapper.find('.slide_content');
            if (slideContent.is(':visible')) {
                slideContent.slideUp(200, function() {
                    slideWrapper.removeClass('slide_wrapper_down slide_wrapper_up').addClass('slide_wrapper_up');
                });
            } else {
                slideContent.slideDown(200, function() {
                    slideWrapper.removeClass('slide_wrapper_down slide_wrapper_up').addClass('slide_wrapper_down');
                });
            }
        });
    },
    fitWidth: function() {
        return;
        gkUI.setFileListWidth();
        $(window).bind('resize', function() {
            gkUI.setFileListWidth();
        });
    },
    setFileListWidth: function() {
        var mainWrapper = $('#main');
        if ($(window).width() <= 1090) {
            mainWrapper.addClass('main_1024');
            $('#list_panel .list .file_item .file_detail').css({
                'width': '100px'
            });
        } else {
            mainWrapper.removeClass('main_1024');
            if ((gkLocation.isFiles() || gkLocation.isTeamFiles()) && gkUI.isExpandStyle()) {
                var width = $('#list_panel .list').width() - 16 - 410 - 23 - 52 - 30;
                if (width > 420) {
                    width = 420;
                }
                $('#list_panel .list .file_item .file_detail').css({
                    'width': width
                });
                $('#list_panel .list .file_item .file_detail .attrs').css({
                    'max-width': width - 100
                });
            }
        }
    },
    slideIn: function(wrapper, content, onShow) {
        var detailWidth = 300;
        wrapper.find('.slide_overlay').remove();
        var slideOverLay = $('<div class="ui-widget-overlay slide_overlay"></div>');
        wrapper.append(slideOverLay);
        slideOverLay.css({
            'width': wrapper.width() + 'px',
            'height': wrapper.height() + 'px'
        }).show();
        content.show().css({
            'width': wrapper.outerWidth() - detailWidth + 'px',
            'right': 'auto',
            'left': wrapper.outerWidth() + 5,
            'z-index': 999,
            'opacity': 0
        }).animate({
            'opacity': 1,
            'left': detailWidth + 'px'
        }, 200, function() {
            if (onShow && typeof onShow === 'function') {
                onShow();
            }
        });
    },
    slideOut: function(wrapper, content) {
        $.loader.close();
        content.animate({
            'left': wrapper.outerWidth() + 5,
            opacity: 0
        }, 200, function() {
            content.removeAttr('style').hide();
            wrapper.find(".slide_overlay").remove();
        });
    },
    /*
     *修复出现滚动条后列表头部偏移的问题
     **/
    fixListHeader: function(list_header, list, fix) {
        fix = fix || 32;
        if (list[0].scrollHeight > list[0].clientHeight) {
            list_header.css('padding-right', 32 + 'px');
        }
    },
    /*
     *检测是否是收缩模式
     **/
    isShrinkStyle: function() {
        return $('#list_panel').hasClass('sharink_style') || gkLocation.isTeamGroups() || gkLocation.isGroups();
    },
    /*
     *检测是否是扩展模式
     **/
    isExpandStyle: function() {
        return !$('#list_panel').hasClass('sharink_style');
    },
    /*
     *扩展
     **/
    expandListPanel: function(animate, callback) {
        var jqPanel = $('#list_panel').stop();
        var panel_width = document.documentElement.clientWidth - $('#left_sidebar').outerWidth() - $('#right_sidebar').outerWidth() - 18;
        $('#content').empty().hide();
        var setUI = function() {
            jqPanel.removeAttr('style');
            jqPanel.removeClass('sharink_style').addClass('extend_style').show();
            gkUI.setFileListWidth();
            if (callback && typeof (callback) === 'function') {
                callback();
            }

        };
        if (animate) {
            jqPanel.animate({
                width: panel_width
            }, 200, function() {
                setUI();
            });
        } else {
            jqPanel.css('width', panel_width);
            setUI();
        }
    },
    /*
     *收缩
     **/
    shrinkListPanel: function(animate, callback) {
        var jqPanel = $('#list_panel').stop();
        var panel_width = 299;
        $('#right_sidebar').hide();
        var set = function() {
            jqPanel.removeAttr('style');
            jqPanel.removeClass('extend_style').addClass('sharink_style').show();
            $('#content .detail_header_toolbar,#content .detail').remove();
            $('#content').fadeIn('fast');
            $('#list_panel .list .file_item .file_detail').removeAttr('style');
            $('#list_panel .list .file_item .file_detail .attrs').removeAttr('style');
            if (callback && typeof (callback) === 'function') {
                callback();
            }
        };
        if (animate) {
            jqPanel.animate({
                width: '299px'
            }, 200, function() {
                set();
            });
        } else {
            jqPanel.css('width', panel_width);
            set();
        }
        gkBread.shrink();
    },
    toggleListPanel: function(animate, callback) {
        var jqToggle = $('.toggle_style');
        if (jqToggle.hasClass('expand')) {
            gkUI.shrinkListPanel(animate, callback);
        } else {
            gkUI.expandListPanel(animate, callback);
        }
    },
    quitListFileItemEdit: function(wrapper) {
        wrapper = typeof arguments[0] === 'undefined' ? $('#list_panel .list') : wrapper;
        var display = PAGE_CONFIG.display || '';
        wrapper.find('.new_file_item').remove();
        var file_item_edit = wrapper.find('.file_item_edit');
        file_item_edit.find('.edit_filename_wrapper').remove();
        file_item_edit.removeClass('file_item_edit').find('input.input_filename,.edit_btns').remove();
        file_item_edit.find('.private_item_left').show();
        if(display && display==='thumb'){
            file_item_edit.find('.filename .name,.btn_wrp').show();
        }
    },
    /* 开关按钮事件 */
    toggleBtn: function(callback) {
        $('.toggle_btn').bind('click', function() {
            if ($(this).attr('disabled') === 'disabled') {
                return false;
            }

            if (!$(this).siblings('.toggle_btn').length) {
                $.alert($(this).attr('title'), {
                    type: 'error'
                });
                return false;
            }
            if (callback($(this), !$(this).hasClass('toggle_btn_open'))) {
                $(this).hide().siblings('.toggle_btn').show();
            }
        });
    },
    resizeUpdateUI: function() {
        var maxUpdaterListWrapperWidth = 476;
        var minUpdaterListWrapperWidth = 164;
        var updaterListWrapper = $('#list_panel .updater_list_wrapper');
        var updateList = $('#list_panel .list');
        var updaterListWrapperWidth = updaterListWrapper.width();
        if (updaterListWrapper.width() > maxUpdaterListWrapperWidth) {
            updaterListWrapperWidth = maxUpdaterListWrapperWidth;
        }
        if (updaterListWrapper.width() < minUpdaterListWrapperWidth) {
            updaterListWrapperWidth = minUpdaterListWrapperWidth;
        }
        var listWidth = $(window).width() - $('#left_sidebar').width() - updaterListWrapperWidth;
        $('#list_panel .list').css({
            'width': listWidth
        });
        updaterListWrapper.css({
            'left': listWidth + 'px'
        });

    },
    moreVerticalMenu: function() {
        // 左侧菜单锁定
        $('.vertical_nav,.jump_nav').off('click').on('click', 'a', function(e) {
            jumpNav.hide();
            if (PAGE_CONFIG.loading) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
        // 变换为更多
        var size = $('.vertical_nav_list > li').size();
        if (!size) {
            return;
        }
        var more = $('.vertical_nav_list > li:last'),
                jumpNav = $('.jump_nav');


        // 更多移上去的效果
        var timer;
        var showFunc = function(){
            var lineHeight = 52;
            var arrowTop = (lineHeight - $('.arrow', $(this)).height())/2;
            var height = $(this).height();
            $(this).css('top', more.offset().top + lineHeight - height);
            $('.arrow', $(this)).css('top', arrowTop - lineHeight + height);
            if((height - lineHeight) > 0){
                $(this).css('right', '8px')
                $('.jump_nav_list', $(this)).addClass('multi_lines');
            }else{
                $(this).css('right', 'auto');
                $('.jump_nav_list', $(this)).removeClass('multi_lines');
            }
        };
        $('a', more).add(jumpNav).off('mouseover').off('mouseleave').on('mouseover', function(e) {
            timer && clearTimeout(timer);
            jumpNav.is(':hidden') && jumpNav.show(1,showFunc);
        }).on('mouseleave', function(e) {
            timer = setTimeout(function(){
                jumpNav.hide();
            },300);
        });

        $(window).off('resize.leftMenu').on('resize.leftMenu', function() {
            var more = $('.vertical_nav_list > li:last'),
                lastTop = more.is(':hidden') ? ($(window).height() - more.outerHeight()) : more.offset().top,
                index = -1;
            $('.vertical_nav_list > li:lt(' + (size - 2 ) + ')').each(function(i) {
                var top = $(this).offset().top + $(this).height() + 26;
                if (top >= lastTop) {
                    index = i;
                    return false;
                }
            });
            if (index > -1) {
                more.show();
                var menu = $('.vertical_nav_list > li:gt(' + index + '):not(:last)');
                $('.jump_nav_list', jumpNav).empty().append(menu.clone().show());
                if (index == 0) {
                    var first = $('.vertical_nav_list > li:first');
                    if (first.offset().top + 20 >= lastTop) {
                        $('.jump_nav_list', jumpNav).prepend(first.clone());
                    }
                }
                if ($('li.active', jumpNav).length) {
                    more.addClass('active');
                } else {
                    more.removeClass('active');
                }
            } else {
                more.hide();
                jumpNav.hide();
            }
        }).trigger('resize');
    },
    //隐藏左侧栏多余的操作,没有则为空
    checkAccountSetting: function() {
        var gk_settings = $('#gk_account .account_settings'),
                opts = gk_settings.find('a');
        //return;
        if (opts.size() > 3) {
            var arrow = $('<a class="more_opts" href="javascript:void(0)"><s></s></a>'), more_opt_wrapper = $('<div class="more_opt_wrapper"></div>');
            opts.slice(3).each(function() {
                more_opt_wrapper.append($(this).clone(true));
                $(this).hide();
                gk_settings.append(more_opt_wrapper);
            });
            opts.eq(2).css({
                'border-right': '1px solid #152131'
            });
            opts.css('width', '50px');
            gk_settings.append(arrow);

            arrow.click(function() {
                more_opt_wrapper.show();
                var hide_timer;
                var showWrapper = function() {
                    if (hide_timer) {
                        clearTimeout(hide_timer);
                    }
                };
                var hideWrapper = function() {
                    hide_timer = setTimeout(function() {
                        more_opt_wrapper.hide();
                    }, 400);
                };
                arrow.mouseenter(function() {
                    showWrapper();
                });
                arrow.mouseleave(function() {
                    hideWrapper();
                });
                more_opt_wrapper.mouseenter(function() {
                    showWrapper();
                });
                more_opt_wrapper.mouseleave(function() {
                    hideWrapper();
                });
            });
        } else if (!opts.size()) {
            gk_settings.parent().empty();
        }
    },
    // 浮出右边详细层
    popDetail: function(classes, otherWidth, callback, scope) {
        var _context = this;
        scope = scope ? $(scope) : $('body');
        if ($.type(otherWidth) !== 'number') {
            otherWidth = 0;
        }
        var detailWidth = isGKSyncClient() ? 0 : 300;
        var getWidth = function() {
            var width = $(window).width() - detailWidth - otherWidth;
            width = width < 800 ? 800 : width;
            return width;
        };
        if (!$(classes + '_overlay', scope).length) {
            var overlay = classes.replace('.', '');
            $(classes, scope).after($('<div />', {
                'class': overlay + '_overlay ui-widget-overlay'
            }));
        }
        //点击阴影事件以及显示
        $(classes + '_overlay', scope).on('click', function() {
            if (!$(classes, scope).is(":animated")) {
                $(classes + ' .close_horn', scope).trigger("click");
            }
        }).show();
        //展示效果
        $(classes, scope).css({
            'width': getWidth() + 'px',
            'right': getWidth() * -1,
            'z-index': 999,
            'opacity': 0
        }).show().animate({
            'right': 0 + 'px',
            'opacity': 1
        }, 'fast', 'easeInQuad', callback);
        //关闭事件
        $(classes, scope).on('click', '.close_horn', function() {
            if (gkLocation.isFiles() || gkLocation.isTeamFiles()) {
                gkLocation.setHash(PAGE_CONFIG.ac, {
                    fullpath: PAGE_CONFIG.fullpath,
                    showDel: PAGE_CONFIG.showDel
                });
            } else {
                gkUI.closePopDetail(classes, scope);
            }
        });
        //适应窗口大小
        $(window).on('resize', function() {
            $(classes, scope).width(getWidth());
        });
    },
    closePopDetail: function(classes, scope) {
        scope = scope ? $(scope) : $('body');
        if ($(classes, scope).size()) {
            $(classes, scope).animate({
                'right': -800,
                'opacity': 0
            }, 'fast', 'easeOutQuad', function() {
                $(this).remove();
                $(classes + '_overlay', scope).remove();
            });
        }
    },
    //短信验证码显示等待重新发送
    smsShowWait: function(btn, wait_second) {
        if (btn.attr('disabled')) {
            return;
        }
        var btn_text = btn.text();
        btn.attr('disabled', true).dataset('cd', wait_second);
        var cooldown = function() {
            var second = btn.dataset('cd');
            if (second) {
                btn.dataset('cd', --second);
                btn.text(L('resend_sms',second));
                setTimeout(function() {
                    cooldown();
                }, 1000);
            } else {
                btn.removeAttr('disabled').text(btn_text);
            }
        };
        cooldown();
    },
    fuckIE: function(once) {
        if(once && $.cookie('gk_fuck_ie') || $('.upload_page').size()){
            return;
        }
        var setTop = function(add) {
            $('#left_sidebar,#wrapper,#header,.management_header').each(function() {
                if ($(this).is('#header') || $(this).is('.management_header')) {
                    $(this).css('padding-top', add > 0 ? add : 0);
                } else {
                    $(this).css('top', $(this).offset().top + add);
                }
            });
        };
        setTop(24);
        var fuck_ie = $('<div class="fuck_ie">'+L('fuck_ie')+'</div>');
        $('body').append(fuck_ie);
        fuck_ie.find('.remove_fuck_ie').click(function() {
            fuck_ie.remove();
            setTop(-24);
            once && $.cookie('gk_fuck_ie', 1);
            return;
        });
        fuck_ie.animate({'top': 0});
    }
};
/*右键菜单*/
var gkContextMenu = {
    show: function(cmdBox, pageX, pageY, isRemove, onCancel) {
        isRemove = typeof isRemove === undefined ? true : false;
        cmdBox.show(1, function() {
            var posElem = cmdBox.offsetParent() || $('body');//cmdbox相对定位的元素
            var top = 0,
                    left = 0,
                    cmdBoxWidth = cmdBox.outerWidth(),
                    cmdBoxHeight = cmdBox.outerHeight();
            top = pageY - posElem.offset().top;
            if (document.documentElement.clientHeight - pageY < cmdBoxHeight) {
                if (pageY < cmdBoxHeight) {
                    top = document.documentElement.clientHeight / 2 - cmdBoxHeight / 2 - posElem.offset().top;
                }
                else {
                    top = top - cmdBoxHeight;

                }
                top += 5;
            } else {
                top -= 5;
            }

            if (document.documentElement.clientWidth - pageX < cmdBoxWidth) {
                left = posElem.width() - cmdBoxWidth - 20;
            }
            else {
                left = pageX - posElem.offset().left;
            }
            left -= 5;
            cmdBox.css({
                'top': top + 'px',
                'left': left + 'px'
            });
        });

        var contextmenu_outer_timer = null;
        var removeCmd = function() {
            if (isRemove) {
                cmdBox.remove();
            } else {
                cmdBox.hide();
            }
            if (onCancel && typeof onCancel === 'function') {
                onCancel();
            }
        };
        cmdBox.mouseleave(function() {
            contextmenu_outer_timer = setTimeout(function() {
                removeCmd();
            }, 400);
        });
        cmdBox.mouseenter(function() {
            if (contextmenu_outer_timer) {
                clearTimeout(contextmenu_outer_timer);
            }
        });
        cmdBox.click(function() {
            if (isRemove) {
                cmdBox.remove();
            } else {
                cmdBox.hide();
            }
        });
    }
};

gkSupport = {
    checkNewFeature:function(){
        var newFuncElem = $('.quick_nav .newfunc');
      if(!newFuncElem.size()){
          return;
      }
        newFuncElem.hide();
        var last_dateline = $.cookie('new_feature');
        var read = 0;
        var dateline = 0;
        if(last_dateline){
            var temp = last_dateline.split('|');
            read = temp[1];
            dateline = temp[0];
        }

        if(read==1||!$.isNumeric(last_dateline) || new Date().getTime()-dateline*1000>7*24*3600*1000){
            newFuncElem.find('s').hide();
        }
     gkAjax.Support.getNewFeature(function(data){
         if(!data){
             return;
         }
         newFuncElem.prop({
             'href':data.url,
             'title':data.title
         })
         newFuncElem.find('span').text(data.title);
         newFuncElem.show();
        if(data.dateline != dateline){
            newFuncElem.find('s').show().css('display','block');
            $.cookie('new_feature',data.dateline+'|0',{
                expires: 180,
                path: '/',
                domain: PAGE_CONFIG.cookieDomain
            });
        }
         newFuncElem.click(function(){
             newFuncElem.find('s').hide();
             var old_val =  $.cookie('new_feature').split('|')[0];
             $.cookie('new_feature',old_val+'|1',{
                 expires: 180,
                 path: '/',
                 domain: PAGE_CONFIG.cookieDomain
             });
         });
     },function(){
         return false;
     });
    },
    show: function() {
        $('body').loader();
        gkAjax.Support.show(function(data) {
            $.loader.close();
            $(data).gkDialog({
                draggable: true,
                width: 800,
                dialogClass: 'dialog_no_title',
                close: function() {
                    $(this).remove();
                }
            });
            gkSupport.init();
        });
    },
    init: function() {
        $('#dialog_support input[placeholder]').placeholder();
        //提交问题
        $("#feedback_publish_btn").on("click", function() {
            var feedbackTxt = $.trim($("#feedback_txt").val());
            var tel = $.trim($("#contact_tel").val());
            if (!feedbackTxt.length) {
                $.alert(L('FEEDBACK_EMPTY_QUESTION'), {
                    type: 'error'
                });
                return false;
            }
            if (!tel.length) {
                $.alert(L('FEEDBACK_EMPTY_PHONE_NUM'), {
                    type: 'error'
                });
                return false;
            }
            if (!Util.Validation.isPhoneNum(tel)) {
                $.alert(L('FEEDBACK_PHONE_FORMAT'), {
                    type: 'error'
                });
                return false;
            }
            var params = {
                feedback_txt: feedbackTxt,
                tel: tel
            };
            $('#dialog_support .feedback_publish_wrp').loader();
            gkAjax.Support.addFeedback(params, function(data) {
                $.loader.close();
                $("#feedback_txt").val('');
                var jFeedback = $(data);
                gkSupport.initDlgs(jFeedback);
                $('#dialog_support .support_dlg_list').prepend(jFeedback);
            });
            return false;
        });
        var supportDlgs = $("#dialog_support .support_dlg_list .support_dlg");
        gkSupport.initDlgs(supportDlgs);
        gkSupport.initPagination();
    },
    initPagination: function() {
        $('#dialog_support .pagination button, #dialog_support .pagination a').off('click').on('click', function() {
            var jSelf = $(this);
            var page = 1;
            if (jSelf.is('button')) {
                page = $.trim($('#dialog_support .pagination input[name=p]').val());
                if (!$.isNumeric(page)) {
                    $.alert(L('INPUT_NUM'), {
                        type: 'error'
                    });
                    return false;
                }
            } else {
                page = jSelf.attr("rel");
            }
            $('#dialog_support').loader();
            gkAjax.Support.supportDlgs(page, function(data) {
                $.loader.close();
                $('#dialog_support .support_dlg_list, #dialog_support .pagination').remove();
                $('#dialog_support').append(data);
                gkSupport.initDlgs($('#dialog_support .support_dlg'));
                gkSupport.initPagination();
            });
            return false;
        });
    },
    initDlgs: function(supportDlgs) {
        //回复
        supportDlgs.find('.reply_btn').off("click").on('click', function() {
            var supportDlg = $(this).parents('.support_dlg');
            var dlgReplyWrp = supportDlg.find('.dlg_reply_main_wrp'),
                    replyTextbox = dlgReplyWrp.find('.reply_textbox');
            dlgReplyWrp.toggle();
            replyTextbox.val('');
            if (dlgReplyWrp.is(':visible')) {
                replyTextbox.focus();
            }
            return false;
        });
        //关闭问题
        supportDlgs.find('.close_feedback_btn').off('click').on('click', function() {
            if (!confirm(L('FEEDBACK_CLOSE_QUESTION'))) {
                return false;
            }
            var supportDlg = $(this).parents('.support_dlg');
            var feedbackId = supportDlg.attr('feedback_id');
            supportDlg.loader();
            gkAjax.Support.closeFeedback(feedbackId, function(data) {
                $.loader.close();
                var jSupportDlg = $(data);
                gkSupport.initDlgs(jSupportDlg);
                supportDlg.replaceWith(jSupportDlg);
            });
            return false;
        });
        //提交回复
        supportDlgs.find('.reply_submit_btn').off('click').on('click', function() {
            var supportDlg = $(this).parents('.support_dlg');
            var feedbackId = supportDlg.attr('feedback_id');
            var replyTxt = $.trim(supportDlg.find('.reply_textbox').val());
            if (!replyTxt.length) {
                $.alert(L('FEEDBACK_EMPTY_CONTENT'), {
                    type: 'error'
                });
                return false;
            }
            supportDlg.loader();
            var params = {
                feedback_dlg_txt: replyTxt,
                feedback_id: feedbackId
            };
            gkAjax.Support.addFeedbackDlg(params, function(data) {
                $.loader.close();
                supportDlg.find('.reply_btn').trigger('click');
                var jDlgItem = $(data).hide();
                supportDlg.children('.dlg_item:last').after(jDlgItem);
                jDlgItem.fadeIn('fast');
            });
            return false;
        });
        //取消回复
        supportDlgs.find(".reply_cancel_btn").off("click").on('click', function() {
            var replyMainWrp = $(this).parent();
            replyMainWrp.toggle();
        });
    },
    assign: function(supportDlg, feedbackId, memberEmail) {
        supportDlg.find(".feedback_assigned_member").css("background", "url(/Common/images/icon/loading16x16.gif) no-repeat center center");
        $.ajax({
            type: "post",
            url: '/admin/assignFeedback',
            data: {
                feedback_id: feedbackId,
                member_email: memberEmail
            },
            dataType: "html",
            error: Util.Exception.ajaxError,
            success: function(html) {
                supportDlg.find(".feedback_assigned_member").css("background", "none");
                var jSupportDlg = $(html);
                init_support_dlgs(jSupportDlg);
                supportDlg.replaceWith(jSupportDlg);
            }
        });
    }
};

//设置
gkSetting = {
    init: function(el) {
        if (!el.length) {
            return;
        }
        this.bindProfile($('ul.settings'));
        //this.bindSafe($(ul));
        this.bindDevices($('ul.settings'));
    },
    bindProfile: function(scope) {
        var self = this;
        $('#gk_account .account_photo, a[rel=profile]').unbind('click').bind('click', function() {
            $.loader.open();
            gkAjax.Setting.getProfile(function(data) {
                $.loader.close();
                self.content = $(data);
                self.content.gkDialog({
                    title: L('settings'),
                    width: 700,
                    height: 500,
                    close: function() {
                        self.photo_setting && self.photo_setting.remove();
                        self.upload = undefined;
                        self.content.remove();
                    },
                    create: function(){
                        $(this).prev().find('.ui-dialog-titlebar-close').text(L('close')).addClass('ui-button').removeClass('ui-dialog-titlebar-close');
                    }
                });
                self.bind(self.content);
                self.profile(self.content);
                self.safe(self.content);
            });
        });
        if (PAGE_CONFIG.unActive && !$.cookie('popSetting' + PAGE_CONFIG.memberId)) {
            $('#gk_account .account_photo').trigger('click');
            $.cookie('popSetting' + PAGE_CONFIG.memberId, 1);
        }
    },
    bindSafe: function(scope) {
        var self = this;
        $('a[rel=safe]', scope).on('click', function() {
            $.loader.open();
            gkAjax.Setting.getSafeset(function(data) {
                $.loader.close();
                $(data).gkDialog({
                    title: L('security_settings'),
                    width: 750,
                    create: function() {
                        self.safe($(this));
                    }
                });
            });
        });
    },
    bindDevices: function(scope) {
        var self = this;
        $('a[rel=devices]', scope).add($('a.more_devices')).on('click', function() {
            $.loader.open();
            gkAjax.Setting.getDevices(function(data) {
                $.loader.close();
                $(data).gkDialog({
                    title: L('binded_devices'),
                    width: 800,
                    create: function() {
                        self.devices($(this));
                    }
                });
            });
        });
    },
    // 安全设置
    safe: function(scope) {
        //修改邮箱
        $('.mail .edit_mail', scope).on('click', function(){
            $(this).parents('.form_item').next().show().find('input').val('');
            $(this).hide().prev().val('').removeClass('input_text_readonly').removeAttr('disabled').prev().text(L('new_email'));
            return false;
        });
        $('.mail .cancel_btn', scope).on('click', function(){
            var input = $(this).parents('.form_item').hide().prev().find('input');
            input.addClass('input_text_readonly').attr('disabled',true).val(input.dataset('val'));
            input.next().show();
            input.prev().text(L('login_email'));
            return false;
        });
        $('.mail .ok_btn', scope).on('click', function(){
            var dom = $(this),
                input = dom.parent().prev().find('input'),
                email = $.trim(input.val()),
                password = $.trim(dom.prev().val());
            if (!email.length) {
                $.alert(L('please_enter_bind_email'));
                return;
            }
            if (!Util.RegExp.Email.test(email)) {
                $.alert(L('pls_enter_a_valid_email_address'));
                return;
            }
            if (!password.length) {
                $.alert(L('pls_enter_your_password'));
                return;
            }
            $(this).loader();
            gkAjax.Member.resetEmail(email, password, function (data) {
                $.loader.close();
                input.addClass('input_text_readonly').attr('disabled', true).val(input.dataset('val')).prev().text(L('login_email'));
                var html = $('<span>'+L("we_have_sent_a_verify_email_to_your_mailbox",email) +'</span><a href="javascript:;" >'+L("resend")+'</a>');
                html.filter('a').on('click', function () {
                    gkAjax.Member.resetEmail(email, password, function (data) {
                        $.alert(L('send_valid_email_success'), {type: 'success'});
                        return false;
                    });
                });
                dom.parent().empty().append(html).show();
            });

        });

        //绑定邮箱
        $('.mail .bind_email', scope).on('click', function() {
            var email = $.trim($(this).prev().val()),
                dom = $(this);
            if (!email.length) {
                $.alert(L('please_enter_bind_email'));
                return;
            }
            if (!Util.RegExp.Email.test(email)) {
                $.alert(L('pls_enter_a_valid_email_address'));
                return;
            }
            $(this).loader();
            gkAjax.Member.bindEmail(email, function (data) {
                $.loader.close();
                dom.hide().prev().addClass('input_text_readonly').attr('disabled', true);
                var html = $('<span>'+L('we_have_sent_a_verify_email_to_your_mailbox')+'</span><a href="javascript:;" >'+L('resend')+'</a>');
                html.filter('a').on('click', function () {
                    gkAjax.Member.bindEmail(email, function (data) {
                        $.alert(L('we_have_sent_a_verify_email_to_your_mailbox'), {type: 'success'});
                        return false;
                    });
                });
                dom.parent().next().empty().append(html).show();
            });
            return false;
        });

        //发送验证
        $('.send_valid_email', scope).on('click', function() {
            $(this).loader();
            gkAjax.Account.sendValidEmail(function() {
                $.loader.close();
                $.alert(L('send_valid_email_success'), {
                    type: 'info'
                });
            });
            return false;
        });

        // 修改密码
        $('.reset button', scope).click(function() {
            var input_name = [L('SETTINGS_OLD_PASSWORD'), L('SETTINGS_NEW_PASSWORD'), L('SETTINGS_CONFIRM_PASSWORD')],
                    flag = false,
                    input = $('.reset input', scope);
            input.each(function(i) {
                if (!i) {
                    return;
                }
                var value = $.trim($(this).val());
                if (!value.length) {
                    $.alert(input_name[i] + L('SETTINGS_EMPTY_PASSWORD'));
                    return false;
                }
                if (value.length < 6) {
                    $.alert(L('SETTINGS_PASSWORD_FORMAT'));
                    return false;
                }
                flag = true;
            });

            if ($.trim(input.eq(1).val()) != $.trim(input.eq(2).val())) {
                $.alert(L('SETTINGS_WRONG_CONFIRM_PASSWORD'));
                return false;
            }

            flag && gkAjax.Setting.changePassword($.trim(input.eq(0).val()), $.trim(input.eq(1).val()), function() {
                $.alert(L('SETTINGS_CHANGE_PASSWORD_SUC'), {
                    type: 'success'
                });
                input.val('');
                scope.dialog('close');
            });
        });


        //销毁账号
        $('.destroy a', scope).on('click', function() {
            if (!confirm(L('DEREGISTER_ACCOUNT_CONFIRMATION'))) {
                return;
            }
            if (PAGE_CONFIG.orgId != '0') {
                $.alert(L('DEREGISTER_ACCOUNT_ALERT'), {
                    type: 'info'
                });
                return;
            }
            var destory = function() {
                gkAjax.Account.applyDestroyAccount(function(data) {
                    $.loader.close();
                    if (data.send_email) {
                        $.alert(L('DEREGISTER_INFO'), {
                            type: 'info'
                        });
                    } else {
                        $.alert(L('DEREGISTER_SUC'), {
                            type: 'success',
                            closeTime: 3000,
                            withTime: true,
                            onClose: function() {
                                window.location.href = '/logout';
                            }
                        });
                    }
                });
            };
            var oauth = $(this).dataset('oauth_email');
            if (oauth) {
                gkWeibo.getMemberId(oauth, function(data) {
                    if (data == PAGE_CONFIG.memberId) {
                        destory();
                    } else {
                        $.alert(L('DEREGISTER_ERROR'));
                        $.loader.close();
                    }
                });
            } else {
                destory();
            }
        });
        // 动态密码
        var dpscope = $('.dynamic_password', scope);
        var cancel = function() {
            $('.step1 input,.step2,input', dpscope).removeAttr('readonly').removeAttr('style').val('');
            $(':checkbox', dpscope).removeAttr('checked');
            $('.step1,.step2,.finish', dpscope).hide();
        };
        var cancel2 = function() {
            $('.step1 input,.step2,input', dpscope).removeAttr('readonly').removeAttr('style').val('');
            $('.step1,.step2', dpscope).hide();
            $('.finish', dpscope).show();
        };
        $(':checkbox', dpscope).on('click', function() {
            if ($(this).is(':checked')) {
                $('.step1', dpscope).show();
            } else {
                if ($('.switch', dpscope).dataset('open')) {
                    if (confirm('确定取消动态密码登录？')) {
                        $(this).loader();
                        gkAjax.Setting.cancelDynamicPwd(function() {
                            $('.switch', dpscope).dataset('open', '');
                            $.loader.close();
                            cancel();
                        });
                    } else {
                        return false;
                    }
                } else {
                    cancel();
                }
            }
        });
        $('.step1 .next,.step2 .again', dpscope).on('click', function() {
            var phone = $.trim($('.step1 input', dpscope).val());
            if (!phone.length) {
                $.alert(L('pls_enter_you_phone_number'));
                return;
            }
            if (phone.length < 11 || !Util.RegExp.PhoneNumber.test(phone)) {
                $.alert(L('pls_enter_a_valid_phone_number'));
                return;
            }
            $(this).loader();
            gkAjax.Setting.sendDynamicPwdSms(phone, function() {
                $.loader.close();
                $('.step1', dpscope).hide();
                $('.step2', dpscope).show();
                $('.step2 .phone', dpscope).css('color', '#BDBDBD').attr('readonly', true);
                gkUI.smsShowWait($('.step2 .again', dpscope), 60);
            });
        });
        $('.step2 .next', dpscope).on('click', function() {
            var phone = $.trim($('.step2 .phone', dpscope).val()),
                    code = $.trim($('.step2 .code', dpscope).val());
            if (!code) {
                $.alert(L('please_input_verify_code'));
                return false;
            }
            $(this).loader();
            gkAjax.Setting.checkDynamicPwd(phone, code, function() {
                $.loader.close();
                cancel2();
                $('.finish', dpscope).find('span').text(phone);
                $('.switch', dpscope).dataset('open', 1);
            });
        });
        $('.cancel', dpscope).on('click', function() {
            if ($('.switch', dpscope).dataset('open')) {
                cancel2();
            } else {
                cancel();
            }
        });
        $('.change', dpscope).on('click', function() {
            $('.finish', dpscope).hide();
            $('.step1', dpscope).show();
        });
    },
    // 设备相关
    devices: function(scope, uid) {
        //开启关闭设备
        $('.device_list .tog_dev_btn', scope).click(function() {
            var el = $(this);

            var flag = el.dataset('state');
            if (flag == 1 && !confirm(L('are_you_sure_to_disable_this_device'))) {
                return false;
            }
            var callSuccess = function() {
                if (flag == 1) {
                    el.text(L('SETTINGS_USE_DEVICE')).dataset('state', 0);
                    el.parents('tr').find('.enable').removeClass('enable').addClass('disable');
                } else {
                    el.text(L('SETTINGS_KILL_DEVICE')).dataset('state', 1);
                    el.parents('tr').find('.disable').removeClass('disable').addClass('enable');
                }
                var appItem = $('.app_item[id=' + el.dataset('device_id') + ']');
                appItem && (flag && appItem.find('.sync').hide() || appItem.find('.sync').show());
                $.loader.close();
            };
            el.parents('tr').loader();
            if(uid){
                gkAjax.Manage.changeDevice(uid, el.dataset('device_id'), el.dataset('state'), callSuccess);
            }else{
                gkAjax.Setting.changeDevice(el.dataset('device_id'), el.dataset('state'), callSuccess);
            }
        });

        //删除设备记录
        $('.device_list .del_dev_btn', scope).click(function() {
            var el = $(this);
            if (!confirm(L('are_you_sure_to_remove_this_device_log'))) {
                return false;
            }
            var callSuccess = function() {
                el.parents('tr').fadeOut('slow', function() {
                    $(this).remove();
                });
            };
            if(uid){
                gkAjax.Manage.delDevice(uid, el.dataset('device_id'), callSuccess);
            }else{
                gkAjax.Setting.delDevice(el.dataset('device_id'), callSuccess);
            }
        });
    },
    profile: function(scope) {
        var self = this;
        //个人基础信息修改
        $('.input_item', scope).on('mouseenter', 'span', function() {
            if (!$(this).nextAll('.edit').size()) {
                $(this).after($('<a href="javascript:;"/>').addClass('edit').text(L('edit')));
            }
        }).on('mouseleave', function() {
            $(this).find('.edit').remove();
        });
        $('.input_item', scope).on('click', 'a', function() {
            var item = $(this).parents('.input_item');
            $('.edit', item).remove();
            var session = item.html(), type = item.dataset('type');
            var input = $('<input />'), sspan = item.find('span');

            if (sspan.size()) {
                input.val(sspan.text());
            }
            var saveFunc = function(el, session) {
                var val = $.trim(el.val()), params = {};
                var none = item.dataset('none');

                var isAdd = $(session).is('a') && !val.length,
                        isAllowNone = !none && !val.length,
                        isEq = (val == $.trim($(session).text()));
                if (isAdd || isAllowNone || isEq) {
                    item.html(session);
                    return;
                }
                switch (type) {
                    case 'address':
                        params.detail_address = val;
                        break;
                    case 'phone':
                        if (val.length && !Util.Validation.isPhoneNum(val)) {
                            $.alert(L('pls_enter_a_valid_phone_number'));
                            return;
                        }
                        params.member_phone = val;
                        break;
                    default:
                        return;
                }
                el.loader();
                gkAjax.Setting.saveProfile(params, function() {
                    $.loader.close();
                    if (!val.length) {
                        item.html('<a href="javascript:;">' + none + '</a>');
                    } else {
                        item.html($('<span />').text(val).attr('title', val));
                    }
                });
            };
            input.on('blur', function() {
                saveFunc($(this), session);
            });
            input.on('keyup', function(e) {
                if (e.keyCode == 13) {
                    saveFunc($(this), session);
                }
            });
            item.empty().append(input);
            input.focus();
        });
        //用户名修改
        $('.user_name a', scope).on('click', function () {
            $(this).parent().hide().next().show().find('input').trigger('focus');
        });
        $('.edit_input button:eq(0)', scope).on('click', function () {
            var oldVal = $(this).parent().prev().find('span').attr('title'),
                newVal = $.trim($(this).prev().val()),
                dom = $(this);
            if (!newVal.length) {
                $.alert(L('pls_enter_your_username'));
                return false;
            }
            if (oldVal == newVal) {
                dom.parent().hide().prev().show();
            } else {
                dom.loader();
                gkAjax.Setting.saveProfile({username: newVal}, function () {
                    $.loader.close();
                    var span = dom.parent().prev().find('span');
                    span.add('.username').text(newVal).attr('title', newVal);
                    dom.parent().hide().prev().show();
                });
            }
            return false;
        });
        $('.edit_input button:eq(1)', scope).on('click', function () {
            $(this).parent().hide().prev().show();
            return false;
        });
        $('.edit_input input', scope).on('keydown', function(e){
            if(e.keyCode == 13){
                $(this).next().trigger('click');
            }
        });

        // 绑定修改头像
        $('.setting_photo a', scope).on('click', function() {
            self.init_photo_setting();
        });
        $('.setting_photo').hover(function() {
            $(this).find('.toggle').slideDown();
        }, function() {
            $(this).find('.toggle').slideUp();
        });

        //解除认证
        $('.weibo_item', scope).on('mouseenter', 'span', function() {
            if (!$(this).nextAll('.edit').size()) {
                $(this).after($('<a href="javascript:;"/>').addClass('edit').addClass('unbind_wb').text(L('unbind')));
            }
        }).on('mouseleave', function() {
            $(this).find('.edit').remove();
        });
        scope.on('click', '.unbind_wb', function() {
            var dom = $(this).prev('span');
            if (!confirm(L('WEIBO_CANCEL_CONNECT_CONFIRMATION'))) {
                return;
            }
            var oauth = dom.parent().dataset('oauth');
            gkAjax.Setting.unbindOauth(oauth, function() {
                dom.replaceWith($('<a href="javascript:;"/>').addClass('bind_wb').text(L('bind_weibo',dom.parent().dataset('title'))));
                if (oauth == PAGE_CONFIG.from) {
                    location.href = '/logout';
                }
            });
        });

        //绑定认证
        scope.on('click', '.bind_wb', function() {
            var dom = $(this);
            var oauth = dom.parent().dataset('oauth');
            gkWeibo.getToken(oauth, function(token, expires) {
                var dloader = dom.loader();
                gkAjax.Setting.bindOauth({
                    wbtoken: token,
                    oauth: oauth,
                    expires: expires
                }, function(data) {
                    dloader.remove();
                    dom.replaceWith($('<span />').text(data.user_name));
                });
            });
        });

        //邮箱设置
        $('.setting_mail input:checkbox', scope).on('click', function(){
            $(this).loader({
                position: [-1,-1]
            });
            gkAjax.Setting.saveEmailSet($(this).dataset('type'), $(this).is(':checked') ? 1 : 0, function () {
                $.loader.close();
            });
        });
    },
    bind: function(scope) {
        var self = this;
        $('.setting_tab a', scope).on('click',function(){
            var div = $('.' + $(this).dataset('ref'));
            div.show().siblings(':not(.setting_tab)').hide();
            $(this).parent().addClass('checked').siblings().removeClass('checked');
            return false;
        });
    },
    init_photo_setting: function() {
        var ths = this;
        this.photo_setting = $('.photo_setting_wrp');
        this.photo_setting.gkDialog({
            title: L('SETTINGS_CHANGE_AVATAR'),
            width: 600,
            height: 530,
            buttons: [
                {
                    text: L('close'),
                    click: function() {
                        $(this).gkDialog('close');
                    }
                },
                {
                    text: L('save'),
                    'class': 'blue_btn',
                    click: function() {
                        $(this).parent().loader();
                        gkAjax.Setting.savePhoto(ths.img.uri, function() {
                            $.loader.close();
                            $('.current_user_photo').attr('src', ths.img.url);
                            $('.setting_photo .photo_layout:not(.toggle)').addClass('toggle').text(L('click_to_upload_photo')).hide();
                            ths.photo_setting.gkDialog('close');
                        });
                    }
                }
            ],
            open: function() {
                $(".webcam_wrp .capture").show();
                $(".webcam_wrp .reset,.webcam_wrp .upload").hide();
            },
            create: function() {
                ths.init_upload();
                ths.init_tab();
                ths.init_webcam();
            },
            close: function() {
                return;
            }
        });
    },
    init_tab: function() {
        $('.photo_setting_wrp li a').on('click', function() {
            $(this).parent().addClass('active').siblings().removeClass('active');
            $('.' + $(this).attr('rel')).show().siblings().hide();
        });
    },
    //初始化上传
    init_upload: function() {
        var ths = this;
        $('.photo_setting_wrp .default_photos .photo').unbind('click').click(function() {
            $(this).addClass('active').siblings().removeClass('active');
            var img = $(this).children('img').eq(0);
            ths.set_photo(img.attr('src'), img.dataset('uri'));
            $.alert(L('SETTINGS_DEFAULT_AVATAR'), {
                type: 'info'
            });
        });

        if (this.upload) {
            return;
        }
        var el = $('.photo_setting_wrp .photo_wrp .btn')[0];
        qq.UploadHandlerXhr.isSupported = function() {
            return false;
        };
        this.upload = new qq.FileUploaderBasic({
            button: el,
            action: '/my/upload_user_photo',
            name: 'photo_file',
            multiple: false,
            sizeLimit: 2097152,
            minSizeLimit: 0,
            allowedExtensions: ['jpg', 'png', 'gif'],
            debug: true,
            messages: {
                typeError: L('SETTINGS_AVATAR_FORMAT_ALERT') + '{extensions}',
                sizeError: L('avatar_filesize_limit')
            },
            onSubmit: function() {
                $('.photo_setting_wrp').loader();
            },
            onComplete: function(id, fileName, response) {
                $.loader.close();
                $('.photo_upload_info').text(fileName);
                var data = $.parseJSON(response);
                ths.set_photo(data.photo_url, data.photo_uri);
            }
        });
    },
    //初始化摄像头
    init_webcam: function() {
        var ths = this;
        webcam.set_api_url('/my/save_webcam_photo');
        webcam.set_quality(100);
        webcam.set_shutter_sound(true, "/Common/js/lib/webcam/shutter.mp3");
        webcam.set_swf_url("/Common/js/lib/webcam/webcam.swf");
        //设置回调函数
        webcam.set_hook("onComplete", function(ret) {
            ret = $.parseJSON(ret);
            if (ret.result == 1)       //保存失败
                $.alert(ret.msg, {
                    type: 'error'
                });
            else {
                $.alert(L('SETTINGS_AVATAR_GET_SUC'), {
                    type: 'info'
                });
                ths.set_photo(ret.url, ret.uri);
            }
        });
        //未找到摄像设备:   "No camera was detected."
        webcam.set_hook('onError', function(msg) {
            if (msg == "No camera was detected.") {         //未找到设备
                $(".webcam_wrp").html('<div class="nocam">:)&nbsp;' + L('SETTINGS_NO_WEBCAM') + '</div>');
            }
            else {
                $.alert(L('SETTINGS_WEBCAM_ERROR'), {
                    type: 'error'
                });
            }
        });
        var html = webcam.get_html(320, 320, 128, 128);
        $(".webcam_wrp .webcam").html(html);
        $(".webcam_wrp .capture").click(function() {
            webcam.freeze();
            $(this).hide();
            $(".webcam_wrp .reset,.webcam_wrp .upload").show();
        });
        $(".webcam_wrp .reset").click(function() {
            webcam.reset();
            $(".webcam_wrp .capture").show();
            $(".webcam_wrp .reset,.webcam_wrp .upload").hide();
        });
        $(".webcam_wrp .upload").click(function() {
            webcam.upload();
            $(this).hide();
        });
    },
    //设置头像
    set_photo: function(url, uri) {
        this.img = {
            url: url,
            uri: uri
        };
        $('.photo_setting_wrp .photo_preview img').attr('src', url).dataset('uri');
    }
};

$.fn.gkDialog = function(arg) {
    if ($.type(arg) === 'string') {
        $(this).dialog(arg);
    } else {
        var defaults = {
            resizable: false,
            draggable: false,
            modal: true,
            closeText: '×',
            close: function() {
                $(this).remove();
            }
        };
        if (Util.Browser.isMobile()) {
            arg.width = 'auto';
            arg.height = 'auto';
        }
        $(this).dialog($.extend(defaults, arg));
    }
};

/**
 * $.gkConfirmDialog(title,message,onOk,onCancel)
 * confirm dialog
 */
(function(window) {
    var $ = window.jQuery;
    var dialogLoader = function() {
        var jDialogWrp = $(this).parents("div.ui-dialog");
        jDialogWrp.loader();
    };
    $.extend({
        gkConfirmDialog: function(title, message, onOk, onCancel) {
            var jDialog = $("<div style='font-size:13px;padding:20px 30px;color:#434343;'>" + message + "</div>");
            jDialog.loader = dialogLoader;
            jDialog.dialog({
                title: title,
                modal: true,
                closeText: "×",
                dialogClass: "gk_confirm_dialog",
                width: 350,
                buttons: [
                    {
                        "text": L('cancel'),
                        "click": function() {
                            if (typeof(onCancel) == "function") {
                                onCancel(jDialog);
                            }
                            jDialog.dialog("close");
                        }
                    },
                    {
                        "text": L('ok'),
                        "class": "blue_btn",
                        "click": function() {
                            if (typeof(onOk) == "function") {
                                onOk(jDialog);
                            }
                        }
                    }
                ],
                close: function() {
                    $(this).remove();
                }
            });
        }
    });
})(window);

//团队成员
var gkMember = {
    SUPER_ADMIN: 0, //超级管理员
    ASSIST_ADMIN: 1, //协助管理员
    ORDINARY_MEMBER: 2, //内部成员
    TEMP_MEMBER: 3, //外部成员
    isAdmin: function(memberType) {
        return memberType < this.ORDINARY_MEMBER;
    },
    isSuperAdmin: function(memberType) {
        return memberType == this.SUPER_ADMIN;
    },
    isTempMember: function(memberType) {
        return memberType.length && memberType == this.TEMP_MEMBER;
    },
    isOauthEmail: function(email) {
        return /^[^@]+@gk\.oauth\.[a-zA-Z0-9_-]+$/.test(email);
    },
    isOrdinaryMember: function(memberType) {
        return memberType !== '' && memberType <= this.ORDINARY_MEMBER;
    }
};
gkMember.getTreeData = function(my_contacts, org_members, org_contacts) {
    var treeData = [];

    if (my_contacts !== undefined) {
        treeData.push(
                {
                    'root': true,
                    'id': 'my_contacts',
                    'name': L('my_contacts'),
                    'photo': '/Common/images/icon/contact_group_icon64x64.png',
                    'members': PAGE_CONFIG.my_contacts || []
                }
        );
    }
    if (org_members != undefined) {
        treeData.push(
                {
                    'root': true,
                    'id': 'org_members',
                    'name': L('org_members'),
                    'photo': '/Common/images/icon/all_members_icon64x64.png',
                    'members': org_members || []
                }
        );
    }
    return gkMember.fromatMemberTree(treeData);
};
gkMember.showBindEmailDialog = function(callback) {
    var html = '';
    html += '<div class="form-horizontal dialog_simple_wrp"><div class="control-group">';
    html += '<label class="control-label">' + L('EMAIL') + '：</label>';
    html += '<div class="controls"><input type="text" class="input_text_radius input_bind_email" value="" name="email" />';
    html += '</div></div></div>';
    $(html).gkDialog({
        title: L('bind_email'),
        width: 420,
        dialogClass: "bind_email_dialog",
        buttons: [
            //确定按钮
            {
                "text": L('ok'),
                "class": "blue_btn",
                "click": function() {
                    var email = $.trim($(this).find('.input_bind_email').val());
                    if (!email.length) {
                        $.alert(L('please_enter_bind_email'));
                        return;
                    }
                    if (!Util.RegExp.Email.test(email)) {
                        $.alert(L('pls_enter_a_valid_email_address'));
                        return;
                    }
                    $(this).parent().loader();
                    gkAjax.Member.bindEmail(email, function(data) {
                        $.loader.close();
                        if (callback && typeof callback === 'function') {
                            callback(data);
                        } else {
                            var dialog = $(data.html);
                            dialog.gkDialog({
                                title: L('tip'),
                                width: 422,
                                dialogClass: "bind_email_success_dialog",
                                create: function() {
                                    $(this).find('.valid_now').click(function() {
                                        dialog.dialog('close');
                                    });
                                }
                            });
                        }
                    });
                }
            }
        ],
        create: function() {

        }
    });

};

gkMember.launchpad = function() {
    $('.launch_start .manage').click(function() {
        gkMember.showManage();
        return false;
    });
    $('.launch_start em.active').click(function() {

        gkMember.showBindEmailDialog();
    });

    $('.launch_start em.validate').click(function() {
        gkSetting.show();
    });
};

gkMember.showManage = function() {
    if ($.browser.msie && $.browser.version < 7) {
        var set_height = function() {
            $('#openManage').css('height', $(window).height());
        };
        set_height();
        $(window).on('resize', function() {
            set_height();
        });
    }
    $('#openManage').fadeIn('fast');
};

/*将member数组格式化为适合Tree输出的格式*/
gkMember.fromatMemberTree = function(members) {
    var tree = [];
    if (!members) {
        return tree;
    }

    $.each(members, function(k, v) {
        var node = {};
        node['id'] = v['id'] + '';
        node['text'] = v['name'];
        node['hasChildren'] = false;
        node['complete'] = true;
        node['isexpand'] = true;
        node['showcheck'] = false;
        node['value'] = v['email'];
        node['name'] = v['name'];
        node['classes'] = 'member_node';
        node['photo'] = v['photo'] || '';
        if (typeof v['email'] === 'undefined' && v['members']) {//组
            node['value'] = v['id'] + '';
            node['classes'] = 'group_node';
            node['hasChildren'] = true;
            node['ChildNodes'] = gkMember.fromatMemberTree(v['members']);
        } else {//人
            node['email'] = v['email'];
            node['type'] = v['type'] || '';
        }
        if (v['root']) {
            node['classes'] = 'root_node';
        }
        tree.push(node);
    });
    return tree;
};
gkMember.showCreateOrg = function() {
    $('#createTeam').gkDialog({
        title:L('upgrade'),
        width: 480,
        height: 240,
        dialogClass: 'dialog_create_org',
        close: function() {
        }
    });
    gkMember.initCreateOrg();
};
gkMember.initCreateOrg = function() {
    $('#createTeam .create_org_btn').on('click', function() {
        var org_name = $.trim($('#createTeam #create_org_name').val());
        if (!org_name.length) {
            $.alert(L('pls_enter_your_team_name'), {
                type: 'error'
            });
            return false;
        }
        var params = {
            'name': org_name
        };
        $('.dialog_create_org').loader();
        gkAjax.Account.createOrg(params, function() {
            $.alert(L('your_team_has_been_created'), {
                type: 'success'
            });
            setTimeout(function() {
                location.href = '/manage/dashboard';
            }, 2000);
        });
        return false;
    });
};
gkMember.showSendEmailDialog = function(title, subject, content, callback) {
    $('#sendEmailDialogTmpl').tmpl({
        content: content
    }).gkDialog({
        title: title,
        width: 430,
        open: function() {
            var scope = $(this);
            var input = $('.email_input').emailInput(150);
            $('.btn', scope).on('click', function() {
            });
        },
        buttons: [
            {
                "text": L("cancel"),
                "click": function() {
                    $(this).dialog("close");
                }
            },
            {
                "text": L("ok"),
                "class": "blue_btn",
                "click": function() {
                    var scope = $(this);
                    var input = $('.email_input').emailInput(300);
                    var emails = [],
                            content = $.trim($('textarea', scope).val());
                    scope.find('.email_input .input_label').each(function() {
                        var email = $.trim($(this).attr('email'));
                        if (Util.Validation.isEmail(email)) {
                            emails.push(email);
                        }
                    });

                    if (!emails.length) {
                        $.alert(L('pls_enter_a_valid_email_address'));
                        return;
                    }
                    scope.parent().loader();

                    content = content.replace(/[\r\n]/ig,"<br/>");
                    var matches = content.match(Util.RegExp.HTTPALL);

                    if (matches) {
                        $.each(matches, function(i, n) {
                            content = content.replace(n, '<a href="' + n + '" target="_blank" >' + n + '</a>');
                        });
                    }
                    gkAjax.Member.sendEmail(subject, content, emails, [], [], function() {
                        $.loader.close();
                        if ($.isFunction(callback)) {
                            callback();
                        }
                        $.alert(L('email_has_been_sent'), {
                            'type': 'success'
                        });
                        scope.dialog('close');
                    });
                }
            }
        ]
    });
};

gkMember.showCopyDialog = function(title, text) {
    //console.log($('#copyTextDialogTmpl').size());
    $('#copyTextDialog').tmpl({
        text: text
    }).gkDialog({
        title: title,
        width: 450,
        open: function() {
            var input = $(this).find('input');
            var text = $.trim(input.val());
            initCopyBtn($(this).find('.blue_btn'), text);
            input.click(function() {
                this.select();
            });
        }
    });
};
//检测当前账户的状态：是否过期，还剩的时间，是否试用版
gkMember.checkAccountState = function(){
    var pathname =location.pathname;
    if(PAGE_CONFIG.orgId>0 ||  /\/view/.test(pathname) && PAGE_CONFIG.code){

    }else{
        return;
    }

    if(!/\/(storage|view|member|client|app|manage)/.test(pathname) || /manage\/account/.test(pathname)){
          return;
    }

    var params ={};
    if(/\/view/.test(pathname)){
        params.code =  PAGE_CONFIG.code;
    }
    gkAjax.Account.getAccountState(params,function(data){
        if(!data || !data.html){
            return;
        }
        var state = data.state;
        var dialogClass = 'product_expiring_dialog';
        if(state['expired']==1){
            dialogClass+=' product_expired_dialog'
        }
        $(data.html).gkDialog({
            title: L('tips'),
            width: 560,
            dialogClass:dialogClass,
            close: function() {
                if(state['trial']==1 && PAGE_CONFIG.orgId!=0){
                    $.cookie('remind_product_'+PAGE_CONFIG.orgId,1,{
                        expires: 1,
                        path: '/',
                        domain: PAGE_CONFIG.cookieDomain
                    });
                }

            }
        });
    });
}
var gkSocket = {
    init: function() {
        $(window).on('blur', function() {
            PAGE_CONFIG.checkInterval = 300;//300秒-600秒
        });
        $(window).on('focus', function() {
            PAGE_CONFIG.checkInterval = 30;//30秒-60秒
        });
        PAGE_CONFIG.checkInterval = 20;//20秒-40秒
        var interval = Math.ceil(PAGE_CONFIG.checkInterval * (1 + Math.random()) * 1000);
        setInterval(function() {
            gkSocket.checkNew();
        }, interval);
        gkSocket.checkNew();
    },
    checkNew: function() {
        var self = this;
        var params = {};
        var last_update_time = $.cookie('lut_' + PAGE_CONFIG.memberId);
        if (!last_update_time || !$.isNumeric(last_update_time)) {
            last_update_time = 0;
        }
        var last_msg_dateline = $.cookie('last_dateline_' + PAGE_CONFIG.memberId);
        if (!last_msg_dateline || !$.isNumeric(last_msg_dateline)) {
            last_msg_dateline = 0;
        }
        params = {
            last_update_time: last_update_time,
            last_msg_dateline: last_msg_dateline
        };
        gkAjax.File.checkNew(params, function(data) {
            self.setUpdateState(data);
            //self.setNoticeState(data.notice_count);
        });
    },
    //更新更新
    setUpdateState: function(data) {
        var update_count = data.update_count;
        if (gkLocation.isUpdates()) {
            if (update_count > 0) {
                var updateNews = $('.update_news');
                updateNews.find('.update_count').text(update_count);
                updateNews.slideDown();
            }
            else {
                $('#update_tip_wrapper').hide();
            }
        }
    },
    setNoticeState: function(notice_count) {
        var count = 0;
        if (notice_count > 0) {
            count = notice_count;
        }
        if (count > 0) {
            $('.quick_nav i.notice span').text(count).css('visibility', 'visible');
        } else {
            $('.quick_nav i.notice span').css('visibility', 'hidden');
        }

    }
};

var gkWeibo = {
    callback: [],
    getToken: function(type, callback) {
        var queue = this.callback.length;
        window.open(gkAjax.Weibo.getAuthUrl(type, queue));
        this.callback[queue] = callback;
    },
    checkToken: function(type, auth, callback) {
        var ths = this;
        if ($.type(auth) === 'function') {
            callback = auth;
            auth = 1;
        }
        gkAjax.Weibo.checkAuth(type, auth, function(data) {
            if (data.code) {
                callback(data.access_token, data.expires_in);
            } else {
                $.alert(L('GOING_TO_AUTH_PAGE'), {
                    type: 'info'
                });
                ths.getToken(type, function(token, expires) {
                    gkAjax.Setting.bindOauth({
                        wbtoken: token,
                        oauth: type,
                        expires: expires
                    }, function() {
                        callback(token, expires);
                    });
                });
            }
        }, function(request) {
            var result = $.parseJSON(request.responseText);
            if (result.error_code == 40307) {
                ths.getToken(type, callback);
            }
        });
    },
    getMemberId: function(type, callback) {
        this.getToken(type, function(access_token) {
            $.loader.open();
            gkAjax.Weibo.getMemberId(access_token, type, callback);
        });
    },
    //发布微博
    publish: function(content, type, callback, token) {
        var publshFunc = function(token) {
            var publishTmpl = $('<div class="gray_hemp_bg"><div class="textarea_bg"><textarea >' + content + '</textarea>'
                    + '<div class="c_f ops"><span class="f_l">' + L('WEIBO_CHAR_INPUT_1') + ' <em>140</em>' + L('WEIBO_CHAR_INPUT_2') + '</span><button class="btn green_btn f_r">'+L('submit')+'</button></div></div></div>');
            publishTmpl.gkDialog({
                title: L('SHARE_GK_TO') + (type == 'qq' ? L('TENCENT') : L('SINA')) + L('WEIBO'),
                dialogClass: 'weibo_publish',
                width: 600,
                height: 300,
                create: function() {
                    var scope = $(this);
                    $(this).prev().prepend('<span class="logo"></span>');
                    $('textarea', $(this)).on('focus click keyup change', function() {
                        var str = $.trim($(this).val());
                        var len = Util.String.strLen(str);
                        if (len > 280) {
                            $(this).val(Util.String.subStr(str, 280));
                            len = 280;
                        }
                        $('.ops span em', scope).text(parseInt((280 - len) / 2));
                    }).trigger('focus');
                    $('button', $(this)).on('click', function() {
                        var str = $.trim($('textarea', scope).val());
                        if (!str) {
                            $.alert(L(SAY_STH), {
                                type: 'info'
                            });
                            return;
                        }
                        gkAjax.Weibo.publish({
                            wbtoken: token,
                            content: str,
                            type: type
                        }, function() {
                            callback && callback();
                            $.alert(L('WEIBO_POST_SUC'), {
                                type: 'success'
                            });
                            publishTmpl.gkDialog('close');
                        });
                    });
                }
            });
        };
        if (token) {
            publshFunc(token);
        } else {
            this.checkToken(type, function(token) {
                publshFunc(token);
            });
        }
    },
    //关注够快并转发微博
    followPublish: function(type, callback){
        var content = L('weibo_content');
        this.getToken(type, function(token) {
            gkAjax.Weibo.followPublish({
                wbtoken: token,
                content: content,
                type: type
            }, function() {
                callback && callback();
                $.alert('关注并转发微博成功！',{type:'success'});
            });
        });
    },
    //微博一键分享
    weiboShare: function(from, title, href) {
        var url, params;
        if (from === 'sina') {
            url = 'http://v.t.sina.com.cn/share/share.php?',
                    params = {
                title: title,
                url: href,
                source: 'bookmark',
                appkey: '2654430345'
            };
        } else if (from === 'qq') {
            url = 'http://share.v.t.qq.com/index.php?',
                    params = {
                c: 'share',
                a: 'index',
                appkey: '801277274',
                title: title,
                url: href,
                pic: '',
                line1: ''
            };
        }
        if (url) {
            window.open(url + $.param(params), '_blank', 'width=650,height=400');
        }
    }
};

var gkMission = {
    init: function() {
        var scope = $('.mission');
        this.bindWeibo(scope);
        this.bindInvite(scope);
    },
    bindWeibo: function(scope){
        $('#weibo_item', scope).on('click', function(){
            gkWeibo.getToken('sina', function(token) {
                $.loader.open();
                gkAjax.Mission.weiboGift(token, function() {
                    $.alert('关注并转发微博成功！',{type:'success'});
                    location.reload()
                });
            });
            return false;
        });
    },
    bindInvite: function(scope){
        $('#invite_btn', scope).on('click', function(){
            var emails = $.trim($('#invite_emails').val());
            if (!emails) {
                $.alert(L('pls_enter_emails'));
                return;
            }
            var emails_arr = emails.split(/[\s\n,;|；，]+/);
            for (var i = 0; i < emails_arr.length; i++) {
                if (emails_arr[i].length && !Util.RegExp.Email.test(emails_arr[i])) {
                    L('is_not_a_valid_emial_address',i + 1)
                    return;
                }
            }
            $(this).loader();
            gkAjax.Member.addContact(emails_arr, function(data) {
                $.loader.open();
                $.alert(L('invitation_sent_successfully'), {
                    type: 'info',
                    onClose: function(){
                        location.reload();
                    }
                });
            }, function(){}, 0);
            return false;
        });
    }
};

function initCopyBtn(copyBtn, text) {
    if (!copyBtn.size()) {
        return;
    }
    if (typeof PAGE_CONFIG === 'object' && isGKSyncClient() && typeof gkClientInterface !== undefined) {
        copyBtn.click(function() {
            text = text ? text : $(this).attr(text);
            gkClientInterface.setClipboardData(text);
            $.alert(L('clip_success'), {
                type: 'success'
            });
        });
    } else if (window.clipboardData) {
        copyBtn.click(function() {
            text = text ? text : $(this).attr(text);
            window.clipboardData.setData("Text", text);
        });
    } else if (Util.Browser.isInstallFlash()) {
        var clip = new ZeroClipboard.Client();
        clip.addEventListener('onComplete', function() {
            $.alert(L('clip_success'), {
                type: 'success'
            });
        });
        clip.addEventListener('onMouseover', function() {
            text = text ? text : copyBtn.attr(text);
            clip.setText(text);
        });
        clip.setHandCursor(true);
        var html = $(clip.getHTML(copyBtn.outerWidth(), copyBtn.outerHeight()));
        html.appendTo(copyBtn.offsetParent()).css({
            'position': 'absolute',
            'top': copyBtn.position().top,
            'left': copyBtn.position().left
        });
    } else {
        copyBtn.hide();
    }
}

function setCopy(val) {
    if (0) {
        window.clipboardData.setData("Text", val);
    } else {
        var copyDialogTmpl = $('<div class="copy_wrapper"><input type="text" readonly="readonly" class="text_input input_text_radius" value="'
            + val + '"/><button class="btn blue_btn">'+L('copy')+'</button></div>');
        copyDialogTmpl.gkDialog({
            title: L('copy_to_clipboard'),
            width: 400,
            open: function () {
                initCopyBtn($(this).find('button'), val);
            },
            close: function(){
                $(this).remove();
            }
        });
    }
}

/*检测浏览器的userAgent是不是我们同步客户端*/
function isGKSyncClient() {
    var userAgent = navigator.userAgent;
    return userAgent.indexOf('GK_SYNC') === 0 || (typeof PAGE_CONFIG !== 'undefined' && PAGE_CONFIG.client == 1);
}

/*检测浏览器的userAgent是不是我们企业套件的客户端*/
function isGKSuiteClient() {
    var userAgent = navigator.userAgent;
    return userAgent.indexOf('GK_SUITE') === 0;
}

/**
 * 消息
 * @type type
 */
var gkMessage = {
    wrapperClass: '.msg_wrapper',
    init: function(btn) {
        var _context = this;
        btn && btn.click(function() {
            _context.show();
            return;
        });
    },
    show: function() {
        var _context = this;
        var dialog = $('<div class="msg_dialog_content"></div>');
        dialog.gkDialog({
            width: 830,
            height: 500,
            title: L('notification'),
            dialogClass: 'gk_msg_dialog',
            open: function() {
                var _self = $(this);
                _self.loader();
                gkAjax.Notice.getMain({}, function(data) {
                    $.loader.close();
                    if (data) {
                        _self.append(data.html);
                        _self.find('.msg_wrapper').css('height', _self.height());
                        _context.initMain(dialog);
                        _context.setUnreadCount();
                    }
                });

            }
        });
    },
    initMain: function(dialog) {
        var wrapper = $(this.wrapperClass),
                _context = this;
        wrapper.find('.filter_by_type').droplist();

        //收到的消息，系统消息
        wrapper.find('.msg_nav li').click(function() {
            var nav = $(this).dataset('nav');
            _context.getList({
                nav: nav
            });
        });

        //筛选消息类型
        wrapper.find('.msg_type_list li a').click(function() {
            var type = $(this).dataset('type');
            _context.getList({
                type: type
            });
        });

        //显示更多
        wrapper.on('click', '.msg_more', function() {
            var dom = $(this),
                    start = dom.dataset('start');
            dom.loader();
            gkAjax.Notice.getMain({
                start: start
            }, function(data) {
                $.loader.close();
                if (data) {
                    var items = $(data.html);
                    items.filter('.item_grid').each(function() {
                        if ($('.item_grid[title=' + $(this).attr('title') + ']', wrapper).size()) {
                            $(this).hide();//先隐藏
                        }
                    });
                    dom.replaceWith(items);
                    _context.initItem(items, dialog);
                    $('.item_grid:hidden', wrapper).remove();//后删除
                }
            });
        });

        _context.initItem(wrapper.find('.msg_list .msg_item'), dialog);
    },
    setUnreadCount: function() {
        var noticeWrapper = $('#header .quick_nav .notice span');
        if (noticeWrapper.size()) {
            var count = $('#header .quick_nav .notice span').text();
            if (!$.isNumeric(count)) {
                return;
            }
            count = 0;
            noticeWrapper.text(count).css('visibility', 'hidden');
        }
    },
    initItem: function(items, dialog) {
        var _context = this;
        items.find('.msg_file a.name').click(function() {
            if (!isGKSyncClient() && dialog) {
                dialog.dialog('close');
            }
        });

    },
    getList: function(params) {
        var _context = this,
                wrapper = $(_context.wrapperClass);
        wrapper.loader();
        gkAjax.Notice.getMain(params, function(data) {
            $.loader.close();
            if (data) {
                wrapper.find('.msg_list').html(data.html);
                _context.initItem(wrapper.find('.msg_list .msg_item'));
            }

            if (params && params.nav) {
                wrapper.find('.msg_nav li').removeClass('current_nav');
                wrapper.find('.msg_nav li[data-nav="' + params.nav + '"]').addClass('current_nav');
            }
        });
    }
};
//显示升级提示
$.fn.upgradeTip = function(code) {
    var show = function() {
        gkAjax.Account.upgradeTip(code, function(data) {
            var width = 500;
            if (!data.single) {
                width = 600;
            }
            $(data.html).gkDialog({
                dialogClass: 'upgrade_tip_dlg',
                title: data.title,
                modal: false,
                width: width,
                create: function() {
                    var dialog = $(this);
                    $('.upgrade_btn', dialog).on('click', function() {
                        location.href = $(this).attr('href');
                    });
                    if (data.single) {
                        $('#showMore', dialog).on('click', function() {
                            dialog.parent().fadeOut(function() {
                                dialog.dialog('close');
                                $.fn.upgradeTip();
                            });
                        });
                    } else {
                        var banner = $('.upgrade_tips');
                        banner.xslider({
                            timeout: 5000,
                            speed: 600,
                            effect: 'fade',
                            navigation: true,
                            onLoaded: function() {
                                var size = $('.xslider-nav li', dialog).size();
                                $('.xslider-nav ul', dialog).width(27 * size);
                                $('.slide_arrow', dialog).on('click', '.left', function() {
                                    banner.xslider('previous');
                                }).on('click', '.right', function() {
                                    banner.xslider('next');
                                });
                            }
                        });
                    }
                }
            });
        });
    };
    if ($(this).length) {
        $(this).on('click', function() {
            show();
        });
    } else {
        show();
    }
    ;
    $(window).on('click', function(e) {
        if (!$('.upgrade_tip_dlg').size() || $(e.target).hasClass('upgrade_tip_dlg') || $(e.target).parents('.upgrade_tip_dlg').size()) {
            return;
        }
        $('.upgrade_tip_wrp').dialog('close');
    });
};
/**
 * 邮箱输入框
 * @returns {undefined}
 */
$.fn.emailInput = function(width, el) {
    el = el ? el : 'span';
    var input = $(this);
    width && input.width(width);
    input.wrap($('<div />', {'class': input.attr('class')})).removeAttr('class').css({
        border: 0
    }).after('<input type="hidden" />');
    var input_wrapper = input.parent(), hidden = input.next('input:hidden');

    //更新数据
    var update_val = function() {
        var emails = [];
        input_wrapper.find('span[email]').each(function() {
            emails.push($(this).attr('email'));
        });
        hidden.val(emails.toString());
    };

    //移除对象
    var remove_item = function(item) {
        item.remove();
        update_val();
    };

    //添加对象
    var insert_item = function(val) {
        var item = $('<' + el + '/>').addClass('input_label').text(val).attr('email', val);
        input.before(item).val('');
        update_val();
    };

    //按键事件
    input.on('blur', function() {
        var val = $.trim($(this).val());
        if (Util.RegExp.Email.test(val)) {
            insert_item(val);
        }
    }).on('keydown', function(e) {
        var keycode = e.keyCode;
        //13 enter,32 space,186 ;,188 ,
        var submit_code = [13, 32, 186, 188];
        if ($.inArray(keycode, submit_code) >= 0) {
            var val = $.trim($(this).val());
            if (Util.RegExp.Email.test(val)) {
                insert_item(val);
            }
            e.preventDefault();
        } else if (keycode === 8) {
            if (input_wrapper.find(el).size() && !$(this).val().length) {
                var last = input_wrapper.find(el + ':last');
                remove_item(last);
            }
        }
    });

    return hidden;
};

(function($) {
    $.fn.gkUpload = function(options) {
        var opts = $.extend(true, {}, $.fn.gkUpload.defaults, options);
        return this.each(function() {
            var _self = $(this);
            _self.click(function() {
                var params = $.param(opts.params);
                var url = opts.url + '?' + params;
                $.fn.gkUpload.open(url, opts.width, opts.height, opts.name);
                return;
            });
        });
    };

    $.fn.gkUpload.open = function(url, width, height, name) {
        var top = (window.screen.availHeight - 30 - height) / 2;
        var left = (window.screen.availWidth - 10 - width) / 2;
        window.open(url, name, 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',toolbar=no,menubar=no,scrollbars=no,resizable=no');
    };

    // 插件的defaults    
    $.fn.gkUpload.defaults = {
        height: 400,
        width: 700,
        name: 'gk_upload_window',
        url: '/storage/upload',
        params: {
            fileSizeLimit: 300 * 1024 * 1024,
            uploadParams: ''
        }
    };
    //从我的够快中选择
    $.fn.gkUpload.gokuai = function(options) {
        var win = window.opener;
        $('#select_from_gokuai').on('click', function() {
            var gkc_panel = new GKC({
                style: {
                    borderRadius: '3px',
                    borderColor: '#3B74BA',
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    backgroundColor: '#fff',
                    position: this.isIE6 ? 'absolute' : 'fixed',
                    top: '0',
                    right: '0',
                    height: '340px',
                    width: '385px',
                    zIndex: 99999
                },
                menus: [
                    {
                        text: L('select'),
                        type: 1,
                        fileType: 0,
                        callback: function(data) {
                            if (!data) {
                                return;
                            }

                            var file = {
                                id: data.hash,
                                name: data.filename,
                                size: data.filesize,
                                hash: data.hash
                            };
                            if ($('.upload_wrapper #' + data.hash).size()) {
                                alert(L('index_file_uploaded'));
                                return;
                            }
                            if (Number(file.size) > Number(options.fileSizeLimit)) {
                                alert(L('index_file_size_limit', Util.Number.bitSize(options.fileSizeLimit)));
                                return;
                            }
                            var ext = gkStorage.getExt(file.name);
                            if ($.inArray(ext, options.denyExts) >= 0) {
                                alert(L('index_file_format_limit', ext));
                                return;
                            }
                            if (confirm(L('are_you_sure_to_upload', file.name))) {
                                var fileProgress = new FileProgress(file, $('.upload_wrapper').find('.upload_list'));

                                var from_fullpath = data.dir ? data.fullpath + '/' : data.fullpath;
                                var params = options.uploadParams;
                                params.from_fullpath = from_fullpath;
                                fileProgress.setUploading();
                                win && win[options.ajaxCopy] && win[options.ajaxCopy](params, function() {
                                    fileProgress.toggleCancel(false);
                                    fileProgress.setLeaveSize(0, 0);
                                    fileProgress.setSuccess();
                                    win && win[options.stopCallback] && win[options.stopCallback](options.uploadParams.path);
                                }, function(request, textStatus, errorThrown) {
                                    var errorMsg = gkAjax.Exception.getError(request, textStatus, errorThrown).msg;
                                    fileProgress.setErrorMsg(L('upload_failure', errorMsg));
                                });
                            }
                        }
                    }
                ]
            });
            return;
        });
    };

    $.fn.gkUpload.init = function(options) {
        var _context = this;
        var defaults = {
            fileSizeLimit: 300 * 1024 * 1024,
            uploadURL: '',
            stopCallback: '',
            redirectURL: '',
            uploadParams: {},
            denyExts: '',
            allowExts: '',
            ajaxCopy: '',
            iframe: 0,
            desc: ''
        };
        var opts = $.extend({}, defaults, options);
        // console.log(opts);
        $(document).bind('drop,dragover', function(e) {
            e.preventDefault();
        });

        var uploadWrapper = $('#gk_upload_wrapper');
        var noContentText = '';
        var isMobile = Util.Browser.isMobile();
        if (isMobile && typeof opts.uploadParams.path !== 'undefined') {
            var toFileName =L('current_dir');
            if(opts.uploadParams.path){
                toFileName = Util.String.baseName(opts.uploadParams.path);
            }else if(opts.uploadParams.code && opts.uploadParams.filename){
                toFileName =  opts.uploadParams.filename;
            }
            noContentText = L('upload_to',toFileName);
        } else if (!isMobile) {
            noContentText = '<div style="color:#738291">'+L('drag_to_upload')+'</div>';
            if (!$.support.cors) {
                noContentText = '<div style="color:#738291">'+L('browser_do_not_support_multi_file_upload')+'</div>';
            }
            if(opts.maxUploadSize>0){
                noContentText+='<div style="font-size: 13px" >'+L('upload_filesize_limit_tip',Util.Number.bitSize(opts.webUploadSize),Util.Number.bitSize(opts.maxUploadSize))+'</div>';
            }else if(opts.webUploadSize>0){
                noContentText+='<div style="font-size: 13px" >'+L('upload_filesize_limit',Util.Number.bitSize(opts.webUploadSize))+'</div>';
            }
        }

        var redirectURL = opts.redirectURL;
        if ($.support.cors) {
            redirectURL = '';
        }
        var noContent = $('<div class="no_content"><div class="empty">' + noContentText + '</div></div>');
        uploadWrapper.find('.upload_list .no_content').remove();
        uploadWrapper.find('.upload_list').append(noContent);
        uploadWrapper.find('.btn.open_new_uploader').click(function() {
            $.fn.gkUpload.open(location.href, $(window).width(), $(window).height(), window.name + '_' + Util.getUuid());
            return;
        });

        $.fn.gkUpload.gokuai(options);
        var target = uploadWrapper.find('.upload_list');
        var path = opts.uploadParams.path;
        $('#select_files').fileupload({
            url: opts.uploadURL + '?' + Math.random(),
            type: 'POST',
            dataType: 'json',
            sequentialUploads: true,
            redirect: redirectURL,
            formData: opts.uploadParams,
            add: function(e, data) {
                if (!data) {
                    return;
                }
                var files = data.files;
                var mobile = Util.Browser.isMobile();
                $.each(files, function(i, file) {
                    file.id = new Date().getTime();
                    file.gkFilename = file.name;
                    var fileData = $.extend({},file);
                    if(mobile && $.inArray(mobile,['ipad','iphone','ipod'])>=0){
                        var name_pre = fileData.name.slice(0,fileData.name.lastIndexOf('.'));
                        var ext = Util.String.getExt(fileData.name);
                        fileData.name = name_pre+'_'+ file.id+'.'+ext;
                        file.gkFilename =fileData.name;
                    }
                    var fileProgress = new FileProgress(fileData, target);
                    data.context = fileProgress;
                });
                data.submit();
                return;
            },
            submit: function(e, data) {
                if (!data || !data.files) {
                    return;
                }

                data.formData = opts.uploadParams;
                var progress = data.context;
                var files = data.files;
                var file = files[0];

                data.formData.name = file.gkFilename;
                if(typeof file.relativePath !=='undefined'){
                    if(file.relativePath ){
                        data.formData.path =path+'/'+Util.String.rtrim(file.relativePath,'/');
                    }
                }
                if (file) {
                    var ext = Util.String.getExt(file.name);
                    if (opts.allowExts && $.inArray(ext, opts.allowExts.split(',')) < 0) {
                        progress.setErrorMsg(L('upload_file_type_limit',opts.allowExts));
                        return false;
                    }
                    if (opts.denyExts && $.inArray(ext, opts.denyExts.split(',')) > -1) {

                        progress.setErrorMsg(L('pls_zip_to_upload',Util.String.getExt(file.name)));
                        return false;
                    }
                    if ($.isNumeric(file.size) && file.size > opts.fileSizeLimit) {
                        progress.setErrorMsg(L('file_size_overlimit',Util.Number.bitSize(opts.fileSizeLimit)));
                        return false;
                    }
                }
                progress.toggleCancel(true, data.jqXHR);
            },
            send: function(e, data) {

            },
            done: function(e, data) {
                var result = data.result, arr = [];
                if ($.isArray(result)) {
                    arr = result;
                } else {
                    arr = $.parseJSON(decodeURIComponent(result));
                }
                if (!$.isArray(arr)) {
                    return;
                }
                var isError = arr[0];
                var progress = data.context;
                if (isError == 1) {
                    var errorMsg = arr[1];
                    if (errorMsg) {
                        progress.setErrorMsg(errorMsg);
                        return;
                    }
                } else {
                    progress.setSuccess();
                }
            },
            fail: function(e, data) {
                var progress = data.context;
                progress.setFail(L('upload_failed'));
            },
            always: function(e, data) {

            },
            progress: function(e, data) {
                var bytesLoaded = data.loaded, bytesTotal = data.total;
                var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                var progress = data.context;
                progress.setProgress(percent);
                progress.setLeaveSize(bytesLoaded, bytesTotal);
            },
            progressall: function() {

            },
            start: function() {

            },
            stop: function(e, data) {
                var win = window.opener;
                win && win[opts.stopCallback] && win[opts.stopCallback](opts.uploadParams.path);
                var isClose = $('input[name="close_when_finish"]:checked').size();
                if (isClose) {
                    if ($.browser.msie) {
                        var version = parseInt($.browser.version);
                        window.opener = null;
                        if (version < 9 && version > 6) {
                            window.open("", "_self");
                        }
                    }
                    window.close();
                }
            },
            change: function() {

            },
            paste: function() {

            },
            drop: function(e, data) {
                $('body .ui-widget-overlay').hide();
                $('body #drop_zone').hide();
            },
            dragover: function(e, data) {
                var mask = $('.ui-widget-overlay');
                var dropZone = $('#drop_zone');
                mask.show();
                dropZone.show();
            },
            chunksend: function() {

            },
            chunkdone: function() {

            },
            chunkfail: function() {

            },
            chunkalways: function() {

            }
        });
    };
})(jQuery);

function debugInfo(info) {
    var wrapper;
    if (!$('#gk_debug_dialog').size()) {
        wrapper = $('<div id="gk_debug_dialog"><div>');
        wrapper.appendTo($('body')).css({
            'position': 'fixed',
            'top': '10px',
            'right': '10px',
            'z-index': 99999,
            'width': '300px',
            'overflow': 'auto',
            'height': '320px',
            'background': '#fff',
            'border': '1px solid #ccc'
        });
    } else {
        wrapper = $('#gk_debug_dialog');
    }
    wrapper.append('<div>' + info + '</div>');
}

var gkStatistics = {
    afterRegist: function(uid, callback) {

        _agt.push(['_atsusr', uid]);
        $.getScript('//t.agrantsem.com/js/ag.js', function() {
            $.ajax({
                url: '//www.googleadservices.com/pagead/conversion.js',
                timeout: 3000,
                dataType: 'script',
                complete: function() {
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            });

        });
    }
};
var gkFile = {
    //检测文件名的格式有效性
    checkFilenameValid: function(filename) {
        filename = $.trim(filename);
        if (!filename.length) {
            $.alert(L('FILE_EMPTY_FILE_NAME'), {
                type: 'error'
            });
            return false;
        }
        var reg = /\/|\\\\|\:|\*|\?|\"|<|>|\|/;
        if (reg.test(filename)) {
            $.alert(L('FILE_FILE_NAME_FORMAT'), {
                type: 'error'
            });
            return false;
        }
        if (filename.length > 255) {
            $.alert(L('FILE_FILE_NAME_LENTH'), {
                type: 'error'
            });
            return false;
        }
        return true;
    }
};
/**
 * 文本框输入@跟#提示
 * data: @的数据;
 * btns: 按钮的范围
 */
(function($) {
    $.inputTip = {
        init: function(jqTextarea, jqData, jqBtns) {
            var self = this;
            self.begin(jqTextarea, jqData);
            self.bindBtns(jqTextarea, jqBtns);
        },
        checkAt: function(jqTextarea, jqData) {
            var self = this;
            var textareaElem = jqTextarea[0];
            var val = jqTextarea.val();
            var cursor = Util.Input.getCurSor(textareaElem);
            var inputPos = cursor.split('|');
            var leftStr = val.slice(0, inputPos[0]); //截取光标左边的所有字符
            var lastIndex = leftStr.lastIndexOf('@'); //获取光标左边字符最后一个@字符的位置
            var hintWrapperSelector = '#input_list_wrapper';
            var hintWrapper = $(hintWrapperSelector);
            var insertChar = function(input) {
                input += ' ';
                val = val.substr(0, lastIndex + 1) + input + val.substr(inputPos[1], val.length);
                jqTextarea.val(val);
                if (isInsert) {
                    Util.Input.moveCur(textareaElem, parseInt(inputPos[0]) + (input).length);
                } else {
                    Util.Input.moveCur(textareaElem, val.length);
                }
                hintWrapper.remove();
            };
            var q = leftStr.slice(lastIndex + 1, leftStr.length); //获取@与光标位置之间的字符

            if (lastIndex < 0) {
                hintWrapper.remove();
                return;
            }

            //如果@与光标之间有空格，隐藏提示框
            if ($.trim(q).length != q.length || q.indexOf('#') >= 0) {
                hintWrapper.remove();
                return;
            }

            if (hintWrapper.size() && hintWrapper.attr('rel') === q) {
                self.setPosition(jqTextarea, hintWrapper);
                return;
            }
            else {
                hintWrapper.remove();
            }

            var resultList = [];
            if (!q.length) {
                resultList = jqData;
            } else {
                if (jqData && jqData.length) {
                    for (var i = 0; i < jqData.length; i++) {
                        if (jqData[i].short_name && jqData[i].short_name.indexOf(q) === 0) {
                            resultList.unshift(jqData[i]);
                        } else if (jqData[i].name.indexOf(q) != -1) {
                            resultList.push(jqData[i]);
                        }
                    }
                }
            }
            if (!resultList.length) {
                return;
            }
			var heights = 0;
			if(resultList.length > 7){
			  heights = 200;
			}else{
              heights = resultList.length * 25;
			}
			hintWrapper = $('<ul id="input_list_wrapper"  rel="' + q + '"></ul>');
			var username = '';
            for (var i = 0; i < resultList.length; i++) {
                username = resultList[i].username || resultList[i].name;
                hintWrapper.append('<li><a title="' + username + '" class="' + (i == 0 ? 'select' : '') + '" href="javascript:void(0)" email="' + resultList[i].email + '" uid="' + resultList[i].id + '" >' + username + '</a></li>');
            }
            $('body').append(hintWrapper);
			$("#input_list_wrapper").css({left:"10px",top:jqTextarea.offset().top - heights +"px"});
			 
            hintWrapper.mousedown(function(e) {
                e.stopPropagation();
            });
            if (hintWrapper.height() > 200) {
                hintWrapper.css({
                    height: 200,
                    overflow: 'auto'
                });
            }
            hintWrapper.show(1, function(){
                self.setPosition(jqTextarea, $(this));
            });
            var isInsert = inputPos[1] != val.length;

            hintWrapper.find('li a').mouseenter(function() {
                hintWrapper.find('li a').removeClass('select');
                $(this).addClass('select');
            });

            hintWrapper.find('li a').click(function(e) {
                insertChar($(this).text());
                e.stopPropagation();
                return;
            });

            $(document).off('keydown').on('keydown', function(e) {
                var key_code = e.keyCode;
                var remind_member_list = $('#input_list_wrapper');
                if (!remind_member_list.size()) {
                    return;
                }
                var select = remind_member_list.find('li .select');
                var index = select.parent().index();
                var size = remind_member_list.find('li').size();
                var itemHeight = remind_member_list.find('li:eq(0)').height();
                if (key_code == 38) { //up
                    e.preventDefault();
                    remind_member_list.find('li a').removeClass('select');
                    if (index == 0) {
                        remind_member_list.find('li:nth-child(' + (size) + ') a').addClass('select');
                        remind_member_list.scrollTop(remind_member_list.find('.select').position().top);
                    } else {
                        remind_member_list.find('li:nth-child(' + (index) + ') a').addClass('select');
                        var j_top = remind_member_list.find('.select').position().top;
                        if (j_top >= -itemHeight && j_top < 0) {
                            remind_member_list.scrollTop(remind_member_list.scrollTop() + j_top);
                        }
                    }
                }
                else if (key_code == 40) { //down
                    e.preventDefault();
                    remind_member_list.find('li a').removeClass('select');
                    if (index == (size - 1)) {
                        remind_member_list.find('li:nth-child(1) a').addClass('select');
                        remind_member_list.scrollTop(0);
                    } else {
                        remind_member_list.find('li:nth-child(' + (index + 2) + ') a').addClass('select');
                        var j_top = remind_member_list.find('.select').position().top - remind_member_list.height();
                        if (j_top >= 0 && j_top < itemHeight) {
                            remind_member_list.scrollTop(remind_member_list.scrollTop() + itemHeight + j_top);
                        }
                    }
                }
                else if (key_code == 13 || key_code == 32) { //space enter
                    insertChar(select.text());
                    e.preventDefault();
                }
            });
        },
        //检测#
        checkPound: function(jqTextarea,jqData) {
            var self = this;
            var textareaElem = jqTextarea[0];
            var val = jqTextarea.val();
            var cursor = Util.Input.getCurSor(textareaElem);
            var inputPos = cursor.split('|');
            var hintWrapperSelector = '#input_calendar_wrapper';
            var hintWrapper = $(hintWrapperSelector);
            var leftStr = val.slice(0, inputPos[0]); //截取光标左边的所有字符
            var lastIndex = leftStr.lastIndexOf('#'); //获取光标左边字符最后一个#字符的位置
            var isInsert = inputPos[1] != val.length;
            var insertChar = function(input) {
                input += ' ';
                val = val.substr(0, lastIndex + 1) + input + val.substr(inputPos[1], val.length);
                jqTextarea.val(val);
                jqTextarea.focus();
                if (isInsert) {
                    Util.Input.moveCur(textareaElem, parseInt(inputPos[0]) + (input).length);
                } else {
                    Util.Input.moveCur(textareaElem, val.length);
                }
                hintWrapper.remove();
            };
            var q = leftStr.slice(lastIndex + 1, leftStr.length); //获取#与光标位置直接的字符

            if (lastIndex < 0) {
                hintWrapper.remove();
                return;
            }

            if ($.trim(q).length != q.length || q.indexOf('@') >= 0 || q.indexOf(' ') >= 0) {
                hintWrapper.remove();
                return;
            }

            if (hintWrapper.size() && hintWrapper.attr('rel') === q) {
                self.setPosition(jqTextarea, hintWrapper);
                return;
            }
            else {
                hintWrapper.remove();
            }

            hintWrapper = $('<div id="input_calendar_wrapper" rel="' + q + '"></div>');
            $('body').append(hintWrapper);
			$("#input_calendar_wrapper").css({left:"30px",top:jqTextarea.offset().top - hintWrapper.outerHeight()+15+"px"});
            hintWrapper.mousedown(function(e) {
                e.stopPropagation();
            });
            hintWrapper.datepicker({
                autoclose:true,
                startDate:Util.Date.format(new Date(),'yyyy-MM-dd'),
                orientation:'bottom middle',
                language:'zh-CN',
                format:'yyyy-mm-dd'
            })
            .on('changeDate', function(e){
                    insertChar(Util.Date.format(e.date,'yyyy-MM-dd'));
                });;
            hintWrapper.show(1, function(){
                self.setPosition(jqTextarea, $(this));

            });


        },
        // 设置位置
        setPosition: function(jqTextarea, hintWrapper){
            var position = Util.Input.getInputPositon(jqTextarea[0]);
			/*if(jqTextarea.val().slice(jqTextarea.val().length - 1) === "@"){
            hintWrapper.css({
                left: 10,
                top: jqTextarea.offset().top - hintWrapper.height()-5
            });
	        }
			else if(jqTextarea.val().slice(jqTextarea.val().length - 1) === "#"){
			   hintWrapper.css({
                left: 30,
                top: jqTextarea.offset().top - hintWrapper.height()-5
            });
			 }
			else{
			 $('#input_list_wrapper').remove();
             $('#input_calendar_wrapper').remove();
			 //是#
			  if(hintWrapper.offset().left+hintWrapper.get(0).offsetWidth >= jqTextarea.width() )
			   alert(hintWrapper.offset().left);
			}*/
            if ((hintWrapper.outerHeight() + hintWrapper.offset().top) > $(window).height()) {
                hintWrapper.css({
                    'top': hintWrapper.position().top - hintWrapper.outerHeight() - 20
                });
            }
        },
        begin: function(jqTextarea, jqData) {
		    
            var self = this;
            //支持@
            var timer;
            jqTextarea.focus(function() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function() {
                    if (jqData) {
					    
                        self.checkAt(jqTextarea, jqData);
                    }
                    self.checkPound(jqTextarea,jqData);
                }, 200);
            }).blur(function(e) {
                if (timer) {
                    clearInterval(timer);
                }
            }).mousedown(function(e) {
                e.stopPropagation();
            });

            //
            $('body').bind('mousedown', function() {
                if (timer) {
                    clearInterval(timer);
                    $('#input_list_wrapper').remove();
                    $('#input_calendar_wrapper').remove();
                }
            });
        },
        //点击@,@all,#
		 inputs:"",
        bindBtns: function(jqTextarea, jqBtns) {
            $('[data-input]', jqBtns).click(function() {
                var input = $(this).data('input');
                if (!input || !input.length) {
                    return;
                }
				this.inputs = input;
                var val = jqTextarea.val();
                var input_pos = Util.Input.getCurSor(jqTextarea[0]).split('|');
                var is_insert = input_pos[1] != val.length ? 1 : 0;
                var l = val.substr(0, input_pos[0]);
                var r = val.substr(input_pos[1], val.length);
                val = l + input + r;
                jqTextarea.val(val);
                if (is_insert) {
                    Util.Input.moveCur(jqTextarea[0], parseInt(input_pos[0]) + (input).length);
                } else {
                    Util.Input.moveCur(jqTextarea[0], val.length);
                }
                return;
            });
        }
    };

    $.fn.inputTip = function(jqData, jqBtns) {
        var jqTextarea = $(this);
        $.inputTip.init(jqTextarea, jqData, jqBtns);
    };
})(jQuery);

/**
 * 使用自定checkbox替代
 */
(function($) {
    $.checkBox = {
        defaults: {
            classes: 'jq_checkbox', //样式名
            event: true, //是否使用默认点击事件
            active: false, //选中后的回调
            cancel: false, //取消点击后的回调
            tmpl: '<a href="javascript:;"></a>' //模板
        },
        init: function(doms, options){
            this.options = $.extend({}, this.defaults, options);
            this.replace(doms);
        },
        replace: function(doms){
            var self = this,
                ops = self.options;
            var checkbox = $(ops.tmpl).addClass(ops.classes).attr('checkbox', ops.classes);
            doms.each(function(){
                var newCheckbox = checkbox.clone();
                newCheckbox.addClass($(this).attr('class'));
                if($(this).is('[disabled]')){
                    newCheckbox.addClass(ops.classes + '_disabled');
                }else{
                    ops.event && self.bindEvent($(this), newCheckbox);
                }
                if($(this).is(':checked')){
                    newCheckbox.addClass(ops.classes + '_active')
                }
                if($(this).next('[checkbox]')){
                    $(this).next('[checkbox]').remove();
                }
                $(this).hide().after(newCheckbox);
            });
        },
        bindEvent: function(checkbox, newCheckbox){
            var self = this,
                ops = self.options;
            newCheckbox.hover(function(){
                $(this).addClass(ops.classes + '_hover');
            },function(){
                $(this).removeClass(ops.classes + '_hover');
            });
            newCheckbox.on('click', function(){
                if(!$(this).parents('label').size() || $(this).is('a')){
                    if($(this).hasClass(ops.classes + '_active') || $(this).hasClass(ops.classes + '_half')){
                        self.setAct('cancel', checkbox, ops.cancel);
                    }else{
                        self.setAct('active', checkbox, ops.active);
                    }
                }
            });
            checkbox.on('click', function(){
                if($(this).is(':checked')){
                    self.setAct('active', $(this), ops.active);
                }else{
                    self.setAct('cancel', $(this), ops.cancel);
                }
            });
        },
        setAct: function(act, doms, callback){
            if($.inArray(act, ['active','cancel','half']) < 0){
                return;
            }
            doms.each(function(){
                if($(this).is('[disabled]')){
                    return;
                }
                var newCheckbox = $(this).next('[checkbox]'),
                    classes = newCheckbox.attr('checkbox');
                if(newCheckbox.length && !newCheckbox.hasClass(classes + '_disabled')){
                    switch(act){
                        case 'active':
                            this.checked = true;
                            newCheckbox.removeClass(classes + '_half').addClass(classes + '_active');
                            break;
                        case 'cancel':
                            this.checked = false;
                            newCheckbox.removeClass(classes + '_active').removeClass(classes + '_half');
                            break;
                        case 'half':
                            this.checked = true;
                            newCheckbox.removeClass(classes + '_active').addClass(classes + '_half');
                            break;
                        default :
                    }
                    $.isFunction(callback) && callback($(this), newCheckbox);
                }
            });
        }
    };

    $.fn.checkBox = function(options, callback){
        if($.type(options) === 'string'){
            $.checkBox.setAct(options, $(this), callback)
            return;
        }
        $.extend({}, $.checkBox).init($(this), options);
    };
})(jQuery);

(function($) {
    $.fn.translate = function() {
        return this.each(function() {
            var locale = $(this).data('locale');
            if(locale){
                $(this).html(L(locale));
            };
        });
    };
})(jQuery);