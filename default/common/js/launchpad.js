var gkClientLaunchPad = {
    init:function(){
        //disable浏览器的默认事件
        gkClientCommon.disableDefaultEvent();
        var menus = [
            {
            url:'sync.html',
            name:'同步',
            icon:'',
            classes:'sync',
            sso:0
        },
            {
                url:'/client/client?ac=updates',
                name:'更新',
                icon:'',
                classes:'updates',
                sso:1
            }, {
                url:'/client/client?ac=favorites',
                name:'收藏夹',
                icon:'',
                classes:'favorite',
                sso:1
            },
            {
                url:'/client/client?ac=contacts',
                name:'联系人',
                icon:'',
                classes:'contacts',
                sso:1
            },
            {
                url:'/client/client?ac=recyclebin',
                name:'回收站',
                icon:'',
                classes:'recyclebin',
                sso:1
            }
        ];
        var localMenus = [];
        $.ajax({
            url:gkClientInterface.getApiDomain()+'/left_extended_menu',
            data:{
              token:gkClientInterface.getToken()
            },
            type:'GET',
            async:false,
            dataType:'json',
            success:function(data){
                $.each(data,function(i,n){
                    localMenus.push({
                        url: n.url,
                        name:n.name,
                        icon:n.pic,
                        classes:'',
                        sso:0
                    });
                });

                $.merge(menus, localMenus )
            }
        });
        var menulist = $('#leftMenuList').tmpl({
            menus:menus
        }).appendTo($('.launth_pad_left'));

        $(".launth_pad_left li").on("click",function(){
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
        $(".launth_pad_left li").eq(0).trigger('click');

    }
};