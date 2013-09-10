var gkClientSetting = {
    clientInfo: null,
    //初始化
    init: function () {
        this.clientInfo = gkClientInterface.getClientInfo();
        this.initData();
        this.initUI();

        this.initEvent();
        this.initBasic();
        this.initAdvance();
    },
    initEvent: function(){
        //确定
        $('.purple_btn').click(function () {
            var params = {};
            $('.chk').each(function(){
                var config = $(this).data('config');
                if($(this).hasClass('checked')){
                    params[config] = 1;
                }else{
                    params[config] = 0;
                }
            });
            params['configpath'] = $.trim($('input', $('.config_loc')).val());
            gkClientInterface.setClientInfo(JSON.stringify(params));
            gkClientInterface.closeWindow();
        })
        //取消
        $('.cancel').click(function () {
            gkClientInterface.closeWindow();
        });
        //选中
        $('body').on('click', '.chk', function () {
            $(this).toggleClass('checked');
        });
    },
    initBasic: function(){
        //注销登录
        $('.edit_btn').click(function () {
            gkClientInterface.logoOut();
        });
    },
    initAdvance: function(){
        //清除缓存数据
        $('.clearCache').click(function () {
            if (confirm(L('are_sure_to_clear_cache'))) {
                gkClientInterface.clearCache();
            }
        });
        //设置代理
        $('.settingDl').click(function () {
            gkClientInterface.setConfigDl();
        });
        //移动
        $('.move').click(function () {
            var d = gkClientInterface.moveFile($('.file_index').find('input').val());
            if (d != '') {
                $('.config_loc').find('input').val(d);
            }
            return;
        });
        //同步文件位置移动
        $('.sync-move').click(function () {
            var old = $('.sync').find('input').val();
            var d = gkClientInterface.getBindPath();
            if (d != '') {
                if (confirm(L('are_you_sure_to_move_synchronize_directory', old, d))) {
                    $('.sync_loc').find('input').val(d);
                    var syncPath = $('.sync_loc').find('input').val();
                    gkClientInterface.moveSyncFile(syncPath);
                }
            }
        });
        //选择同步位置
        $('.sync-position').click(function () {
            var d = gkClientInterface.selectSyncFile('{"name":' + $('.sync').find('input').val() + ',"type":3}');
            return;
        });
        //虚拟盘转文件夹
        $('.virtual-change').on('click', function(){
            var d = gkClientInterface.getBindPath();
            if (d != '') {
                $('.virtual_loc').hide().siblings('.sync_loc').show().find('input').val(d);
                gkClientInterface.changeDriveMode({
                    diskpath: d,
                    type: 0
                });
            }
        });
        //修改虚拟盘密码
        $('.virtual-pwd').on('click', function(){
            gkClientInterface.openChildWindow({
                url: 'settings/html/chs/reset_pwd.html',
                width: 340,
                height: 380
            });
        });
        //删除虚拟盘
        $('.virtual-del').on('click', function(){
            gkClientInterface.openChildWindow({
                url: 'settings/html/chs/delete_virtual.html',
                width: 340,
                height: 380
            });
        });
    },
    initUI: function () {
        //头部切换
        $('#header li').on('click', function () {
            var target = $(this).data('target');
            $(this).addClass('selected').siblings().removeClass('selected');
            $('.' + target).show().siblings().hide();
            return;
        });

        //填充选项
        var config = this.getConfig();
        $('#configTmpl').tmpl({configs: config.baseconfig}).appendTo($('.basic_setting'));
        $('#configTmpl').tmpl({configs: config.gjconfig}).appendTo($('.advance_setting'));

        if (this.clientInfo.proxy == 1) {
            $('.chk.use_proxy').addClass('checked');
        } else {
            $('.chk.use_proxy').removeClass('checked');
        }

        //检查是否登录
        if (typeof gkClientInterface.getUserInfo() === 'undefined') {
            $('button[checkLogin]').addClass('disabled').css('color', '#999');
        }
    },
    initData: function () {
        //初始化版本
        $('.version').html(L('sync_client_version') + ': ' + navigator.userAgent.substring(navigator.userAgent.indexOf(';') + 1, navigator.userAgent.indexOf(';W')));
        //个人信息
        var userInfo = gkClientInterface.getUserInfo();
        $('#layout_member_info').tmpl({
            photourl: userInfo ? userInfo.photourl : 'http://oss.aliyuncs.com/gkavatar2/e2/e29aff5326885a7a675a8ff46b6b08ba1e377b06.jpg',
            computer_name: this.clientInfo.computername,
            username: this.clientInfo.username || L('unlogin')
        }).appendTo($('.person_message'));
        //设置配置文件位置
        $('.config_loc').find('input').val(this.clientInfo.configpath);
        //设置配置文件位置
        $('.sync_loc').find('input').val(this.clientInfo.bindpath);

        var syncInfo = gkClientInterface.getSyncInfo();
        if(syncInfo.type == 'disk'){
            $('.sync_loc').hide().siblings('.virtual_loc').show().find('input').val(syncInfo.path);
            $('.virtual_loc label').next().text('(' + Util.Number.bitSize(syncInfo.size) + ')');
        }
    },
    //获取设置权限
    getConfig: function () {
        var config = {
                baseconfig: {},
                gjconfig: {}
            };
        var clientInfo = this.clientInfo;
        var names = {
            'auto': L('start_gokuai_on_system_startup'),
            'classic': L('revert_to_the_classic_contextmenu'),
            'https': L('enable_https_contection'),
            'local': L('enable_lan_sync'),
            'lock': L('select_lock_file_remind_me_by_desktop_notification'),
            'prompt': L('show_desktop_notifications'),
            'recycle': L('other_members_del_my_share_folders_tip'),
            'shelltool': L('enable_gokuai_explorer_sidebar')
        };
        var advances = ['https', 'local'];
        for (var k in clientInfo) {
            if(!names[k]){
                continue;
            }
            var tempConfig = {};
            tempConfig['k'] = k;
            tempConfig['checked'] = (clientInfo[k] == 1) ? 'checked' : '';
            tempConfig['name'] = names[k];
            if ($.inArray(k, advances) > -1) {
                config.gjconfig[k] = tempConfig;
            } else {
                config.baseconfig[k] = tempConfig;
            }
        }
        return config;
    },
    getFeatureSetting: function () {
        if (!this.clientInfo) {
            this.clientInfo = gkClientInterface.getClientInfo();
        }
        var featureSettings = {
            auto: {
                checked: this.clientInfo.auto == 1,
                name: L('start_gokuai_on_system_startup')
            },
            rightmenu: {
                checked: this.clientInfo.rightmenu == 1,
                name: L('enable_gokuai_explorer_contextmenu')
            },
            prompt: {

            }
        };
        return featureSettings;
    },
    initDialog: function(){
        this.clientInfo = gkClientInterface.getClientInfo();
        $('.setting_dialog .cancel').on('click', function(){
            gkClientInterface.closeWindow();
        });
        //修改虚拟盘密码
        var resetPwdFrom = $('.reset_virtual_pwd');
        $('.form_item_title em',resetPwdFrom).text(this.clientInfo.username);
        $('.purple_btn',resetPwdFrom).on('click', function(){

        });
    }
};