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
    init: function () {
        var _context = this;
        initWebHref();
        _context.fetchAccountInfo();
        $(".header_nav").click(function () {
            gkClientInterface.launchpad();
        })
		 //独占修改
      $(".dzupdate").live("click",function(){
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
     });
	 //取消独占
     $(".nodzupdate").live("click",function(){
         var path = PAGE_CONFIG.path;
         if (!path.length) {
                return;
            }
            var params = {
                url: '/client/file_edit?ac=transfer&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 490,
                height: 175
            };
            gkClientInterface.openSingleWindow(params);  
        
    });

    },
    fetchAccountInfo: function (type) {
        var account = gkClientInterface.getUserInfo();
        var data = {
            username: account.username,
            org_name: account.org_name,
            photourl: account.photourl,
            used_size: Util.Number.bitSize(account.size),
            capacity: Util.Number.bitSize(account.capacity),
            org_used_size: Util.Number.bitSize(account.org_size),
            org_capacity: Util.Number.bitSize(account.capacity)
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
        var slideItemShare = $('.tab_content_share');
        slideItemShare.empty();
        var shareMemberList = $('#shareMembersTmpl').tmpl({
            share_members: share_members
        }).appendTo(slideItemShare);
        $('.at').click(function () {
            var item = $(this).parents('li');
            var username = $.trim(item.find('.member_name').text());
            var params = {
                url: '/client/file_remark?username=' + encodeURIComponent(username) + '&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 650,
                height: 150
            };
            gkClientInterface.openWindow(params);
            return;
        });

        //管理共享
        $('.manage_share').click(function(){
            var params = {
                url: '/client/client_file_detail?tab=share&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        });
    },
    getLinkKeyAndTipByAuth: function (auth) {
        var re = {};
        switch (auth) {
            case '1000':
                re = {
                    tip: '允许链接访问者预览',
                    key: 'preview'
                }
                break;
            case '1011':
                re = {
                    tip: '允许链接访问者预览、下载',
                    key: 'download'
                }
                break;
            case '1111':
                re = {
                    tip: '允许链接访问者预览、下载、上传',
                    key: 'cooperate'
                }
                break;
            case '0100':
                re = {
                    tip: '只允许访问者上传',
                    key: 'cooperate'
                }

                break;
        }
        return re;
    },
    fetchLink: function (publish) {
        var _context = this;
        var tab_content_wrapper = $('.tab_content_link');
        tab_content_wrapper.empty();
        if (publish.isclosed == 1) {
            tab_content_wrapper.append('<div class="empty">链接分享功能已关闭&nbsp;&nbsp; <a class="open_link_share" href="javascript:;">开启</a></div>');
            tab_content_wrapper.find('.open_link_share').click(function(){
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
                    tip: re.tip,
                    auth: n.value,
                    key: re.key
                };
                modes.push(mode);
            })

            var selectWrp = $('#linkModeTmpl').tmpl({
                modes: modes
            }).prependTo(tab_content_wrapper);

            //初始化
            selectWrp.find('.dropdown_menu').on('click', 'a', function () {
                var btn = selectWrp.children('a:first');
                var cloneBtn = $(this).clone();
                if (btn.size()) {
                    selectWrp.find('a:first').replaceWith(cloneBtn);
                } else {
                    selectWrp.prepend(cloneBtn)
                }
                cloneBtn.append('<s></s>');
                cloneBtn.droplist({
                    onClose: function (btn) {
                        selectWrp.children('a:first').removeClass('active');
                    }
                });

                selectWrp.find('ul a').show();
                $(this).hide();
            });
            selectWrp.find('.dropdown_menu a:first').trigger('click');

            $('.share_types li a').click(function () {
                var _self = $(this);
                var auth = $('.select_wrapper .btn').data('auth');
                var exitLink = _context.getLocalLink(PAGE_CONFIG.path, auth);
                var content = 'gg';
                var callback = function (url) {
                    if (_self.hasClass('link_browser')) {
                        gkClientInterface.openURL({
                            url: url,
                            sso: 0
                        });
                    } else if (_self.hasClass('link_clipboard')) {
                        gkClientInterface.setClipboardData(url);
                        alert('已复制到剪切板');
                    } else if (_self.hasClass('link_sina')) {
                        _context.shareToWeibo('sina', content, url);
                    } else if (_self.hasClass('link_qq')) {
                        _context.shareToWeibo('qq', content, url);
                    } else if (_self.hasClass('link_mail')) {
                        gkClientInterface.mailTo('',url,url)
                    }
                };
                if (!exitLink) {
                    $.ajax({
                        url: gkClientInterface.getApiDomain() + '/link_publish',
                        data: {
                            token: gkClientInterface.getToken(),
                            fullpath: PAGE_CONFIG.path,
                            auth: auth
                        },
                        type: 'POST',
                        dataType: 'json',
                        success: function (data) {
                            var url = data.link;
                            callback();
                            _context.setLocalLink(PAGE_CONFIG.path, auth, url);
                        },
                        error: function () {

                        }
                    });
                } else {
                    callback(exitLink);
                }
            });
        }
    },
    fetchFileHeader:function(localData){
       var _context = this;
       var header = $('#header');
       header.find('.file_info_wrapper').remove();
       var fileInfoWrapper = $('#fileInfoTmpl').tmpl(localData).appendTo(header);
       fileInfoWrapper.show();
       //收藏，取消收藏
       fileInfoWrapper.find('.favorite').click(function(){
           var _self = $(this);
           if(_self.hasClass('loading')){
               return;
           }
           _self.addClass('loading');
           if(_self.hasClass('on')){
               gkRest.removeFileFromFav(PAGE_CONFIG.mountId,PAGE_CONFIG.path,function(){
                   _self.removeClass('loading on');
               },function(){
                   _self.addClass('loading');
               });
           }else{
               gkRest.addFileToFav(PAGE_CONFIG.mountId,PAGE_CONFIG.path,function(){
                   _self.removeClass('loading').addClass('on');
               },function(){
                   _self.removeClass('loading');
               });
           }
           _context.removeLocalData(PAGE_CONFIG.path);
            return;
       });

       //历史版本
       fileInfoWrapper.find('.version').click(function(){
           var params = {
               url: '/client/client_file_detail?tab=dynamic&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
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
        var localData = _context.getLocalData(file.fullpath);
        if(!localData){
            var dir = 0, filename, fullpath;
            if (Util.String.lastChar(file.fullpath) === '/') {
                dir = 1;
            }
            fullpath = Util.String.rtrim(file.fullpath, '/');
            filename = Util.String.baseName(fullpath);
            var icon ='icon_64_'+ _context.getFileIconSuffix(filename, dir,file.share,file.local);
            localData = {
               'icon':icon,
                filename: filename,
                dir: dir,
                state: file.state,
                last_member_name: file.last_member_name,
                last_member_id: file.last_member_id,
                favorite: 0,
                last_datetime: '',
                dateline:0
            };
        }
        _context.fetchFileHeader(localData);
        var exprired = 1*60*1000; //60秒
        if(!localData.dateline || (new Date().getTime() - localData.dateline>exprired)){
            gkRest.getFileInfo(PAGE_CONFIG.mountId, file.fullpath, '', function (data) {
                var newData = {
                    favorite: data.favorite,
                    last_datetime: data.last_datetime
                };
                $.extend(localData,newData);
                _context.fetchFileHeader(localData);
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
                share:PAGE_CONFIG.isshare
            }
            gkClientSidebar.fetchFileInfo(file);
        }
    },
    getFileIconSuffix: function (filename, dir, share, local) {
        var suffix = '';
        var sorts = this.FILE_SORTS;
        if (dir) {
            suffix = 'folder';
            if (share>0) {
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
            if ($.inArray(ext, sorts['SORT_MOVIE'])>-1) {
                suffix = 'movie';
            } else if ($.inArray(ext, sorts['SORT_MUSIC'])>-1) {
                suffix = 'music';
            } else if ($.inArray(ext, sorts['SORT_IMAGE'])>-1) {
                suffix = 'image';
            } else if ($.inArray(ext, sorts['SORT_DOCUMENT'])>-1) {
                suffix = 'document';
            } else if ($.inArray(ext, sorts['SORT_ZIP'])>-1) {
                suffix = 'compress';
            } else if ($.inArray(ext, sorts['SORT_EXE'])>-1) {
                suffix = 'execute';
            } else {
                suffix = 'other';
            }
            if ($.inArray(ext, sorts['SORT_SPEC'])>-1) {
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
            url += $.param(params)
            gkClientInterface.openURL({
                url: url,
                sso: 0
            })
        }
    },
    getFileMain:function(fullpath,tab){
        tab = tab === undefined?'':tab;
        var _context =this;

        var params = {
            fullpath: PAGE_CONFIG.path,
            token: gkClientInterface.getToken(),
            type:tab
        };
        if(tab){
            params['_'] = new Date().getTime();
        }else{
            var loading = $('<div class="loader" style="position: absolute;left:0;right:0;color:#aaa;top:50%;text-align: center;margin-top: -9px">正在加载...</div>');
            $('.tab_content_wrapper > div').append(loading);
        }

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
                    if(!tab || tab =='share'){
                        var share_members = data.share_members;
                        gkClientSidebar.fetchShareMembers(share_members);
                    }

                    if(!tab || tab =='link'){
                        var publish = data.publish;
                        gkClientSidebar.fetchLink(publish);
                    }
                    if(!tab || tab =='history'){
                        var remarks = data.history;
                        _context.fetchRemark(remarks);
                    }
                },
                error: function () {
                    $('.tab_content_wrapper > div .loader').remove();
                }
            }
        );
    },
    fetchFileMain: function () {
        var _context = this;
        var main = $('#main');
        main.empty();
        if(PAGE_CONFIG.state>1 && PAGE_CONFIG.state<6){
            $('#fileMainTmpl').tmpl().appendTo(main);
            $('.tab_list li').click(function () {
                var target = $(this).data('target');
                var tab_content_wrapper = $('.tab_content_wrapper');
                var tab_content = tab_content_wrapper.find('>div');
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');
                tab_content.hide();
                tab_content_wrapper.find('.' + target).show();
            });
            _context.getFileMain(PAGE_CONFIG.path);
            $('.tab_list li').eq(2).trigger('click');
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
        var old_remark =  localStorage.getItem('remark_'+PAGE_CONFIG.path);
        var remarkList = $('#remarkListTmpl').tmpl({
            remarks: remarks,
            old_remark:old_remark?old_remark:''
        }).appendTo(slideItemShare);
        $('textarea#post_value').blur(function(){
            var val = $.trim($(this).val());
              localStorage.setItem('remark_'+PAGE_CONFIG.path,val);
        });
        $('a[usercard]').click(function(){
            var u = $(this).attr('usercard');
            if(u != 'id='+PAGE_CONFIG.memberId){
                var a = $.trim($(this).text()).replace('@','');
              $('textarea#post_value').focus();
              $('textarea#post_value').val('@'+a+' ');
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
            gkRest.fileRemind(PAGE_CONFIG.mountId, PAGE_CONFIG.path, text, function () {
                _self.removeClass('disabled').addClass('blue_btn');
                _context.getFileMain(PAGE_CONFIG.path,'history');
                localStorage.removeItem('remark_'+PAGE_CONFIG.path);
            }, function () {
                _self.removeClass('disabled').addClass('blue_btn');
            });
        });

    },
    fetchMain: function () {
        var _context = this;
        var main = $('#main');
        if (!PAGE_CONFIG.path) {
            var links = [], tip = '';
            tip = '这是你的个人文件夹，你可以将你的文件存放在这里，也可以跟你的朋友分享你的文件';
            if (PAGE_CONFIG.type == 1) {
                tip = '这里是你的个人文件夹，你可以将你的文件存放在这里，也可以跟你的朋友分享你的文件';
            } else if (PAGE_CONFIG.type == 2) {
                tip = '这里是团队文件夹，你可以将团队的文件存在在这里，已方便与同事进行共享和协作';
            }
            links = [
                {
                    key: '',
                    url: '/storage',
                    sso: 1,
                    name: '在网页上查看你的文件'
                }
            ];
            var data = {
                type: PAGE_CONFIG.type,
                tip: tip,
                links: links
            };
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
        if(!PAGE_CONFIG.path){
            classes += ' main_root'
        }
        $('#main').removeClass().addClass(classes);
    },
    getScreenName:function(uid,member_id,member_name){
        if(uid == member_id){
            return '我';
        }
        return member_name;
    },
	getToggleState:function(fullpath, dir, state){
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
    arr.last_member_name= arr.membername;
    $.extend(PAGE_CONFIG,arr);
    gkClientSidebar.fetch();
	var fileStatus = "no",fileEle = $(".file_attrs").find("p");
	//只点击文件
	if(arr.path.lastIndexOf("/") < 0 && arr.path){
	   //假如不在共享
	     if(PAGE_CONFIG.isshare == 1){
		 alert("fd");
		 fileStatus = gkClientSidebar.getToggleState(arr.path,0,arr.state);
		 switch(fileStatus){
		     case 1:
			    //显示独占修改
				fileEle.attr("class","dzupdate").text("独占修改");
				break;
		     case 0:
			    //显示取消独占
				 fileEle.attr("class","nodzupdate").text("取消独占");
				break;
			 default:
                fileEle.attr("class","").text("");
			    
			    break;
		 }	
		 }
		 	 
	}
}