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
        localStorage.clear();
        initWebHref();
        $('body').tooltip({
            selector: '.gktooltip'
        });
        _context.fetchAccountInfo();
        $(".header_nav").click(function (e) {
		
            gkClientInterface.launchpad();
        })
		$(".header_website").click(function(e){
		     gkClientInterface.openURL({
                url: 'http://www.gokuai.com/storage',
                sso: 0
            })
		    e.stopPropagation();
		})
     
	  

    },
	clearConfiect:function(arr){
	  var i,results = [],len = arr.length,username = gkClientInterface.getUserInfo().username;
	  for(i = 0;i<len;i++){
	    
		if(arr[i].hasOwnProperty("username") && arr[i]["username"] != username){
		  results.push(arr[i]);
		}
		 
	  }
	  return results;
	},
	bindShares : function(shares){
	$(".textarea_wrapper").inputTip(this.clearConfiect(shares),$(".at_and_task"));
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
            used_size: Util.Number.bitSize(account.size),
            capacity: Util.Number.bitSize(account.capacity),
            org_used_size: Util.Number.bitSize(account.org_size),
            org_capacity: Util.Number.bitSize(account.org_capacity)
        };
        var account_info = $('#accountInfoTmpl').tmpl(data).appendTo($('#header'));
        if (type == 2) { 
            account_info.find('.org_info').show();
        } else {
            account_info.find('.user_info').show();
        }

    },
	shareMembers:[],
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
                url: '/client/client_file_detail?fullpath='+encodeURIComponent(PAGE_CONFIG.path)+'&tab=dynamic&client=1&defaulttext=@'+username+'',
    			sso: 1,
                resize: 0,
                width: 800,
                height: 600
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
                    key: 'unknownUpload'
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
            tab_content_wrapper.append('<div class="empty">链接分享功能已关闭</div>');
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
            selectWrp.find('.dropdown_menu').on('click', 'a', function () {
			
                var btn = selectWrp.children('a:first'); 
                  	
    			  var cloneBtn = $(this).clone();
                if (btn.size()) {
                    selectWrp.find('a:first').replaceWith(cloneBtn);
					
                } else {	 
                    selectWrp.prepend(cloneBtn);
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
                if(Util.String.lastChar(PAGE_CONFIG.path)==='/'){
                    dir=1;
                }
                var filename = Util.String.baseName(Util.String.rtrim(PAGE_CONFIG.path,'/'));
                var content = '我通过 @够快科技 共享了文件'+(dir?'夹':'')+' "'+filename+'"';
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
                            callback(url);
                            _context.setLocalLink(PAGE_CONFIG.path, auth, url);
                        },
                        error: function (request, textStatus, errorThrown) {
                            var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                            alert(errorMsg);
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
	   //判断是否出现版本
       var fileInfoWrapper = $('#fileInfoTmpl').tmpl(localData).appendTo(header);
       fileInfoWrapper.show();

        //独占修改
        $(".lock_to_edit").click(function(){
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
        $(".finish_edit").click(function(){
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

        });

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
            var icon ='icon_64_'+ _context.getFileIconSuffix(filename, dir,file.share,file.local);
            var data = {
                icon:icon,
                filename: filename,
                dir: dir,
                state: file.state,
                last_member_name: file.last_member_name,
                last_member_id: file.last_member_id,
                favorite: 0,
                last_datetime: '',
                dateline:0,
				is_share:0,
                index:0
            };
          var localData = _context.getLocalData(file.fullpath) || {};
          if(localData){
              $.extend(data,localData);
          }
        var exprired = 15*1000; //15秒
        //var exprired =0;
        _context.fetchFileHeader(data);
        var clearCache = !localData || !localData.dateline || (new Date().getTime() - localData.dateline>exprired);
        if(clearCache){
            gkRest.getFileInfo(PAGE_CONFIG.mountId, file.fullpath, '', function (reData) {
                var newData = {
                    favorite: reData.favorite,
                    last_datetime: reData.last_datetime,
					is_share:reData.share,
                    icon:'icon_64_'+ _context.getFileIconSuffix(filename,dir,reData.share,file.local),
                    index:reData.index || 0
                };
                $.extend(localData,newData);
                $.extend(data,localData);
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
        var dateline = localStorage.getItem('cache_'+PAGE_CONFIG.path);
        if(tab || dateline){
            dateline = dateline || new Date().getTime();
            params['_'] = dateline;
        }else{
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
                    if(!tab || tab =='share'){
					   
                        var share_members = data.share_members;
                        gkClientSidebar.fetchShareMembers(share_members);
						//textarea绑定共享人
					 	//_this.bindShares(share_members);
                    }

                    if(!tab || tab =='link'){
                        var publish = data.publish;
                        gkClientSidebar.fetchLink(publish);
                    }
                    if(!tab || tab =='history'){
                        var remarks = data.history;
						$.each(remarks,function(k,v){
						    v['version'] = v['property']['index'];
						})
                        _context.fetchRemark(remarks);
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    $('.tab_content_wrapper > div .loader').remove();
                    var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                    $('.file_info_wrapper').remove();
                    $('#main').html('<div class="empty">'+errorMsg+'</div>');
                }
            }
        );
    },
	selectTabIndex:2,
    fetchFileMain: function () {
	    $('#input_list_wrapper').remove();
        $('#input_calendar_wrapper').remove();
        var _context = this;
        var main = $('#main');
        main.empty();
        if(PAGE_CONFIG.state>1 && PAGE_CONFIG.state<6){
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
        var old_remark =  localStorage.getItem('remark_'+PAGE_CONFIG.path);
        var remarkList = $('#remarkListTmpl').tmpl({
            remarks: remarks,
            old_remark:old_remark?old_remark:''
        }).appendTo(slideItemShare);
		this.bindShares(this.shareMembers);
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
            gkRest.fileRemind(PAGE_CONFIG.mountId, PAGE_CONFIG.path, text, function (data) {
                _self.removeClass('disabled').addClass('blue_btn');
                if(data){
                    var remarkItem = $('#remarkListTmpl').tmpl({
                        remarks: data,
                        isItem:true
                    })
                    var remarkListWrapper =  slideItemShare.find('.remark_list');
                    remarkListWrapper.find('.empty').remove();
                    remarkListWrapper.prepend(remarkItem);
                    remarkItem.hide();
                    remarkItem.fadeIn();
                    localStorage.setItem('cache_'+PAGE_CONFIG.path,new Date().getTime());
				
					
                }
                $('textarea#post_value').val('');
                localStorage.removeItem('remark_'+PAGE_CONFIG.path);

            }, function () {
                _self.removeClass('disabled').addClass('blue_btn');
            });
        });


        //历史版本
        slideItemShare.find('.version').click(function(){
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
                    url: 'http://help.gokuai.com',
                    sso: 1,
                    name: '在线帮助'
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
				{url: 'javascript:gkClientInterface.openWindow({url:"/client/create_share_folder?org_share=1",sso:1,resize:0,width:400,height:140})',
                   key:'',
				   sso:1,
				   name:"创建团队文件夹"
				}
            ];
				 
            }
            var data = {
                type: PAGE_CONFIG.type,
                tip: tip,
                links: links
            };
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
}