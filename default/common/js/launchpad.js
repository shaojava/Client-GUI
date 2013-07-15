var gkClientLaunchPad = {
    init:function(callback){
        //disable浏览器的默认事件
		//callback();
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
                url:'/client/client?ac=notices',
                name:'消息',
                icon:'',
                classes:'notices',
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
			   
			   /* if($("#loadImgText").length > 0){
				   $("#loadImgText").remove();
				}*/
				$(".launth_pad_right").append('');
                $.each(data,function(i,n){
                    localMenus.push({
                        url: n.url,
                        name:n.name,
                        icon:n.pic,
                        classes:'',
                        sso:n.sso==1?1:0
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
		           //获取指定的样式
		//$("."+location.hash.replace("#","")).addClass("selected").siblings("li").removeClass("selected");
		var re = '';
		if(location.hash){
	     re =  location.hash.replace("#","");
		}
	    if(re&&$("."+re).size()){
		  $("."+re).trigger("click");
		}else{
		 
	      $(".left_menu_list li").eq(0).trigger('click');
		}
		

    }
};