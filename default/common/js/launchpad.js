var gkClientLaunchPad = {
    init_2013:function(){
            $('.launth_pad_left li').click(function(){
            var url = $(this).data('url');
            var _iframe = $("iframe");
            _iframe.attr("src",url);
        });
    },
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
                };
            }
        }
        
        $('#lanchpadHeader').tmpl(meta).appendTo($('.header'));
        
        $('.header .header_left,.header .header_right').click(function(){
            var params = {
                url:'/storage',
                sso:1
            };
            gkClientInterface.openURL(params);
            return;
        });
        
  
         /*   if(!url.length){
                gkClientInterface.openSyncDir();
            }
            //若是消息，重新设置弹窗的大小
            else if(url=='/client/notice'){
                params = {
                    url:url,
                    width:500,
                    height:485,
                    sso:1,
                    resize:0
                };
                gkClientInterface.openWindow(params);
            }
            else{
                params = {
                    url:url,
                    width:800,
                    height:600,
                    sso:1,
                    resize:1
                };
                gkClientInterface.openWindow(params);
            }
                 
        });*/
        //最新消息
//        this.showMessage();
    }
//    showMessage:function(){
//        var re  =  gkClientInterface.getMessage();
//       
//        var msg = re.message[0]||{};
//        //        if(!msg){
//        //            return;
//        //        }
//        //console.log(msg);
//        msg.count = re.message_count;
//        var text = msg.message + msg.msg;
//        if(msg.count==0){
//            text = '没有新消息';
//        }
//        var msg = {
//            count:re.message_count,
//            member_name:msg.member_name,
//            text:text,
//            timeago:msg.timeago
//        }
//        var msgBanner = $('#messageBanner').tmpl(msg).appendTo($('body'));
//        
//        var msg_icon = $('.message_banner').find('.message_icon')
//        msg_icon.on('click',function(){
//            var param = {
//                url:'/client/notice',
//                sso:1,
//                resize:0,
//                width:500,
//                height:485
//            };
//            gkClientInterface.openWindow(param);
//        })
//    }
};