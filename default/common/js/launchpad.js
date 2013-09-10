var gkClientLaunchPad = {
    init:function(callback){
        //disable浏览器的默认事件
		//callback();
        alert(4);
        gkClientCommon.disableDefaultEvent();
        var menus = [
            {
            url:'sync.html',
            name:L('nav_sync'),
            icon:'',
            classes:'sync',
            sso:0
        },
            {
                url:'/client/client?ac=updates',
                name:L('nav_updates'),
                icon:'',
                classes:'updates',
                sso:1
            },
            {
                url:'/client/client?ac=favorites',
                name:L('nav_favorites'),
                icon:'',
                classes:'favorite',
                sso:1
            },
            {
                url:'/client/client?ac=notices',
                name:L('nav_notification'),
                icon:'',
                classes:'notices',
                sso:1
            },
            {
                url:'/client/client?ac=recyclebin',
                name:L('nav_trash'),
                icon:'',
                classes:'recyclebin',
                sso:1
            }
        ];
        $('#leftMenuList').tmpl({
            menus:menus
        }).appendTo($('.launth_pad_left .left_menu_list'));
        var localMenus = [];
        $.ajax({
            url:gkClientInterface.getApiDomain()+'/left_extended_menu',
            data:{
              token:gkClientInterface.getToken()
            },
            type:'GET',
            dataType:'json',
            success:function(data){
                $.each(data,function(i,n){
                    localMenus.push({
                        url: n.url,
                        name:n.name,
                        icon:n.pic,
                        classes:'',
                        sso:n.sso==1?1:0
                    });
                });
                $('#leftMenuList').tmpl({
                    menus:localMenus
                }).appendTo($('.launth_pad_left .left_menu_list'));
            }
        });

        
		$(".launth_pad_left").on("click",'li',function(){
            var url = $(this).data("url");
            var sso =  $(this).data("sso");
            if(sso==1){
                url  = gkClientInterface.openWindow({
                    url:url,
                    sso:1,
                    opentype:1
                });
            }
           $("iframe").attr("src",url);
           $(".launth_pad_left li").removeClass('selected');
           $(this).addClass('selected');
        })

        var selectNav = function(){
            var re = '';
            if(location.hash){
                re =  location.hash.replace("#","");
            }
            if(re&&$("."+re).size()){
                $("."+re).trigger("click");
            }else{
                $(".left_menu_list li").eq(0).trigger('click');
            }
        };

        $(window).on('hashchange', function() {
            selectNav();
        });
        selectNav();
        alert(5);
    }
};