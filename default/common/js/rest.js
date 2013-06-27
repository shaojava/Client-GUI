/**
 * 够快REST接口
 * @type {{getFileInfo: Function}}
 */
var gkRest = {
    getFileInfo:function(mount_id,fullpath,v,onSuccess,onError){
        var date = new Date().toUTCString();
        var ver = 'GET';
        var webpath = Util.String.encodeRequestUri(fullpath);
        var authorization = gkClientInterface.getAuthorization(ver,webpath,date);
        $.ajax(
            {
                url:gkClientInterface.getRestDomain()+webpath,
                type:ver,
                headers:{
                    'x-gk-mount':mount_id,
                    'Date':date,
                    'Authorization':authorization
                },
                dataType:'json',
                success:function(data){
                    if($.isFunction(onSuccess)){
                        onSuccess(data);
                    }
                },
                error:function(request, textStatus, errorThrown){
                    if($.isFunction(onError)){
                        onError(request, textStatus, errorThrown);
                    }
                }
            }
        );
    }
};