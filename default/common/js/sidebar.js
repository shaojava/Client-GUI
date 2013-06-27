var gkClientSidebar = {
    init: function () {
        var _context = this;
        initWebHref();
        _context.fetchAccountInfo();

        $(".header_nav").click(function () {
            gkClientInterface.launchpad();
        })

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
        if(type==2){
            account_info.find('.org_info').show();
        }else{
            account_info.find('.user_info').show();
        }

    },
    fetchShareMembers: function (share_members) {
        var slideItemShare = $('.tab_content_share');
        var shareMemberList = $('#shareMembersTmpl').tmpl({
            share_members: share_members
        }).appendTo(slideItemShare);

    },
    getLinkKeyAndTipByAuth:function(auth){
        var re = {};
        switch (auth){
            case '1000':
                re = {
                    tip:'允许链接访问者预览',
                    key:'preview'
                }
                break;
            case '1011':
                re = {
                    tip:'允许链接访问者预览、下载',
                    key:'download'
                }
                break;
            case '1111':
                re = {
                    tip:'允许链接访问者预览、下载、上传',
                    key:'cooperate'
                }
                break;
            case '0100':
                re = {
                    tip:'只允许访问者上传',
                    key:'cooperate'
                }

                break;
        }
        return re;
    },
    fetchLink: function (publish) {
        var _context = this;
        if (publish.isclosed==1) {

        } else {
            var link_type = publish.link_type,
                modes =[],
                mode = null;
            $.each(link_type, function (i, n) {
             var re =_context.getLinkKeyAndTipByAuth(n.value);
                mode = {
                    name: n.name,
                    tip: re.tip,
                    auth: n.value,
                    key:re.key
                };
                modes.push(mode);
            })

            var selectWrp = $('#linkModeTmpl').tmpl({
                modes:modes
            }).prependTo($('.tab_content_link'));

            //初始化
            selectWrp.find('ul').on('click', 'a', function () {
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
            selectWrp.find('ul a:first').trigger('click');
        }
    },
    fetchUpdate: function () {

    },
    fetchFileInfo: function (file) {
        var _context =this;
        var dir = 0,filename,fullpath;
        if(Util.String.lastChar(file.fullpath) === '/'){
              dir = 1;
        }
        fullpath = Util.String.rtrim(file.fullpath,'/');
        filename = Util.String.baseName(fullpath);
        var data = {
            filename:filename,
            dir:dir,
            state:file.state,
            last_member_name:file.last_member_name,
            favorite:0,
            last_datetime:''
        };
        var callback = function(localData){
            $.extend(data,localData);
            var fileInfoWrapper = $('#fileInfoTmpl').tmpl(data).appendTo($('#header'));
            fileInfoWrapper.show();
        }
        var localData= _context.getLocalData(file.fullpath);
        if(1){
            gkRest.getFileInfo(PAGE_CONFIG.mountId,file.fullpath,'',function(data){
                localData = {
                    favorite:data.favorite,
                    last_datetime:data.last_datetime
                };
                callback(localData);
                var JSONData = JSON.stringify(localData);
                _context.setLocalData(file.fullpath,JSONData);
            });
        }else{
            callback(localData);
        }
    },
    getLocalData:function(fullpath){
        var localData = localStorage.getItem(fullpath);
        return JSON.parse(localData);
    },
    setLocalData:function(fullpath,data){
        var JSONDate = JSON.stringify(data);
        return localStorage.setItem(fullpath,JSONDate);
    },
    getShellDataFormat:function(){
        return ['path','state','last_member_name','type'];
    },
    fetchHeader:function(){
        var _context = this;
        var header = $('#header');
        header.find('>div').not('.header_nav').remove();
        if(!PAGE_CONFIG.path){
            if(PAGE_CONFIG.type==0){
                _context.fetchAccountInfo(PAGE_CONFIG.type);
            }else if(PAGE_CONFIG.type==1){ //我的文件
                _context.fetchAccountInfo(PAGE_CONFIG.type);
            }else if(PAGE_CONFIG.type==2){ //团队文件
                _context.fetchAccountInfo(PAGE_CONFIG.type);
            }else if(PAGE_CONFIG.type==3){ //总根目录

            }
        }else{
            var file = {
                fullpath:PAGE_CONFIG.path,
                state: PAGE_CONFIG.state,
                last_member_name:PAGE_CONFIG.last_member_name
            }
            gkClientSidebar.fetchFileInfo(file);
        }

    },
    fetchFileMain:function(){
        var main = $('#main');
        main.empty();
        var fileMain = $('#fileMainTmpl').tmpl().appendTo(main);

        $('.tab_list li').click(function () {
            var target = $(this).data('target');
            var tab_content_wrapper = $('.tab_content_wrapper');
            var tab_content = tab_content_wrapper.find('>div');
            $(this).siblings().removeClass('selected');
            $(this).addClass('selected');
            tab_content.hide();
            tab_content_wrapper.find('.' + target).show();
        });
        $('.tab_list li').eq(0).trigger('click');
        var loading = $('<div style="position: absolute;left:0;right:0;color:#aaa;top:50%;text-align: center;margin-top: -9px">正在加载...</div>');
        loading.appendTo($('.tab_content_wrapper > div:visible'));
        $.ajax(
            {
                url: gkClientInterface.getApiDomain() + '/client_sidebar',
                data: {
                    fullpath: PAGE_CONFIG.path,
                    token: gkClientInterface.getToken()
                },
                dataType: 'json',
                success: function (data) {
                    loading.remove();
                    if (!data) {
                        return;
                    }
                    var share_members = data.share_members;
                    gkClientSidebar.fetchShareMembers(share_members);
                    var publish = data.publish;
                    gkClientSidebar.fetchLink(publish);
                    //var remarks =data.remarks;
                    //_context.fetchLink(remarks);
                    $('.at').click(function(){
                        var item = $(this).parents('li');
                        gkClientInterface.openWindow({
                            url:'/client/file_remark?fullpath=${fullpath}&username=${member.usename}'
                        });

                        return;
                    });
                },
                error:function(){
                    loading.remove();
                }
            }
        );
    },
    fetchMain:function(){
        var _context = this;
        var main = $('#main');
         if(!PAGE_CONFIG.path){
             var links = [],tip='';
             tip = '这是你的个人文件夹，你可以将你的文件存放在这里，也可以跟你的朋友分享你的文件';
             if(PAGE_CONFIG.type==1){
                 tip = '这是你的个人文件夹，你可以将你的文件存放在这里，也可以跟你的朋友分享你的文件';
             }else if(PAGE_CONFIG.type==2){
                 tip = '这是你的个人文件夹，你可以将你的文件存放在这里，也可以跟你的朋友分享你的文件';
             }
             links = [
                 {
                    key:'',
                     url:'/storage',
                     sso:1,
                     name:'在网页上查看你的文件'
                 }

             ];
             var data = {
                 type:PAGE_CONFIG.type,
                 tip:tip,
                 links:links
             };
             //console.log(1);
             $('#rootMainTmpl').tmpl(data).appendTo(main);
         }else{
            _context.fetchFileMain();
         }
        _context.setMainStyle();

    },
    fetch:function(){
        var _context = this;
       _context.fetchHeader();
      _context.fetchMain();
    },
    setMainStyle:function(){
        $('#main').removeClass().addClass('main_'+PAGE_CONFIG.type);
    }
};

function gShellSelect(re) {
    if(re === PAGE_CONFIG.re){
        return;
    }
    PAGE_CONFIG.re = re;
    var arr = re.split(',');
    console.log('-----------file-------------');
    console.log(arr);

    var format = gkClientSidebar.getShellDataFormat();
    for (var i = 0; i < format.length; i++) {
        var v= format[i];
        PAGE_CONFIG[v] = arr[i] === undefined ? undefined : decodeURIComponent(arr[i]);
    }
    gkClientSidebar.fetch();
}