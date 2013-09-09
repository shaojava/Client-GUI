var gkClientFileState = {
    DEFAULT_STATE: 0,
    NORMAL_STATE: 1,
    FINISH_STATE: 2,
    LOCK_STATE: 3,
    LOCAL_STATE: 4,
    EDIT_STATE: 5
};
var gkClientFileLock = {
    UNLOCK: 0,
    LOCK_BY_OTHER: 1,
    LOCK_BY_ME: 2
};
var gkClientInterface = {
 /*注销登录*/
    logoOut:function(){
	  gkClient.gLogoff();
	},
//设置客户端消息
    setClientInfo:function(params){
	    gkClient.gSetClientInfo(params);
	},
   //清除缓存
    clearCache:function(){
	   gkClient.gClearCache();
	},
	//设置代理
	setConfigDl:function(){
	  gkClient.gSettings();
	},
	//移动文件
	moveFile:function(path){
	   return gkClient.gSelectPath(path);
	},
	//移动同步文件
    moveSyncFile:function(path){
        try {
            return gkClient.gMoveBindPath(path);
        } catch (e) {
            throw e;
        }
	},
    getClientInfo:function(){
        try {
            return JSON.parse(gkClient.gGetClientInfo());
        } catch (e) {
            throw e;
        }

    },
    setFileStatus: function(path, dir, state) {
        var params = JSON.stringify({
            webpath: path,
            status: state,
            dir: dir
        });
        gkClient.gSetFileStatus(params);
    },
    closeWindow: function () {
        try {
            gkClient.gClose();
        } catch (e) {
            throw e;
        }
    },
    login: function (param) {
        try {
            param = JSON.stringify(param);
            gkClient.gLogin(param);
        } catch (e) {
            throw e;
        }
    },
    loginByKey: function () {
        try {
            gkClient.gLoginByKey();
        } catch (e) {
            throw e;
        }
    },
    openURL: function (param) {
        try {
            param = JSON.stringify(param);
            gkClient.gOpenUrl(param);
        } catch (e) {
            throw e;
        }
    },
    settings: function () {
        try {
            gkClient.gSettings();
        } catch (e) {
            throw e;
        }
    },
    checkLastPath: function () {
        try {
            return gkClient.gCheckLastPath();
        } catch (e) {
            throw e;
        }
    },
    checkIsEmptyPath: function (path) {
        try {
            return gkClient.gCheckEmpty(path);
        } catch (e) {
            throw e;
        }
    },
    showError: function (errorMsg, errorCode) {
        if (!errorMsg.length) {
            return;
        }
        alert(errorMsg);
    },
    finishSettings: function (param) {
        try {
            param = JSON.stringify(param);
            gkClient.gStart(param);
        } catch (e) {
            throw e;
        }
    },
    toogleArrow: function (state) {
        try {
            state = JSON.stringify(state);
            gkClient.gShowArrow(state);
        } catch (e) {
            throw e;
        }

    },
    setMenus: function (menus) {
        try {
            menus = JSON.stringify(menus);
            gkClient.gSetMenu(menus);
        } catch (e) {
            throw e;
        }
    },
    getNormalPath: function () {
        try {
            return gkClient.gNormalPath();
        } catch (e) {
            throw e;
        }
    },
    getBindPath: function () {
        try {
            return gkClient.gBindPath();
        } catch (e) {
            throw e;
        }
    },
    getSelectPaths: function (path) {
        path = typeof arguments[0] === 'undefined' ? '' : path;
        try {
            return gkClient.gSelectSyncPath(path);
        } catch (e) {
            throw e;
        }
    },
    openWindow: function (params) {
        try {
            params = JSON.stringify(params);
            return gkClient.gMain(params);
        } catch (e) {
            throw e;
        }
    },
    openSingleWindow: function (params) {
        try {
            params = JSON.stringify(params);
            gkClient.gSoleMain(params);
        } catch (e) {
            throw e;
        }
    },
    openSyncDir: function (path) {
        try {
            if (path !== undefined) {
                gkClient.gOpenPath(path);
            } else {
                gkClient.gOpenPath();
            }
        } catch (e) {
            throw e;
        }
    },
    openPathWithSelect: function (path) {
        try {
            if (!path && !path.length) {
                return;
            }
            gkClient.gOpenPathWithSelect(path);
        } catch (e) {
            throw e;
        }
    },
    selectSyncFile: function (params) {
        params = typeof arguments[0] === 'undefined' ? '' : params;
        try {
            var JSONparams = JSON.stringify(params)
            gkClient.gSelectSyncPath(JSONparams);
        } catch (e) {
            throw e;
        }
    },
    getUserInfo: function () {
        try {
            if (!gkClient.gUserInfo()) {
                return '';
            }
            return JSON.parse(gkClient.gUserInfo());
        } catch (e) {
            throw new Error(e.name+':'+e.message);
        }
    },
    toggleLock: function (path) {
        try {
            if (!path.length) {
                return;
            }
            gkClient.gLock(path);
        } catch (e) {
            throw e;
        }
    },
    getClientInfo: function () {
        try {
            return JSON.parse(gkClient.gGetClientInfo());
        } catch (e) {
            throw e;
        }

    },
    getShowTrans: function () {
        gkClient.gShowTrans();
    },
    getShowSettings: function () {
        gkClient.gShowSettings();
    },
    add2Favorite: function (path) {
        try {
            if (!path.length) {
                return;
            }
            gkClient.gFavorite(path);
        } catch (e) {
            throw e;
        }
    },
    launchpad: function (path) {
        try {
            if (path) {
                gkClient.gLaunchpad(path);
                return;
            }
            gkClient.gLaunchpad();
        } catch (e) {
            throw e;
        }
    },
    getOauthKey: function () {
        try {
            return gkClient.gOAuthKey();
        } catch (e) {
            throw e;
        }
    },
    compareVersion: function (params) {
        params = JSON.stringify(params);
        gkClient.gCompare(params);
    },
    getMessage: function () {
        try {
            var re= gkClient.gGetMessage();
            if(!re){
                return ''
            }
            return JSON.parse(re);
        } catch (e) {
            throw e;
        }

    },
    clearUpdateCount: function () {
        try {
            gkClient.gClearUpdateCount();
        } catch (e) {
            throw e;
        }

    },
    getSiteDomain: function () {
        try {
            return gkClient.gSiteDomain();
        } catch (e) {
            throw e;
        }
    },
    setClipboardData: function (text) {
        try {
            gkClient.gSetClipboardData(text);
        } catch (e) {
            throw e;
        }
    },
    getLinkPath: function () {
        var re = gkClient.gGetLinkPaths();
        if (!re) {
            return '';
        }
        return JSON.parse(re);
    },
    selectFile: function (path) {
        var params = {
            path: '',
            disable_root: 0
        };
        if (typeof path === 'string') {
            params = {
                path: path,
                disable_root: 0
            };
        } else if (typeof path === 'object') {
            params = path;
        }
        var JSONparams = JSON.stringify(params);
        return gkClient.gSelectPath(JSONparams);
    },
    setLinkPath: function (paths) {
        var params = {
            'list': paths
        };
        gkClient.gSetLinkPaths(JSON.stringify(params));
    },
    removeLinks: function (links) {
        var params = {
            'list': links
        };
        gkClient.gRemoveLinkPaths(JSON.stringify(params));
    },
    getAuthorization: function (ver, webpath, date) {
        var params = {
            ver: ver,
            webpath: webpath,
            date: date
        };
        var JSONParams = JSON.stringify(params);
        return gkClient.gGetAuthorization(JSONParams);
    },
    getToken: function () {
        try {
            return gkClient.gGetToken();
        } catch (e) {
            throw e;
        }
    },
    getApiDomain: function () {
        try{
            return gkClient.gApiHost();
        }catch(e){

        }
    },
    getRestDomain: function () {
        try{
            return  gkClient.gRestHost();
        }catch(e){

        }
    },
    openDiskPath: function (path) {
        gkClient.gOpenDiskPath(path);
    },
    openChildWindow: function (params) {
        gkClient.gChildMain(JSON.stringify(params));
    },
    checkLinkPath: function (path) {
        var re = gkClient.gCheckLinkPath(path);
        return JSON.parse(re)
    },
    mailTo: function (to, subject, content) {
        var params = {
            to: to,
            subject: subject,
            content: content
        };
        gkClient.gMailTo(JSON.stringify(params));
    },
    getUserAgent:function(){
        return navigator.userAgent.split(';')
    },
    getClientOS:function(){
      return this.getUserAgent()[2].toLowerCase();
    },
    isWindowsClient:function(){
        return this.getClientOS() == 'windows';
    },
    getClientVersion:function(){
        return this.getUserAgent()[1].toLowerCase();
    },
    getClientLang:function(){

    }
};
var gkClientAjax = {};
gkClientAjax.Exception = {
    getErrorMsg: function (request, textStatus, errorThrown) {
        var errorMsg = '';
        if (request.responseText) {
            var result = $.parseJSON(request.responseText);
            errorMsg = result.error_msg ? result.error_msg : request.responseText;
        } else {
            switch (request.status) {
                case 0:
                    errorMsg = L('please_check_your_network');
                    break;
                case 401:
                    errorMsg = L('ERROR_MSG_401');
                    break;
                case 501:
                case 502:
                    errorMsg = L('ERROR_MSG_502');
                    break;
                case 503:
                    errorMsg = L('ERROR_MSG_503');
                    break;
                case 504:
                    errorMsg = L('ERROR_MSG_504');
                    break;
                default:
                    errorMsg = request.status + ':' + request.statusText;
                    break;
            }
        }
        return errorMsg;
    }
};

