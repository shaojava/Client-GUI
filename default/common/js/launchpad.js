var gkClientLaunchPad = {
    init:function(){
        //disable浏览器的默认事件
        gkClientCommon.disableDefaultEvent();
        var user = gkClientInterface.getUserInfo();
        var meta ={
            gkLogo:'../common/images/logo32x32.png'
        };
        if(user){
            meta.member ={
                    name:user.username,
                    photo:user.photourl,
                    size:user.size
            
            };  
            
            if(user.org_id!=0){
                meta.org = {
                    name:user.org_name||'',
                    logo:'../common/images/logo32x32.png'
                }
            }
        }
        
        $('#lanchpadHeader').tmpl(meta).appendTo($('.header'));
        
        $('.header .header_left,.header .header_right').click(function(){
            var params = {
                url:'/storage',
                sso:1
            }
            gkClientInterface.openURL(params);
            return;
        });
        
        $('.menus li').click(function(){
            var url = $(this).attr('data-url');
            var params = {};
            if(!url.length){
                gkClientInterface.openSyncDir();
            }else{
                params = {
                    url:url,
                    width:800,
                    height:600,
                    sso:1,
                    resize:1
                };
                gkClientInterface.openWindow(params);
            }
                 
        });
        //最新消息
        this.showMessage();
    },
    showMessage:function(){
        var re  =  gkClientInterface.getMessage();
       
        var msg = re.message[0]||{};
        //        if(!msg){
        //            return;
        //        }
        //console.log(msg);
        msg.count = re.message_count;
        var msg = {
            count:re.message_count,
            member_name:msg.member_name,
            text:msg.message + msg.msg,
            timeago:msg.timeago
        }
//        var msgBanner = $('#messageBanner').tmpl(msg);
//        if(msg.count!=0){
//            msgBanner.appendTo($('body'));
//            msgBanner.css({
//                'opacity':0,
//                'bottom':msgBanner.outerHeight() *-1
//            })
//            msgBanner.animate({
//                'bottom':16,
//                'opacity':1
//            },300);
//        }
//        msgBanner.find('.message_banner_right').on('click',function(){
//            var param = {
//                url:'/client/notice',
//                sso:1,
//                resize:0,
//                width:500,
//                height:485
//            };
//            gkClientInterface.openWindow(param);
//            msgBanner.hide();
//        })
    }
}