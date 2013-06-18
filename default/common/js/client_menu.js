/**2013年改版代码**/
function bind_logo_click(){
    
    
     //首页logo点击
     $(".logo_wrapper").click(function(){
            var params = {
                url: '/client/launchpad',
                sso: 1,
                resize: 0,
                width: 800,
                height: 478
            };
         gkClientInterface.openWindow(params);
     })
     //独占修改
     $(".compary_finance i").click(function(){
         var params = {
                url: '/client/file_edit?ac=lock&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 490,
                height: 175
            };
            gkClientInterface.openSingleWindow(params);
     }); 
    //创建高级链接
   $(".links_span").click(function(){
      create_gj_links();  
    })
   //默认共享状态
   $("<span style='color:#999;margin-left:5px'>未与任何人共享</span>").appendTo($(".share_info_parent"));
   //获取链接
   $(".get_links").on("click",function(){
   
      link_ajax_load_data("token="+gkClient.gGetToken()+"&fullpath="+PAGE_CONFIG.path+"",PAGE_CONFIG.path,$(".select_radius").get(0).options[$(".select_radius").get(0).selectedIndex].value,function(link){
          var params = {
                url: link,
                sso: 1,
                resize: 0,
                width: 490,
                height: 175
            };
          gkClientInterface.openURL(params);
      });
      
    
 
       
   })

}
var gkClientMenu = {
    init: function() {
        var _context = this;
        //disable浏览器的默认事件
        gkClientCommon.disableDefaultEvent();

        $('body').tooltip({
            selector: '.gktooltip'
        });

        _context._initToolBar();

        _context._fetchHeader();
        
        _context._setCompary("init");
       
        _context._setMenu_2013(gkClientMenu.menuList_2013);
        bind_logo_click();
    },
    _setMenu_2013:function(menus){
            $(".main_nav_li span").each(function(i,v){
                  $(this).on('click', function(e) {
               
                var _self = $(this);
                 if (_self.hasClass('disable_item') || _self.hasClass('hide_item')) {
                    return;
                }
              
                var callback = menus[i]['click'];
                if (callback && typeof callback === 'function') {
                     callback(PAGE_CONFIG.path);
                }
               e.stopPropagation();
            });
            })
         
    },
    _setCompary:function(identify){
        //获取小数点后三位的正则
        var _dottedReg = /\d+\.(\d{3})?/;
        var user = gkClientInterface.getUserInfo();
        user.size = user.size||0;
        var totalUserSize = _dottedReg.exec(parseInt(user.size)/1024/1024);
       var size = 0;
        if(totalUserSize){
             size = +totalUserSize[0];
        }
        var capacity = parseInt(user.capacity)/(1024*1024);
        var username = user.username || user.org_username;
        var userimage = user.photourl;
        
        if(identify == "init"){
            $("#compary_list_storage").tmpl({width:(size/capacity * 100)+"%",capacity:capacity,size:size,username:username,userimage:userimage}).appendTo($(".compary_finance"));
        }else{
            $("#compary_list").tmpl({photoUrl:user.photourl}).appendTo($(".compary_finance"));
        }
   },
    /*最新加上的menuList*/
    menuList_2013:[
        //共享
         { 
              classes: 'share_gx',
        name: '共享',
        tip: '共享文件或文件夹',
        click: function(path) {
            if (!path.length) {
                return;
            }
       
            var params = {
                url: '/client/client_file_detail?tab=share&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2) {
                optState = 1;
            }
            return optState;
        }
         },{},
        //动态更新
        {
             /*classes: 'history',
        name: '查看历史',
        tip: '查看文件的修改历史',*/
        click: function(path) {
    
            if (!path) {
                return;
            }
            
            var params = {
                url: '/client/client_file_detail?tab=history&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openSingleWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2 && !dir) {
                optState = 1;
            }
            return optState;
        }
        }
        
    ],
    _initToolBar: function() {
        //工具栏
        $('.toolbar .tools li').on('click', function() {
            var _self = $(this);
            var param = null;
            if (_self.is('.toolbar .tools li.start')) {
                gkClientInterface.launchpad();
            } else if (_self.is('.toolbar .tools li.website')) {
                param = {
                    url: '/storage',
                    sso: 1
                };
                gkClientInterface.openURL(param);
            } else if (_self.is('.toolbar .tools li.help')) {
                param = {
                    url: '/client/feedback',
                    sso: 1,
                    resize: 1,
                    width: 800,
                    height: 500
                };

                gkClientInterface.openWindow(param);
            } else if (_self.is('.toolbar .tools li.news')) {
                param = {
                    url: '/client/client?ac=updates',
                    sso: 1,
                    resize: 1,
                    width: 800,
                    height: 500
                };
                gkClientInterface.openWindow(param);
                _self.find('.news_num').hide();
                gkClientInterface.clearUpdateCount();
            } else if (_self.is('.toolbar .tools li.task')) {

            }
            return;
        });
    },
    _setMenus: function(menus) {
        var sideMenuList = $('#sideMenuList').tmpl({
            menus: menus
        });
        $('.wrapper').append(sideMenuList);

        //右侧菜单点击
        sideMenuList.find('li').each(function(i, n) {
            $(this).on('click', function() {
               
                var _self = $(this);
                if (_self.hasClass('disable_item') || _self.hasClass('hide_item')) {
                    return;
                }
              
                var callback = menus[i]['click'];
                if (callback && typeof callback === 'function') {
          
                     callback(PAGE_CONFIG.path);
                }
            });
        });
    },
    _fetchHeader: function() {
        var user = gkClientInterface.getUserInfo();
        var meta = {
           /* memberName: user.username,*/
            memberPhoto: user.photourl,
            size: user.size
        };
        if (user.org_id != 0) {
            //如果是团队版
            meta.orgName = "够快网络科技有限公司";
            meta.orgSize = user.org_size;
            
        }else{
            meta.orgName = "够快网盘";
        }
        meta.orgLogo = '../common/images/logo48x48.png';
        $('#sideMenuHeader').tmpl(meta).appendTo($('.header'));
    }
};
gkClientMenu.menuList = [
    {
        classes: 'share',
        name: '共享',
        tip: '共享文件或文件夹',
        click: function(path) {
            if (!path.length) {
                return;
            }
            var params = {
                url: '/client/client_file_detail?tab=share&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2) {
                optState = 1;
            }
            return optState;
        }
    },
    {
        classes: 'history',
        name: '查看历史',
        tip: '查看文件的修改历史',
        click: function(path) {
            if (!path) {
                return;
            }
            var params = {
                url: '/client/client_file_detail?tab=history&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openSingleWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2 && !dir) {
                optState = 1;
            }
            return optState;
        }
    },
    {
        classes: 'discuss',
        folder: true,
        file: true,
        name: '讨论',
        tip: '对文件进行讨论',
        click: function(path) {
            if (!path.length) {
                return;
            }
            var params = {
                url: '/client/client_file_detail?tab=remark&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openSingleWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2) {
                optState = 1;
            }
            return optState;
        }
    },
    {
        classes: 'lock_to_edit',
        folder: false,
        file: true,
        name: '独占修改',
        tip: '独占文件的修改权',
        click: function(path) {
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
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2 && dir == 0) {
                if (state == 3 || state == 5) {
                    optState = -1;
                } else {
                    optState = 1;
                }
            }
            return optState;
        }
    },
    {
        classes: 'apply_to_edit',
        folder: false,
        file: true,
        name: '申请修改',
        tip: '申请修改文件的权利',
        click: function(path) {
            var params = {
                url: '/client/file_edit?ac=apply&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 490,
                height: 175
            };
            gkClientInterface.openSingleWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = -1;
            if (fullpath && state == 3 && dir == 0) {
                optState = 1;
            }
            //return 1;
            return optState;
        }
    },
    {
        classes: 'transfer_edit_auth',
        folder: false,
        file: true,
        name: '移交修改权',
        tip: '移交独占修改的权限',
        click: function(path) {
            var params = {
                url: '/client/file_edit?ac=transfer&fullpath=' + encodeURIComponent(path),
                sso: 1,
                resize: 0,
                width: 490,
                height: 230
            };
            gkClientInterface.openSingleWindow(params);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = -1;
            if (fullpath && state == 5 && dir == 0) {
                optState = 1;
            }
            //return 1;
            return optState;
        }
    },
    {
        classes: 'favorite',
        name: '收藏',
        tip: '添加文件到收藏列表',
        click: function(path) {
            if (!path) {
                return;
            }
            gkClientInterface.add2Favorite(path);
        },
        toggleState: function(fullpath, dir, state) {
            var optState = 0;
            if (fullpath && state >= 2) {
                optState = 1;
            }
            return optState;
        }
    }
];
/*2013新版修改文件*/
function change_file_info($ele,path){
     $ele.text(path);
     //增加收藏按钮
}
function change_comparty_class(path){
     if(path === "")$(".compary_finance .file_info>div").eq(1).addClass("tmpbottom");
     else $(".compary_finance .file_info>div").eq(1).removeClass("tmpbottom"); 
}
function gShellSelect(re) {
    var arr = re.split(',');
    var path = decodeURIComponent(arr[0]), state = arr[1];
    console.log(path);
    console.log(state);
    if (path === PAGE_CONFIG.path && state == PAGE_CONFIG.state) {
        return;
    }
    PAGE_CONFIG.state = state;
    PAGE_CONFIG.path = path;
    
    var menu_items = $('.side_menu_list li');
    var dir = 0, fullpath = PAGE_CONFIG.path;
    if (Util.String.lastChar(path) === '/') {
        dir = 1;
    }
    if (dir) {
        fullpath = Util.String.rtrim(fullpath, '/')
    }
    var _menu_toggle = gkClientMenu.menuList[3].toggleState;
    var _open_state =  _menu_toggle(path,dir,state);
    var _dl_i = $(".file_info").siblings("i");

    if(path != "" && path != "/"){
        //目录或者文件
        share_ajax_load_data("token="+gkClient.gGetToken()+"&fullpath="+path+"&type=share",function(){
          check_is_dl(_dl_i,_open_state);
        });
        if(path.indexOf("/") > 0 ){
             $($(".select_radius").get(0).options[3]).remove();
              $(".select_radius").append('<option value="0100" data-type="unknownUpload" data-tip="允许链接访问者上传/更新文件，但无法查看文件夹内的文件">匿名上传链接</option>');  
        }else{
             $($(".select_radius").get(0).options[3]).remove();
        }
    }
  
    if(!$(".file_info").get(0)){
      gkClientMenu._setCompary();
    }
     $(".compary_finance b").html(arr[2]);
    change_comparty_class(path);
    update_ajax_load_data("token="+gkClient.gGetToken()+"&type=history&fullpath="+path+"");
    var _image_url = select_file_dir(path);
    $(".compart_file_img > img").attr("src",_image_url);
     if($(".compary_storage").get(0))$(".compary_storage").empty();
  
   change_file_info($(".compary_finance").find("h3"),path);
    if(path === ""){  
        if($(".file_info").get(0) && $(".file_info").siblings("i").get(0)){
             $(".file_info").siblings("i").remove();
             $(".file_info").remove();
       }
        gkClientMenu._setCompary("init");
        return;
    }  
 
    
    
  
    menu_items.each(function(i, n) {
        var _self = $(this);
        //_self.removeClass('disable_item');
        var toggleStateCallback = gkClientMenu.menuList[i].toggleState;
        var state = 0;
        if (toggleStateCallback && typeof toggleStateCallback === 'function') {
            state = toggleStateCallback(fullpath, dir, PAGE_CONFIG.state);
        }
      
        switch (state) {
            case -1:
                _self.removeClass('disable_item hide_item').addClass('hide_item');
                break;
            case 0:
                _self.removeClass('disable_item hide_item').addClass('disable_item');
                break;
            case 1:
                _self.removeClass('disable_item hide_item');
                break;
        }
    });

}
function g_initmenu() {

}

function gSetUpdateCount(count) {
    if (typeof count === undefined) {
        return;
    }
    var el = $('.toolbar .tools .news .news_num');
    if (!el.size()) {
        return;
    }

    if (count <= 0) {
        count = 0;
    }
    if (!count) {
        el.hide();
        return;
    }
    el.text(count > 99 ? '99+' : count).show();
}

/*申请修改失败后的回调函数*/
function gApplyEditFailCallback() {

}