function initWebHref(proxyElem) {
    proxyElem = proxyElem === undefined ? $('body') : proxyElem;
    proxyElem.on('click', 'a', function (e) {
        var href = $(this).attr('href');
        var targetElem = $(e.target);
        if (!targetElem.hasClass('gk_blank') && /\/storage#!files:(0|1):(.*?)(:(.*):.*)??$/.test(href)) {
            if (!RegExp.$2 && !RegExp.$2.length && !RegExp.$4 && !RegExp.$4.length) {
                gkClientInterface.openSyncDir();
            } else {
                var dir = 0, path = '', uppath = '', file = '';
                if (RegExp.$2 && RegExp.$2.length) {
                    uppath = decodeURIComponent(RegExp.$2);
                }
                if (RegExp.$4 && RegExp.$4.length) {
                    file = decodeURIComponent(RegExp.$4);
                    if (Util.String.lastChar(file) === '/') {
                        dir = 1;
                    }
                    file = Util.String.rtrim(file, '/');
                } else {
                    dir = 1;
                }
                path = (uppath.length ? uppath + '/' : '') + file;
                if (dir) {
                    gkClientInterface.openSyncDir(path + '/');
                } else {
                    gkClientInterface.openPathWithSelect(path);
                }
            }
            return false;
        } else if ($.trim(href) != '' && $.trim(href).indexOf('#') != 0 && !/^javascript:.*?$/.test(href)) {
            var param = {
                url: href,
                sso: 0
            };
            if (parseInt(PAGE_CONFIG.memberId) || targetElem.data('sso') == 1) {
                param.sso = 1;
            }
            gkClientInterface.openURL(param);
            return false;
        }
    });
}

var PAGE_CONFIG = {};
//获取当前登录用户的信息
(function () {
    try{
        var account = gkClientInterface.getUserInfo();
        if (account) {
            PAGE_CONFIG.memberId = account.id;
            PAGE_CONFIG.email = account.email;
            PAGE_CONFIG.mountId = account.mount_id;
            PAGE_CONFIG.orgId = account.org_id;
        }
        console.log(PAGE_CONFIG);
    }catch(e){
        throw new Error(e.name+':'+ e.message);
    }

})();