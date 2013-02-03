var gkClientInterface = {
    login:function(param){
        try{
            param = JSON.stringify(param);
            gkClient.gLogin(param);
        }catch(e){
            throw e;
        }
    },
    openURL:function(param){
        try{
            param = JSON.stringify(param);
            gkClient.gOpenUrl(param);
        }catch(e){
            throw e;
        } 
    },
    settings:function(){
        try{
            gkClient.gSettings();
        }catch(e){
            throw e;
        } 
    },
    checkLastPath:function(){
        try{
            return gkClient.gCheckLastPath();
        }catch(e){
            throw e;
        } 
    },
    checkIsEmptyPath:function(path){
        try{
            return gkClient.gCheckEmpty(path);
        }catch(e){
            throw e;
        } 
    },
    showError:function(errorMsg,errorCode){
        if(!errorMsg.length){
            return;
        }
        alert(errorMsg);
    },
    finishSettings:function(param){
        try{
            param = JSON.stringify(param);
            gkClient.gStart(param);
        }catch(e){
            throw e;
        } 
    },
    toogleArrow:function(state){
        try{
            state = JSON.stringify(state);
            gkClient.gShowArrow(state)
        }catch(e){
            throw e;
        }
      
    },
    setMenus:function(menus){
        try{
            menus = JSON.stringify(menus);
            gkClient.gSetMenu(menus)
        }catch(e){
            throw e;
        } 
    },
    getNormalPath:function(){
        try{
            return gkClient.gNormalPath();
        }catch(e){
            throw e;
        }
    },
    getBindPath:function(){
        try{
            return gkClient.gBindPath();
        }catch(e){
            throw e;
        }
    },
    getSelectPaths:function(){
        try{
            return gkClient.gSelectSyncPath();
        }catch(e){
            throw e;
        }
    },
    openWindow:function(params){
        try{
            // console.log(params);
            params = JSON.stringify(params);
            gkClient.gMain(params);
        }catch(e){
            throw e;
        }
    },
    openSingleWindow:function(params){
        try{
            params = JSON.stringify(params);
            gkClient.gSoleMain(params)
        }catch(e){
            throw e;
        }
    },
    openSyncDir:function(path){
        try{
            if(path !== undefined){
                gkClient.gOpenPath(path);
            }else{
                gkClient.gOpenPath();
            }
        }catch(e){
            throw e;
        }
    },
    openPathWithSelect:function(path){
        try{
            if(!path&&!path.length){
                return;
            }
            gkClient.gOpenPathWithSelect(path);
        }catch(e){
            throw e;
        }
    },
    selectSyncFile:function(){
        try{
            gkClient.gSelectSyncPath();
        }catch(e){
            throw e;
        }
    },
    getUserInfo:function(){
        try{
            return JSON.parse(gkClient.gUserInfo());
        }catch(e){
            throw e;
        }
    },
    toggleLock:function(path){
        try{
            if(!path.length){
                return;
            }
            gkClient.gLock(path);
        }catch(e){
            throw e;
        }
    },
    add2Favorite:function(path){
        try{
            if(!path.length){
                return;
            }
            gkClient.gFavorite(path);
        }catch(e){
            throw e;
        }
    },
    launchpad:function(){
        try{
            gkClient.gLaunchpad();
        }catch(e){
            throw e;
        }
    },
    getOauthKey:function(){
        try{
            return gkClient.gOAuthKey();
        }catch(e){
            throw e;
        }
    },
    compareVersion:function(params){
        params = JSON.stringify(params);
        gkClient.gCompare(params);
    },
    getMessage:function(){
        return JSON.parse(gkClient.gGetMessage());
    },
    clearUpdateCount:function(){
        gkClient.gClearUpdateCount();
    },
    getSiteDomain:function(){
        return  gkClient.gSiteDomain();
    }
}
var gkClientAjax = {};
gkClientAjax.Exception={
    getErrorMsg:function(request, textStatus, errorThrown){
        var errorMsg = '';
        if(request.responseText){
            var result = $.parseJSON(request.responseText);
            errorMsg = result.error_msg?result.error_msg:request.responseText;
        }else{
            switch (request.status) {
                case 0:
                    errorMsg = '';
                    break;
                case 401:
                    errorMsg = '登录超时或者当前帐号在其他位置登录，请注意帐号安全';
                    break;
                case 501:
                case 502:
                    errorMsg = '服务器繁忙, 请稍候重试';
                    break;
                case 503:
                    errorMsg = '因您的操作太过频繁, 操作已被取消';
                    break;
                case 504:
                    errorMsg ='因您的操作太过频繁, 操作已被取消';
                    break;
                default:
                    errorMsg =request.status + ':' + request.statusText;
                    break;
            }
        }
        return errorMsg;
    }
}

function initWebHref(){
    $('#main').on('click','a',function(e){
        var href= $(this).attr('href');
        if(/\/storage#!files:(0|1):(.*?)(:(.*):.*)??$/.test(href)){
            if(!RegExp.$2 && !RegExp.$2.length && !RegExp.$4 && !RegExp.$4.length){
                gkClientInterface.openSyncDir();
            }else{
                var dir =0,path='',uppath='',file='';
                if(RegExp.$2 && RegExp.$2.length){
                    uppath=decodeURIComponent(RegExp.$2)
                }
                if(RegExp.$4 && RegExp.$4.length){
                    file = decodeURIComponent(RegExp.$4);
                    if(Util.String.lastChar(file)==='/'){
                        dir =1;
                    }
                    file=Util.String.rtrim(file,'/');
                }else{
                    dir =1;
                }
                path = (uppath.length?uppath+'/':'')+file;
                if(dir){
                    gkClientInterface.openSyncDir(path);
                }else{
                    gkClientInterface.openPathWithSelect(path);
                }
            }
            return false;
        }else if($.trim(href)!=''&&$.trim(href).indexOf('#')!=0&&!/^javascript:.*?$/.test(href)){
            var param = {
                url:href,
                sso:0
            }
            if(parseInt(PAGE_CONFIG.memberId)){
                param.sso=1;
            }
            gkClientInterface.openURL(param);
            return false;
        }
    })
}

var gkClientCommon = {
    disableDefaultEvent:function(){
        $('body').on({
            dragstart:function(e){
                e.preventDefault();
            },
            drop:function(e){
                e.preventDefault();
            }
        })
    }
}