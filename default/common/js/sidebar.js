var gkClientSidebar = {
    FILE_SORTS: {
        'SORT_SPEC': ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'],
        'SORT_MOVIE': ['mp4', 'mkv', 'rm', 'rmvb', 'avi', '3gp', 'flv', 'wmv', 'asf', 'mpeg', 'mpg', 'mov', 'ts', 'm4v'],
        'SORT_MUSIC': ['mp3', 'wma', 'wav', 'flac', 'ape', 'ogg', 'aac', 'm4a'],
        'SORT_IMAGE': ['jpg', 'png', 'jpeg', 'gif', 'psd'],
        'SORT_DOCUMENT': ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'odt', 'rtf', 'ods', 'csv', 'odp', 'txt'],
        'SORT_CODE': ['js', 'c', 'cpp', 'h', 'cs', 'vb', 'vbs', 'java', 'sql', 'ruby', 'php', 'asp', 'aspx', 'html', 'htm', 'py', 'jsp', 'pl', 'rb', 'm', 'css', 'go', 'xml', 'erl', 'lua', 'md'],
        'SORT_ZIP': ['rar', 'zip', '7z', 'cab', 'tar', 'gz', 'iso'],
        'SORT_EXE': ['exe', 'bat', 'com']
    },
    shareMembers: [],
    selectTabIndex: 2,
    init: function () {
        var _context = this;
        localStorage.clear();
        initWebHref();
        $('body').tooltip({
            selector: '.gktooltip'
        });
        _context.fetchAccountInfo();
        $(".logo").click(function () {
            gkClientInterface.launchpad();
        })
        //在线帮助
        $(".header_help").click(function () {
            var param = {
                url: '/client/feedback',
                sso: 1,
                resize: 1,
                width: 800,
                height: 600
            };

            gkClientInterface.openWindow(param);

        })

        //访问网页版
        $(".header_website").click(function () {
            var param = {
                url: '/storage',
                sso: 1
            };
            gkClientInterface.openURL(param);
        })

    },
    clearConfiect: function (arr) {
        var i, results = [], len = arr.length, username = gkClientInterface.getUserInfo().username;
        for (i = 0; i < len; i++) {

            if (arr[i].hasOwnProperty("username") && arr[i]["username"] != username) {
                results.push(arr[i]);
            }

        }
        return results;
    },
    bindShares: function (shares) {
        $(".textarea_wrapper").inputTip(this.clearConfiect(shares), $(".at_and_task"));

        /*$('body').tooltip({
         selector: '.gktooltip'
         });*/
        /*$(".textarea_wrapper").live("keydown",function(e){
         var _this = $(this),_flag = false;
         var _time = setTimeout(function(){
         _flag = (e.keyCode == 16) ? true : false;
         if(_this.val().charAt(_this.val().length - 1) == "@" && !_flag){
         $(".select-shares").remove();
         $("#ks").remove();
         // $(".post_wrapper").append($("<span id='ks' style='position:absolute;left:-9999px;top:0'>"+_this.val()+"</span>"));
         var _x =  $("#ks").width() + 16;
         var _y = 32;
         $("#selectShares").tmpl({x:_x,y:_y,shares:shares}).appendTo($(".post_wrapper"));
         $(".select-shares>div").click(function(){
         $(".textarea_wrapper").val($(".textarea_wrapper").val()+$(this).html());
         $(".select-shares").remove();
         })




         }
         clearTimeout(_time);
         },1);

         });*/
    },
    fetchAccountInfo: function (type) {
        var account = gkClientInterface.getUserInfo();
        var data = {
            username: account.username,
            org_name: account.org_name,
            photourl: account.photourl,
            used_size: Util.Number.bitSize($.trim(account.size)),
            capacity: Util.Number.bitSize($.trim(account.capacity)),
            org_used_size: Util.Number.bitSize($.trim(account.org_size)),
            org_capacity: Util.Number.bitSize($.trim(account.org_capacity))
        };
        var account_info = $('#accountInfoTmpl').tmpl(data).appendTo($('#header'));
        if (type == 2) {
            account_info.find('.org_info').show();
        } else {
            account_info.find('.user_info').show();
        }

    },
    fetchShareMembers: function (share_members) {
        var _context = this;

        this.shareMembers = share_members;
        var slideItemShare = $('.tab_content_share');
        slideItemShare.empty();
        var shareMemberList = $('#shareMembersTmpl').tmpl({
            share_members: share_members
        }).appendTo(slideItemShare);
        $('.at').click(function () {
            var item = $(this).parents('li');
            var username = $.trim(item.find('.member_name').text());
            var params = {
                url: '/client/client_file_detail?fullpath=' + encodeURIComponent(PAGE_CONFIG.path) + '&tab=dynamic&client=1&defaulttext=@' + username + '',
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
            return;
        });

        //管理共享
        $('.manage_share').click(function () {
            var params = {
                url: '/client/client_file_detail?tab=share&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        });
        //高级模式
        $(".gjmodel").click(function () {

            var params = {
                url: '/client/client_file_detail?tab=link&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        })

    },
    getLinkKeyAndTipByAuth: function (auth) {

        var re = {};
        switch (auth) {
            case '1000':
                re = {
                    tip: '允许访问者预览',
                    key: 'preview'
                }
                break;
            case '1011':
                re = {
                    tip: '允许访问者预览、下载',
                    key: 'download'
                }
                break;
            case '1111':
                re = {
                    tip: '允许访问者预览、下载、上传',
                    key: 'cooperate'
                }
                break;
            case '0100':
                re = {
                    tip: '只允许访问者上传',
                    key: 'unknownUpload'
                }

                break;
        }
        return re;
    },
    fetchLink: function (publish) {
        var _context = this;
        var tab_content_wrapper = $('.tab_content_link');
        tab_content_wrapper.find(".select_wrapper").remove();
        if (publish.isclosed == 1) {
            tab_content_wrapper.append('<div class="empty">链接分享功能已关闭</div>');
            tab_content_wrapper.find('.open_link_share').click(function () {
                var params = {
                    url: '/client/client_file_detail?tab=link&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                    sso: 1,
                    resize: 0,
                    width: 800,
                    height: 600
                };
                gkClientInterface.openWindow(params);
            });
        } else {

            var link_type = publish.link_type,
                modes = [],
                mode = null;

            $.each(link_type, function (i, n) {
                var re = _context.getLinkKeyAndTipByAuth(n.value);
                mode = {
                    name: n.name,
                    tip: (link_type.length < 4) ? re.tip.replace('上传', '更新') : re.tip,
                    auth: n.value,
                    key: re.key
                };

                modes.push(mode);
            })

            var selectWrp = $('#linkModeTmpl').tmpl({
                modes: modes
            }).prependTo(tab_content_wrapper);
            selectWrp.find('.dropdown_menu').on('click', 'a', function () {

                var btn = selectWrp.children('a:first');
                $(this).addClass('only').find(".select_name").css('color', '#FFF').siblings(".select_tip").css("color", "#FFF").parent().siblings('div').find('i').css('background-position-x', '-32px');
                $('.dropdown_menu').find('a').not($(this)).removeClass('only').find('.select_name').css('color', '#606D7F').siblings(".select_tip").css("color", "#ACB4BF").parent().siblings('div').find('i').css('background-position-x', '0');
                var cloneBtn = $(this).clone();

                if (btn.size()) {
                    selectWrp.find('a:first').replaceWith(cloneBtn.addClass('only'));
                    cloneBtn.find(".select_name").css('color', '#FFF').siblings(".select_tip").css("color", "#FFF").parent().siblings('div').find('i').css('background-position-x', '-32px');

                } else {
                    selectWrp.prepend(cloneBtn.addClass('only'));
                    cloneBtn.find(".select_name").css("color", "#FFF").siblings(".select_tip").css("color", "#FFF").parent().siblings('div').find('i').css('background-position-x', '-32px');
                }

                if ($(this).parents('ul').children().size() > 1) {
                    cloneBtn.append('<s></s>');
                    cloneBtn.droplist({
                        onClose: function (btn) {
                            selectWrp.children('a:first').removeClass('active');
                        }
                    });

                }
                $(this).hide();
                selectWrp.find('ul a').show();
            });

            selectWrp.find('.dropdown_menu a:first').trigger('click');

            $('.share_types li a').click(function () {

                var _self = $(this);
                var auth = $('.select_wrapper .btn').data('auth');
                var exitLink = _context.getLocalLink(PAGE_CONFIG.path, auth);
                var dir = 0;
                if (Util.String.lastChar(PAGE_CONFIG.path) === '/') {
                    dir = 1;
                }
                var filename = Util.String.baseName(Util.String.rtrim(PAGE_CONFIG.path, '/'));
                var content = '我通过 @够快科技 共享了文件' + (dir ? '夹' : '') + ' "' + filename + '"';
                var callback = function (url) {
                    if (_self.hasClass('link_browser')) {
                        gkClientInterface.openURL({
                            url: url,
                            sso: 1
                        });
                    } else if (_self.hasClass('link_clipboard')) {
                        gkClientInterface.setClipboardData(url);
                        alert('已复制到剪切板');
                    } else if (_self.hasClass('link_sina')) {
                        _context.shareToWeibo('sina', content, url);
                    } else if (_self.hasClass('link_qq')) {
                        _context.shareToWeibo('qq', content, url);
                    } else if (_self.hasClass('link_mail')) {
						var subject = '链接共享';
						var content = '您的朋友 ' + PAGE_CONFIG.membername + ' 通过够快和你分享了一个文件\n\n点击下面链接查看\n' + url;
						gkClientInterface.mailTo('', subject, content);
                    }
                };
                var params = {
                    token: gkClientInterface.getToken(),
                    fullpath: PAGE_CONFIG.path,
                    auth: auth
                };
                if (exitLink) {
                    params.code = exitLink;
                }
                $.ajax({
                    url: gkClientInterface.getApiDomain() + '/link_publish',
                    data: params,
                    type: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        var url = data.link, code = data.code;
                        callback(url);
                        _context.setLocalLink(PAGE_CONFIG.path, auth, code);
                    },
                    error: function (request, textStatus, errorThrown) {
                        var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                        alert(errorMsg);
                    }
                });
            });
        }
    },
    getOptClassesByFileInfo:function(ac,file){
        var classes = 'gktooltip '+ac;
        if(file.state<=1 || file.state>=6){
            classes+=' disabled';
            if(ac === 'force_to_lock' || ac === 'finish_edit' ){
                classes+=' hide';
            }
        }else{
            switch(ac){
                case 'lock_to_edit':
                    if(file.is_share==1 && file.dir==0 && file.auth>0 && (file.state ==2 ||  file.state ==4)){

                    }else{
                        if(file.state==3 ||file.state==5){
                            classes+=' hide';
                        }else{
                            classes+=' disabled';
                        }

                    }
                    break;
                case 'force_to_lock':
                    if(file.is_share==1 && file.dir==0 && file.auth>0 && file.state ==3){

                    }else{
                        classes+=' disabled hide';
                    }
                    break;
                case 'finish_edit':
                    if(file.is_share==1 && file.dir==0 && file.auth>0 && file.state ==5){

                    }else{
                        classes+=' disabled hide';
                    }
                    break;
                case 'archive':
                    if(typeof PAGE_CONFIG !=='undefined' && PAGE_CONFIG.orgId>0){
                        if(PAGE_CONFIG.type==1){

                        }else{
                            classes+=' disabled';
                        }
                    }else{
                        classes+=' hide';
                    }

                    break;
                case 'add_keywords':
                    break;
                case 'smart_folder':
                    if(typeof PAGE_CONFIG !=='undefined'){
                        if(file.dir==1){

                        }else{
                            classes+=' disabled';
                        }
                    }else{
                        classes+=' hide';
                    }
                    break;
        }
        }
        return classes;
    },
    fetchFileHeader: function (localData) {
        var _context = this;
        var header = $('#header');
        header.find('.file_info_wrapper').remove();

        var show_timer = null,hide_timer;
        var hideWrapper = function(fileDescWrapper){
            if(show_timer){
                clearTimeout(show_timer);
            }
            if(fileDescWrapper.size()){
                hide_timer = setTimeout(function(){
                    fileDescWrapper.remove();
                },200);
            }
        }
        var opts = [
            {
                classes:_context.getOptClassesByFileInfo('lock_to_edit',localData),
                title:'独占修改',
                events:{
                    click:function(){
                        var path = PAGE_CONFIG.path;
                        if (!path.length) {
                            return;
                        }
                        var params = {
                            url: '/client/file_edit?ac=lock&fullpath=' + encodeURIComponent(path),
                            sso: 1,
                            resize: 0,
                            width: 490,
                            height: 175
                        };
                        gkClientInterface.openSingleWindow(params);
                    }
                }

            },
            {
                classes:_context.getOptClassesByFileInfo('force_to_lock',localData),
                title:'强制独占',
                events:{
                    click:function(){
                        var path = PAGE_CONFIG.path;
                        if (!path.length) {
                            return;
                        }
                        var params = {
                            url: '/client/file_edit?ac=lock&fullpath=' + encodeURIComponent(path),
                            sso: 1,
                            resize: 0,
                            width: 490,
                            height: 175
                        };
                        gkClientInterface.openSingleWindow(params);
                    }
                }

            },
            {
                classes:_context.getOptClassesByFileInfo('finish_edit',localData),
                title:'取消独占',
                events:{

                    click:function(){
                        var path = PAGE_CONFIG.path;
                        if (!path.length) {
                            return;
                        }
                        var params = {
                            url: '/client/file_edit?ac=transfer&fullpath=' + encodeURIComponent(path),
                            sso: 1,
                            resize: 0,
                            width: 490,
                            height: 230
                        };
                        gkClientInterface.openSingleWindow(params);
                    }
                }
            },
            {
                classes:_context.getOptClassesByFileInfo('archive',localData),
                title:'归档到团队的文件',
                events:{
                    click:function(){
                        var path = PAGE_CONFIG.path;
                        if (!path.length) {
                            return;
                        }
                        var params = {
                            url: '/client/archive?fullpath=' + encodeURIComponent(path),
                            sso: 1,
                            resize: 0,
                            width: 450,
                            height: 420
                        };
                        gkClientInterface.openSingleWindow(params);
                    }
                }

            },
            {
                classes:_context.getOptClassesByFileInfo('add_keywords',localData),
                title:'添加注释',
                events:{
                    mouseenter:function(){
                        var _self = $(this);
                        if(hide_timer){
                            clearTimeout(hide_timer);
                        }
                        show_timer = setTimeout(function(){
                            if($('.file_desc_wrapper').size()){
                                return;
                            }
                            var fileDescWrapperHtml = '<div class="file_desc_wrapper">';
                            fileDescWrapperHtml+='<div class="file_desc_content"><div class="loading empty">正在加载...</div></div>';
                            fileDescWrapperHtml+='<s class="arrow"><em></em></s>';
                            fileDescWrapperHtml+='</div>';
                            var fileDescWrapper = $(fileDescWrapperHtml);
                            fileDescWrapper.appendTo($('body'));
                            var offset = _self.offset();
                            var cWidth = document.documentElement.clientWidth||document.body.clientWidth;
                            var top  = offset.top +  _self.outerHeight()+10,
                                left = (cWidth - fileDescWrapper.outerWidth())*0.5;
                            fileDescWrapper.css({
                                'top':top,
                                'left':left
                            })
                            fileDescWrapper.on({
                                mouseenter:function(){
                                    if(hide_timer){
                                        clearTimeout(hide_timer);
                                    }
                                },
                                mouseleave:function(){
                                    hideWrapper(fileDescWrapper);
                                }
                            })
                            gkRest.getFileInfo(PAGE_CONFIG.mountId, PAGE_CONFIG.path, '', function (reData) {
                                var tag = reData.tag || '';
                                if(!tag){
                                    fileDescWrapper.find('.file_desc_content').html('<div class="empty">没有注释</div>');
                                }else{
                                    fileDescWrapper.find('.file_desc_content').html(tag);
                                }

                                var arrow = fileDescWrapper.find('.arrow');
                                arrow.css({
                                    'left':offset.left-fileDescWrapper.offset().left+(_self.outerWidth()-arrow.outerWidth())*0.5
                                });
                            },function(){
                                fileDescWrapper.find('.loading').remove();
                            });
                        },400)
                    },
                    mouseleave:function(){
                        hideWrapper($('.file_desc_wrapper'));
                    },
                    click:function(){
                        var params = {
                            url: '/client/add_keywords?fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                            sso: 1,
                            resize: 0,
                            width: 380,
                            height: 230
                        };
                        gkClientInterface.openWindow(params);
                    }
                }
            },
            {
                classes:_context.getOptClassesByFileInfo('smart_folder',localData),
                title:'创建智能文件夹',
                events:{
                    click:function(){
                        var path = PAGE_CONFIG.path;
                        var fullpath = path+ '/';
                        var keyword = '';
                        var condition = {'include': {}, 'exclude': {}};
                        keyword && (condition.include.keywords = keyword);
                        path && (condition.include.path = fullpath);
                        var params = {
                            token: gkClientInterface.getToken(),
                            fullpath: fullpath,
                            auth: '1011',
                            type: 6,
                            condition: condition
                        };
                        condition.include.org_share = 0;
                        if( PAGE_CONFIG.type==2){
                            condition.include.org_share = 1;
                        }

                        $.ajax({
                            url: gkClientInterface.getApiDomain() + '/link_publish',
                            data: params,
                            type: 'POST',
                            dataType: 'json',
                            success: function (data) {
                                console.log(data);
                                if(!data || !data.link) return;
                                var params = {
                                    url:  data.link,
                                    sso: 1,
                                    resize: 0,
                                    width: 1000,
                                    height: 600
                                };
                                console.log(params);
                                gkClientInterface.openWindow(params);
                            },
                            error: function (request, textStatus, errorThrown) {
                                var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                                alert(errorMsg);
                            }
                        });

                    }
                }

            }
        ];

        localData.opts = opts;
        //判断是否出现版本
        var fileInfoWrapper = $('#fileInfoTmpl').tmpl(localData).appendTo(header);
        fileInfoWrapper.show();

        $('.opts button').each(function(){
            var index = $(this).index();
            var events = opts[index].events;
            if(events){
                $(this).on(events);
            }
        });

        //收藏，取消收藏
        fileInfoWrapper.find('.favorite').click(function () {
            var _self = $(this);
            if (_self.hasClass('loading')) {
                return;
            }

            _self.addClass('loading');
            if (_self.hasClass('on')) {
                gkRest.removeFileFromFav(PAGE_CONFIG.mountId, PAGE_CONFIG.path, function () {
                    _self.removeClass('loading on');
                }, function () {
                    _self.addClass('loading');
                });
            } else {
                gkRest.addFileToFav(PAGE_CONFIG.mountId, PAGE_CONFIG.path, function () {
                    _self.removeClass('loading').addClass('on');
                }, function () {
                    _self.removeClass('loading');
                });
            }
            _context.removeLocalData(PAGE_CONFIG.path);
            return;
        });

        //历史版本
        fileInfoWrapper.find('.version').click(function () {
            var params = {
                url: '/client/client_file_detail?tab=dynamic&select=history&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        });


    },
    fetchFileInfo: function (file) {
        var _context = this;
        var dir = 0, filename, fullpath;
        if (Util.String.lastChar(file.fullpath) === '/') {
            dir = 1;
        }
        fullpath = Util.String.rtrim(file.fullpath, '/');
        filename = Util.String.baseName(fullpath);
        var icon = 'icon_64_' + _context.getFileIconSuffix(filename, dir, file.share, file.local);
        var data = {
            icon: icon,
            filename: filename,
            dir: dir,
            state: file.state,
            last_member_name:file.last_member_name,
            last_member_id: file.last_member_id,
            favorite: 0,
            last_datetime: '',
            dateline: 0,
            is_share: 0,
            index: 0,
            auth: 0
        };
        var localData = _context.getLocalData(file.fullpath) || {};
        if (localData) {
            $.extend(data, localData);
        }
        var exprired = 15 * 1000; //15秒
        //var exprired =0;
        _context.fetchFileHeader(data);
        var clearCache = !localData || !localData.dateline || (new Date().getTime() - localData.dateline > exprired);
        if (clearCache) {
            gkRest.getFileInfo(PAGE_CONFIG.mountId, file.fullpath, '', function (reData) {
                var newData = {
                    favorite: reData.favorite,
                    last_datetime: reData.last_datetime,
                    is_share: reData.share,
                    auth: reData.auth,
                    icon: 'icon_64_' + _context.getFileIconSuffix(filename, dir, reData.share, file.local),
                    index: reData.index || 0,
                    last_member_name: reData.last_member_name
                };
                $.extend(localData, newData);
                $.extend(data, localData);
                _context.fetchFileHeader(data);
                _context.setLocalData(file.fullpath, localData);
            });
        }
    },
    getLocalData: function (fullpath) {
        var localData = localStorage.getItem(fullpath);
        return JSON.parse(localData);
    },
    setLocalData: function (fullpath, data) {
        data.dateline = new Date().getTime()
        var JSONDate = JSON.stringify(data);
        return localStorage.setItem(fullpath, JSONDate);
    },
    removeLocalData: function (fullpath) {
        return localStorage.removeItem(fullpath);
    },
    fetchHeader: function () {
        var _context = this;
        var header = $('#header');
        header.find('>div').not('.header_nav').remove();
        if (!PAGE_CONFIG.path) {
            if (PAGE_CONFIG.type == 0) {
                _context.fetchAccountInfo(PAGE_CONFIG.type);
            } else if (PAGE_CONFIG.type == 1) { //我的文件
                _context.fetchAccountInfo(PAGE_CONFIG.type);
            } else if (PAGE_CONFIG.type == 2) { //团队文件
                _context.fetchAccountInfo(PAGE_CONFIG.type);
            } else if (PAGE_CONFIG.type == 3) { //总根目录

            }
        } else {

            var file = {
                fullpath: PAGE_CONFIG.path,
                state: PAGE_CONFIG.state,
                last_member_name: PAGE_CONFIG.last_member_name,
                local: PAGE_CONFIG.local,
                share: PAGE_CONFIG.isshare
            }
            gkClientSidebar.fetchFileInfo(file);
        }
    },
    getFileIconSuffix: function (filename, dir, share, local) {
        var suffix = '';
        var sorts = this.FILE_SORTS;
        if (dir) {
            suffix = 'folder';
            if (share > 0) {
                if (local == 1) {
                    suffix = 'local_' + suffix;
                } else if (local == 2) {
                    suffix = 'private_' + suffix;
                } else {
                    suffix = 'shared_' + suffix;
                }
            }
        } else {
            var ext = Util.String.getExt(filename);
            if ($.inArray(ext, sorts['SORT_MOVIE']) > -1) {
                suffix = 'movie';
            } else if ($.inArray(ext, sorts['SORT_MUSIC']) > -1) {
                suffix = 'music';
            } else if ($.inArray(ext, sorts['SORT_IMAGE']) > -1) {
                suffix = 'image';
            } else if ($.inArray(ext, sorts['SORT_DOCUMENT']) > -1) {
                suffix = 'document';
            } else if ($.inArray(ext, sorts['SORT_ZIP']) > -1) {
                suffix = 'compress';
            } else if ($.inArray(ext, sorts['SORT_EXE']) > -1) {
                suffix = 'execute';
            } else {
                suffix = 'other';
            }
            if ($.inArray(ext, sorts['SORT_SPEC']) > -1) {
                suffix += ' icon_64_' + ext;
            }
        }
        return suffix;
    },
    shareToWeibo: function (from, title, href) {
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
            url += $.param(params);
            gkClientInterface.openURL({
                url: url,
                sso: 0
            })
        }
    },
    getFileMain: function (fullpath, tab) {
        tab = tab === undefined ? '' : tab;
        var _context = this;
        var params = {
            fullpath: PAGE_CONFIG.path,
            token: gkClientInterface.getToken(),
            type: tab
        };
        var dateline = localStorage.getItem('cache_' + PAGE_CONFIG.path);
        if (tab || dateline) {
            dateline = dateline || new Date().getTime();
            params['_'] = dateline;
        } else {
            var loading = $('<div class="loader" style="position: absolute;left:0;right:0;color:#aaa;top:50%;text-align: center;margin-top: -9px">正在加载...</div>');
            $('.tab_content_wrapper > div').append(loading);
        }
        var _this = this;
        $.ajax(
            {
                url: gkClientInterface.getApiDomain() + '/client_sidebar',
                data: params,
                dataType: 'json',
                success: function (data) {
                    $('.tab_content_wrapper > div .loader').remove();
                    if (!data) {
                        return;
                    }
                    if (!tab || tab == 'share') {

                        var share_members = data.share_members;
                        gkClientSidebar.fetchShareMembers(share_members);
                        //textarea绑定共享人
                        //_this.bindShares(share_members);
                    }

                    if (!tab || tab == 'link') {
                        var publish = data.publish;
                        gkClientSidebar.fetchLink(publish);
                    }
                    if (!tab || tab == 'history') {
                        var remarks = data.history;
                        $.each(remarks, function (k, v) {
                            v['version'] = v['property']['index'];
                        })
                        _context.fetchRemark(remarks);
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    $('.tab_content_wrapper > div .loader').remove();
                    var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                    $('.file_info_wrapper').remove();
                    $('#main').html('<div class="empty">' + errorMsg + '</div>');
                }
            }
        );
    },
    fetchFileMain: function () {
        $('#input_list_wrapper').remove();
        $('#input_calendar_wrapper').remove();
        var _context = this;
        var main = $('#main');
        main.empty();
        if (PAGE_CONFIG.state > 1 && PAGE_CONFIG.state < 6) {
            var _this = this;
            var fileMainTmpl = $('#fileMainTmpl').tmpl().appendTo(main);

            $('.tab_list li').click(function () {
                $(".select-shares").remove();
                $(".textarea_wrapper").val("");
                _this.selectTabIndex = $(this).index();
                var target = $(this).data('target');
                var tab_content_wrapper = $('.tab_content_wrapper');
                var tab_content = tab_content_wrapper.find('>div');
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');
                tab_content.hide();
                tab_content_wrapper.find('.' + target).show();
            });

            _context.getFileMain(PAGE_CONFIG.path);


            $('.tab_list li').eq(_this.selectTabIndex).trigger('click');
        }

    },
    getLocalLink: function (fullpath, auth) {
        var links = localStorage.getItem('gk_links');
        if (!links) {
            return ''
        }
        links = JSON.parse(links);
        var key = fullpath + '_' + auth;
        if (!links[key]) {
            return ''
        }
        var link = links[key];
        var expire_time = 2 * 3600 * 1000;
        if (new Date().getTime() - parseInt(link['dateline']) > expire_time) {
            links[key] = undefined;
            localStorage.setItem('gk_links', JSON.stringify(links));
            return ''
        }
        return link['url'];
    },
    setLocalLink: function (fullpath, auth, url) {
        var oldLinks = localStorage.getItem('gk_links');
        var links = {};
        if (oldLinks) {
            links = JSON.parse(oldLinks);
        }
        var key = fullpath + '_' + auth;
        links[key] = {
            dateline: new Date().getTime(),
            url: url
        };
        localStorage.setItem('gk_links', JSON.stringify(links));
    },
    fetchRemark: function (remarks) {
        var _context = this;
        var slideItemShare = $('.tab_content_remark');
        slideItemShare.empty();
        var old_remark = localStorage.getItem('remark_' + PAGE_CONFIG.path);

        var remarkList = $('#remarkListTmpl').tmpl({
            remarks: remarks,
            old_remark: old_remark ? old_remark : '',
            Show: (this.shareMembers.length > 1) ? 'is' : ''

        }).appendTo(slideItemShare);
        this.bindShares(this.shareMembers);
        $('textarea#post_value').blur(function () {
            var val = $.trim($(this).val());
            localStorage.setItem('remark_' + PAGE_CONFIG.path, val);
        });
        $('a[usercard]').click(function () {
            var u = $(this).attr('usercard');
            if (u != 'id=' + PAGE_CONFIG.memberId) {
                var a = $.trim($(this).text()).replace('@', '');
                $('textarea#post_value').focus();
                $('textarea#post_value').val('@' + a + ' ');
            }
            return;
        });
        $('.post_now').click(function () {
            var _self = $(this);
            if (_self.hasClass('disabled')) {
                return;
            }
            var text = $('textarea#post_value').val();
            if (!text) {
                alert('内容不能为空');
            }
            var oldText = _self.text();
            _self.removeClass('.blue_btn').addClass('disabled');
            gkRest.fileRemind(PAGE_CONFIG.mountId, PAGE_CONFIG.path, text, function (data) {
                _self.removeClass('disabled').addClass('blue_btn');
                if (data) {

                    var remarkItem = $('#remarkListTmpl').tmpl({
                        remarks: data,
                        isItem: true
                    })
                    var remarkListWrapper = slideItemShare.find('.remark_list');
                    remarkListWrapper.find('.empty').remove();
                    remarkListWrapper.prepend(remarkItem);
                    remarkItem.hide();
                    remarkItem.fadeIn();
                    localStorage.setItem('cache_' + PAGE_CONFIG.path, new Date().getTime());


                }
                $('textarea#post_value').val('');
                localStorage.removeItem('remark_' + PAGE_CONFIG.path);

            }, function () {
                _self.removeClass('disabled').addClass('blue_btn');
            });
        });

        $('textarea#post_value').on('keydown',function(e){
            if (e.keyCode == 13) {
                $('.post_now').trigger('click');
                return false;
            }
        })

        //历史版本
        slideItemShare.find('.version').click(function () {
            var item = $(this).parents('li');
            var fullpath = item.data('fullpath');
            var params = {
                url: '/client/client_file_detail?tab=dynamic&select=history&fullpath=' + encodeURIComponent(fullpath),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        });
    },
    fetchMain: function () {
        var _context = this;
        var main = $('#main');
        if (!PAGE_CONFIG.path) {
            var links = [], tip = '';
            links = [
                {
                    key: '',
                    url: '/storage',
                    sso: 1,
                    name: '在网页上查看文件'
                },
                {
                    key: '',
                    url: 'javascript:gkClientInterface.selectSyncFile()',
                    sso: 0,
                    name: '选择性同步'
                },
                {
                    key: '',
                    url: 'javascript:gkClientInterface.getShowTrans()',
                    sso: 1,
                    name: '传输列表'
                },
                {
                    key: '',
                    url: 'javascript:gkClientInterface.getShowSettings()',
                    sso: 1,
                    name: '软件设置'
                },
                {
                    key: '',
                    url: 'http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzkzODA2NjEzOF8zNzIwOV80MDA2MTEwODYwXzJf',
                    sso: 1,
                    name: '在线客服'
                }
            ]
            if (PAGE_CONFIG.type == 1) {
                tip = '这里是你的个人文件夹，你可以将你的文件存放在这里，也可以跟你的朋友分享你的文件';
                links = [
                    {
                        key: '',
                        url: '/storage#!files',
                        sso: 1,
                        name: '在网页上查看个人的文件'
                    },
                    {
                        key: '',
                        url: 'javascript:gkClientInterface.selectSyncFile()',
                        sso: 0,
                        name: '选择性同步'
                    },
                    {
                        key: '',
                        url: 'http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzkzODA2NjEzOF8zNzIwOV80MDA2MTEwODYwXzJf',
                        sso: 1,
                        name: '在线客服'
                    }
                ];
            } else if (PAGE_CONFIG.type == 2) {
                tip = '这里是团队文件夹，你可以将团队的文件存在在这里，以方便与同事进行共享和协作';
                links = [
                    {
                        key: '',
                        url: '/storage#!team_files',
                        sso: 1,
                        name: '在网页上查看团队的文件'
                    },
                    {
                        key: '',
                        url: 'javascript:gkClientInterface.selectSyncFile()',
                        sso: 0,
                        name: '选择性同步'
                    },
                    {
                        url: 'javascript:gkClientInterface.openWindow({url:"/client/create_share_folder?org_share=1",sso:1,resize:0,width:400,height:140})',
                        key: '',
                        sso: 1,
                        name: "创建团队文件夹"
                    },
                    {
                        key: '',
                        url: 'http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzkzODA2NjEzOF8zNzIwOV80MDA2MTEwODYwXzJf',
                        sso: 1,
                        name: '在线客服'
                    }
                ];
                if(PAGE_CONFIG && PAGE_CONFIG.memberId && $.isNumeric(PAGE_CONFIG.memberType)  && PAGE_CONFIG.memberType<2){
                    links.push(
                        {
                            url: 'javascript:gkClientInterface.openURL({url:"/manage/dashboard",sso:1})',
                            key: '',
                            sso: 1,
                            name: "管理团队"
                        }
                    );
                }

            }
            var data = {
                type: PAGE_CONFIG.type,
                tip: tip,
                links: links
            };
            $('#input_list_wrapper').remove();
            $('#input_calendar_wrapper').remove();
            main.find('.root_content').remove();
            $('#rootMainTmpl').tmpl(data).appendTo(main);
        } else {
            _context.fetchFileMain();
        }
        _context.setMainStyle();

    },
    fetch: function () {
        var _context = this;
        _context.fetchHeader();
        _context.fetchMain();
    },
    setMainStyle: function () {
        var classes = 'main_' + PAGE_CONFIG.type;
        if (!PAGE_CONFIG.path) {
            classes += ' main_root'
        }
        $('#main').removeClass().addClass(classes);
    },
    getScreenName: function (uid, member_id, member_name) {
        if (uid == member_id) {
            return '我';
        }
        return member_name;
    },
    getToggleState: function (fullpath, dir, state) {
        var optState = -1;
        //取消独占
        if (fullpath && state == 5 && dir == 0) {
            optState = 0;
        }
        //独占修改
        else if (fullpath && state >= 2 && dir == 0) {
            optState = 1;
        }
        return optState;
    }
};

function gShellSelect(re) {
    if (re === PAGE_CONFIG.re) {
        return;
    }

    PAGE_CONFIG.re = re;
    var arr = JSON.parse(re);
    console.log('-----------file-------------');
    console.log(arr);
    arr.path = arr.webpath;
    arr.state = arr.status;
    arr.last_member_name = arr.membername;
    $.extend(PAGE_CONFIG, arr);
    gkClientSidebar.fetch();
}