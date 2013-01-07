var gkClientLaunchPad = {
    init:function(){
        var user = gkClientInterface.getUserInfo();
        var meta ={
            gkLogo:'../common/images/logo32x32.png'
        };
        if(user){
            meta = {
                member:{
                    name:user.username,
                    photo:user.photourl,
                    size:user.size
                }
            };  
            
            if(user.org_id!=0){
                meta.org = {
                    name:user.org_name||'',
                    logo:'../common/images/logo32x32.png'
                }
            }
        }
        
        $('#lanchpadHeader').tmpl(meta).appendTo($('.header'));
        
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
    }
}