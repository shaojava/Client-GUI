var gkClientMenu = {
  
    init:function(){
        //disable浏览器的默认事件
        gkClientCommon.disableDefaultEvent();
        
        var menus =[
        {
            classes:'share',
            name:'共享',
            folder:true,
            file:true,
            tip:'共享文件或文件夹',
            click:function(){
                if(!PAGE_CONFIG.path.length){
                    return;
                }
                var params = {
                    url:'/client/client_file_detail?tab=share&fullpath='+PAGE_CONFIG.path,
                    sso:1,
                    resize:0,
                    width:800,
                    height:600
                }
                gkClientInterface.openWindow(params);
            }
        },
//        {
//            classes:'qr_share',
//            name:'扫一扫共享',
//            folder:true,
//            file:true,
//            tip:'扫描二维码分享文件',
//            click:function(){
//                if(!PAGE_CONFIG.path.length){
//                    return;
//                }
//                var params = {
//                    url:'/client/client_file_detail?tab=share_qr&fullpath='+PAGE_CONFIG.path,
//                    sso:1,
//                    resize:0,
//                    width:800,
//                    height:600
//                }
//                gkClientInterface.openWindow(params);
//            }
//        },
        {
            classes:'history',
            name:'查看历史',
            tip:'查看文件的修改历史',
            folder:false,
            file:true,
            click:function(){
                if(!PAGE_CONFIG.path.length){
                    return;
                }
                var params = {
                    url:'/client/client_file_detail?tab=history&fullpath='+PAGE_CONFIG.path,
                    sso:1,
                    resize:0,
                    width:800,
                    height:600
                }
                gkClientInterface.openSingleWindow(params);
            }
        },
        {
            classes:'discuss',
            folder:true,
            file:true,
            name:'讨论',
            tip:'对文件进行讨论',
            click:function(){
                if(!PAGE_CONFIG.path.length){
                    return;
                }
                var params = {
                    url:'/client/client_file_detail?tab=remark&fullpath='+PAGE_CONFIG.path,
                    sso:1,
                    resize:0,
                    width:800,
                    height:600
                }
                gkClientInterface.openSingleWindow(params);
            }
        },
        {
            classes:'lock',
            folder:false,
            file:true,
            name:'锁定/解锁',
            tip:'锁定或解锁文件',
            click:function(){
                if(!PAGE_CONFIG.path.length){
                    return;
                }
                gkClientInterface.toggleLock(PAGE_CONFIG.path);
            }
        },
        {
            classes:'favorite',
            folder:true,
            file:true,
            name:'收藏',
            tip:'添加文件到收藏列表',
            click:function(){
                if(!PAGE_CONFIG.path.length){
                    return;
                }
                gkClientInterface.add2Favorite(PAGE_CONFIG.path);
            }
        }
        ];
        
        var sideMenuList = $('#sideMenuList').tmpl({
            menus:menus
        });        
        $('.wrapper').append(sideMenuList);
        var user = gkClientInterface.getUserInfo();
        var meta = {
            memberName:user.username,
            memberPhoto:user.photourl,
            size:user.size
        }
        if(user.org_id!=0){
            meta.orgName = user.org_name;
            meta.orgSize = user.org_size;
        }
        meta.orgLogo = '../common/images/logo48x48.png';
        $('#sideMenuHeader').tmpl(meta).appendTo($('.header'));
        
        //右侧菜单点击
        $('.side_menu_list li').each(function(i,n){
            $(this).on('click',function(){
                var _self = $(this);
                if(_self.hasClass('disable_item')){
                    return;
                }
                var callback =   menus[i]['click'];
                if(callback && typeof callback ==='function'){
                    callback();
                }
            })
        });
        //工具栏
        $('.toolbar .tools li').on('click',function(){
            var _self = $(this);
            var param = null;
            if(_self.is('.toolbar .tools li.start')){
                gkClientInterface.launchpad();
            }else if(_self.is('.toolbar .tools li.website')){
                param ={
                    url:'/storage',
                    sso:1
                };
                gkClientInterface.openURL(param);
            }else if(_self.is('.toolbar .tools li.help')){
                param ={
                    url:'/client/feedback',
                    sso:1,
                    resize:0,
                    width:800,
                    height:500
                };
                
                gkClientInterface.openWindow(param);
            }else if(_self.is('.toolbar .tools li.news')){
                param ={
                    url:'/client/client?ac=updates',
                    sso:1,
                    resize:0,
                    width:800,
                    height:500
                };
                gkClientInterface.openWindow(param);
                _self.find('.news_num').hide();
                gkClientInterface.clearUpdateCount();
            }else if(_self.is('.toolbar .tools li.task')){

            }
            return;
        })
        $('body').tooltip({
            selector:'.gktooltip'
        })
    }
}

function gShellSelect(re){
    var arr = re.split(',');
    var path = arr[0],state = arr[1];
    if(path===PAGE_CONFIG.path && state==PAGE_CONFIG.state){
        return;
    }
    PAGE_CONFIG.state = state;
    PAGE_CONFIG.path = path;
    var menu_items = $('.side_menu_list li');
    menu_items.removeClass('disable_item');
    if(!PAGE_CONFIG.path.length || PAGE_CONFIG.state<2){
        menu_items.addClass('disable_item');
        return;
    }
    var dir = 0;
    if(Util.String.lastChar(path)==='/'){
        dir = 1;
    }
    if(dir){
        menu_items.filter('[data-folder_enable="false"]').addClass('disable_item');
    }else{
        menu_items.filter('[data-file_enable="false"]').addClass('disable_item');
    }
  
}
function g_initmenu(){      
  
}

function gSetUpdateCount(count){
    if(typeof count === undefined){
        return;
    }
    var el = $('.toolbar .tools .news .news_num');
    if(!el.size()){
        return;
    }

    if(count<=0){
        count = 0;
    }
    if(!count){
        el.hide();
        return;
    }
    el.text(count>99?'99+':count).show()
}