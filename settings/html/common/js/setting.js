jsMD5_Typ = 'Typ32';
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
        //语言修改
        $('#select_language').on('change', function(){
            var language = $(this).val();
            if(language != lang){
                var type = 0;
                switch (language){
                    case 'zh-cn':
                        type = 1;
                        break;
                    case 'en-us':
                        type = 2;
                        break;
                }
                gkClientInterface.changeLanguage(type);
            }
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
            var old = $('.sync_loc').find('input').val();
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
        //文件夹转虚拟盘
        $('.sync-change').on('click', function(){
            gkClientInterface.openChildWindow({
                url: '/html/chs/virtual_mode.html',
                type: 1,
                width: 340,
                height: 380
            });
        });
        //虚拟盘转文件夹
        $('.virtual-change').on('click', function(){
            var d = gkClientInterface.getBindPath();
            if (d != '') {
                $('.virtual_loc').hide().siblings('.sync_loc').show().find('input').val(d);
                gkClientInterface.changeDiskMode({
                    diskpath: d,
                    type: 0
                });
            }
        });
        //修改虚拟盘密码
        $('.virtual-pwd').on('click', function(){
            gkClientInterface.openChildWindow({
                url: '/html/chs/reset_pwd.html',
                type: 1,
                width: 340,
                height: 380
            });
        });
        //删除虚拟盘
        $('.virtual-del').on('click', function(){
            gkClientInterface.openChildWindow({
                url: '/html/chs/delete_virtual.html',
                type: 1,
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
        //当前语言
        $('#select_language option[value="' + lang + '"]').attr('selected', true);
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
        $('.form_item_title h1', resetPwdFrom).html(L('edit_virtual_password_now', '<em>' + this.clientInfo.username + '</em>'));
        $('.purple_btn',resetPwdFrom).on('click', function(){
            var password = $('#password', resetPwdFrom).val(),
                old_password = $('#old_password', resetPwdFrom).val(),
                confirm_password = $('#confirm_password', resetPwdFrom).val(),
                prompt = $('#prompt', resetPwdFrom).val();
            if (!old_password.length) {
                alert(L('pls_input_current_password'));
                return;
            }
            if (!password.length) {
                alert(L('pls_set_password'));
                return;
            }
            if (password.length < 6){
                alert(L('password_great_then', 6));
                return;
            }
            if(password != confirm_password){
                alert(L('passwords_do_not_match'));
                return;
            }
            var result = gkClientInterface.changeDiskPassword(MD5(old_password), MD5(password), prompt);
            if(!result){
                alert(L('edit_virtual_password_error'));
            }
            return;
        });
        //删除虚拟盘
        var deleteVirtualFrom = $('.delete_virtual_dialog');
        $('.purple_btn',deleteVirtualFrom).on('click', function(){
            var password = $('#password', deleteVirtualFrom).val();
            if(gkClientInterface.deleteDisk(MD5(password))){

            }
            return;
        });
        //转到虚拟盘模式
        var virtualMode = $('.virtual_mode');
        if (virtualMode.size()) {
            var virtualSizeForm = $('#set_virtual_size');
            var drives = gkClientInterface.getDiskInfo();
            var drive_list = drives['list'];
            var options = '';
            for (var i in drive_list) {
                var drive = drive_list[i];
                var value = L('local_drive', drive['name'], Util.Number.bitSize(drive['free'], 0));
                options += '<option value="' + drive['name'] + ':\\" free="' + drive['free'] + '">' + value + '</option>';
            }
            $('select', virtualSizeForm).html(options);

            var initPage = function(){
                var hash = location.hash || '#step1';
                hash = hash.replace('#', '');
                $('.step', virtualMode).hide();
                $('.' + hash, virtualMode).show();
            }

            initPage();
            $(window).on('hashchange', function(){
                initPage();
            });

            $('.btn_prev', virtualMode).on('click', function () {
                history.back();
                return;
            });
            $('.btn_next', virtualMode).on('click', function () {
                var hash = location.hash || '#step1';
                hash = hash.replace('#', '');
                $('form.' + hash).submit();
                return;
            });
            $('#check_login').on('submit', function(){
                var user_password = $('#user_password', $(this)).val();
                if (gkClientInterface.checkPassword(MD5(user_password), 'user')) {
                    location.hash = 'step2';
                } else {
                    alert(L('password_error'));
                }
                return false;
            });


            //虚拟盘设置
            var virtualSizeForm = $('#set_virtual_size');
            var checkSize = function () {
                var freeSize = parseInt($('.local_drives :selected', virtualSizeForm).attr('free'));
                var setSize = parseInt($('#virtual_size', virtualSizeForm).val());
                if (!setSize) {
                    return [0, L('pls_set_virtual_size')];
                }
                var err = $('.err', virtualSizeForm);
                if (setSize * 1024 * 1024 * 1024 > freeSize) {
                    err.text(L('virtual_beyond_size'));
                    return [0, L('virtual_beyond_size')];
                } else {
                    err.text('');
                    return [1];
                }
            };
            $('#virtual_size', virtualSizeForm).on('blur',function () {
                checkSize();
            }).on('keydown', function (e) {
                    if (e.keyCode > 47 && e.keyCode < 58 || e.keyCode > 95 && e.keyCode < 106 || $.inArray(e.keyCode, [8, 9, 13, 37, 39]) > -1) {
                        return true;
                    } else {
                        return false;
                    }
                });
            $('.local_drives', virtualSizeForm).on('change', function () {
                checkSize();
            });
            virtualSizeForm.on('submit', function () {
                var result = checkSize();
                if (!result[0]) {
                    alert(result[1]);
                    return false;
                }
                location.hash = 'step3';
                return false;
            });
            //虚拟盘密码设置
            var virtualPwdForm = $('#set_virtual_password');
            var checkPwd = function (flag) {
                var pwd = $('#virtual_password', virtualPwdForm).val();
                var rpwd = $('#re_virtual_password', virtualPwdForm).val();
                var err = $('.err', virtualPwdForm);
                if (!pwd.length) {
                    return [0, L('pls_set_password')];
                }
                if (pwd.length < 6){
                    err.text(L('password_great_then', 6));
                    return [0, L('password_great_then', 6)];
                }else{
                    err.text('');
                    if(flag){
                        return;
                    }
                }
                if (pwd != rpwd) {
                    err.text(L('passwords_do_not_match'));
                    return [0, L('passwords_do_not_match')];
                } else {
                    err.text('');
                    return [1];
                }
            };
            $('#virtual_password,#re_virtual_password', virtualPwdForm).on('blur', function () {
                checkPwd($(this).attr('id') == 'virtual_password');
            });
            virtualPwdForm.on('submit', function () {
                var result = checkPwd();
                if (!result[0]) {
                    alert(result[1]);
                    return false;
                }
                var virtualSize = parseInt($('#virtual_size', virtualSizeForm).val()),
                    diskPath = $('.local_drives', virtualSizeForm).val(),
                    password = $('#virtual_password', virtualPwdForm).val(),
                    prompt = $.trim($('#virtual_password_prompt', virtualPwdForm).val());
                var params = {
                    diskpath: diskPath,
                    size: virtualSize * 1024 * 1024 * 1024,
                    password: MD5(password),
                    prompt: prompt,
                    type: 1
                };
                gkClientInterface.changeDiskMode(params);
                gkClientInterface.closeWindow();
                return false;
            });
        }
    }
};