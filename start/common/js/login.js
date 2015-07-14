jsMD5_Typ = 'Typ32';
var gkClientLogin = {
    //载入时菊花的参数设置
    loadingIcon : {
        lines: 9, // The number of lines to draw
        length: 4, // The length of each line
        width: 2, // The line thickness
        radius: 3, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#FFF', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    },
    setHash: function(ac) {
        location.hash = '#!' + ac;
    },
    fetchHash: function() {
        var hash = location.hash, ac = hash.substr(2);
        if (!ac.length) {
            ac = 'login_p2';
        }
        gkClientLogin.showPage('#' + ac);
    },
    fixMacSiteDomain:function(siteDomain){
        if(gkClientInterface.getClientOS()=='mac' && Util.Browser.compareVersion(gkClientInterface.getClientVersion(),'2.1.5.0')<0 ){
            return siteDomain.replace(/(http|https):\/\//,'');
        }
        return siteDomain;
    },
    init: function() {
        var key = gkClientInterface.getOauthKey();

        //disable浏览器的默认事件
        gkClientCommon.disableDefaultEvent();
        $(window).on('hashchange', function() {
            gkClientLogin.fetchHash();
        });
        $('input[type="radio"]:checked').parents('.from_raw').removeClass('selected').addClass('selected');
        $('input[type="radio"]').change(function() {
            var from_raw = $(this).parents('.from_raw');
            if (this.checked) {
                from_raw.siblings('.from_raw').removeClass('selected');
                from_raw.addClass('selected');
            }
        });
        $('.from_raw').click(function() {
            var _self = $(this);
            var input_radio = $(this).find('input[type="radio"]');
            if (input_radio.size()) {
                _self.siblings('.from_raw').removeClass('selected');
                _self.addClass('selected');
                input_radio[0].checked = true;
            }
        });
        var hash = location.hash;
        var ac = hash.substr(2);

        if (!ac.length) {
            gkClientLogin.setHash('login_p2');
        } else {
            gkClientLogin.fetchHash();
        }
        //上一步
        $('.btn_prev').on('click', function() {
            history.back();
            return;
        });

        //登陆下一步
        $('#form_login_from').on('submit', function() {
            var t = $('#form_login_from input:checked').val();
            gkClientLogin.setHash(t);
            return false;
        });

        //登陆
        $('#form_login').on('submit', function() {
            var email = $.trim($(this).find('input[name="email"]').val());
            var password = $.trim($(this).find('input[name="password"]').val());
            if (!email.length) {
                alert(L('please_input_your_id'));
                return false;
            }
            if (!Util.Validation.isEmail(email)) {
                alert(L('index_find_password_invalid_email_format'));
                return false;
            }
            if (!password.length) {
                alert(L('please_input_your_password'));
                return false;
            }
            var loginBtn = $(this).find('button[type="submit"]');
            var param = {
                'username': email,
                'password': MD5(password)
            };
            var spinner = new Spinner(gkClientLogin.loadingIcon).spin(loginBtn);
            loginBtn.append(spinner.el);
            gkClientInterface.login(param);
            return false;
        });
        //企业用户登陆
        $('#ent_login_form').on('submit', function() {
            var ent_id = $.trim($(this).find('input[name="ent_id"]').val());
            if (!ent_id.length) {
                alert(L('pls_enter_team_code'));
                return false;
            }
            var siteDomain = gkClientInterface.getSiteDomain();

            /**
             * 如果是mac客户端，并且版本小于2.1.5.0时oauth不用传http://
             */

            siteDomain = gkClientLogin.fixMacSiteDomain(siteDomain);

            var params = {
                url: siteDomain + '/account/oauth?oauth=' + ent_id + '&key=' + key + '&gk=1',
                width: 500,
                height: 485,
                resize: 0,
                sso: 0
            };
            gkClientInterface.openWindow(params);
            return false;
        });

        //注册帐号
        $('.go2regist').on('click', function() {
            var param = {
                url: gkClientInterface.getSiteDomain() + '/regist',
                sso: 0
            };
            gkClientInterface.openURL(param);
            //gkClientLogin.setHash('login_p9');
            return false;
        });

        //找回密码
        $('#btn_findpassword').on('click', function() {
            var param = {
                url: gkClientInterface.getSiteDomain() + '/findpassword',
                sso: 0
            };
            gkClientInterface.openURL(param);
            return;
        });

        //网络设置
        $('.network_settings').on('click', function() {
            gkClientInterface.settings();
            return;
        });

        //使用第三方帐号
        $('.oauth_btn.btn').on('click', function() {
            var oauth = $(this).attr('name');
            /**
             * 如果是mac客户端，并且版本小于2.1.5.0时oauth不用传http://
             */

            var siteDomain = gkClientLogin.fixMacSiteDomain(gkClientInterface.getSiteDomain());
            var oauthURL = siteDomain + '/account/oauth?oauth=' + oauth + '&key=' + gkClientInterface.getOauthKey();
            if(oauth=='qq'){
                //oauthURL+='&display=mobile';
            }
            gkClientInterface.openWindow({
                url: oauthURL,
                sso: 0,
                resize: 1,
                width: 700,
                height: 500
            });
            return false;
        });

        //注册
        $('.login_page #regist_form').on('submit', function() {
            var email = $.trim($(this).find('input[name="email"]').val());
            if (!email.length) {
                alert(L('pls_enter_your_email_address'));
                return false;
            }
            if (!Util.Validation.isEmail(email)) {
                alert(L('invalid_email_format'));
                return false;
            }
            var flag = {};
            $.gkAjax({
                url: gkClientInterface.getSiteDomain() + '/account/regist_email_check',
                data: {
                    email: email
                },
                async: false,
                callSuccess: function(data) {
                    flag = data;
                }
            });
            if (flag.state) {
                alert(L('index_exsit_id'));
                return false;
            }
            var registBtn = $('#regist_form button[type="submit"]');
            var spinner = new Spinner(gkClientLogin.loadingIcon).spin(registBtn);
            registBtn.append(spinner.el);
            $.ajax({
                url: gkClientInterface.getSiteDomain() + '/regist/regist_by_email',
                data: {
                    email: email
                },
                dataType: 'json',
                success: function() {
                    alert(L('resend_regist_email'));
                    registBtn.find('.spinner').remove();
                    registBtn.removeAttr('disabled');
                },
                error: function(request, textStatus, errorThrown) {
                    var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                    registBtn.removeAttr('disabled');
                    registBtn.find('.spinner').remove();
                    alert(errorMsg);
                }
            });
            return false;
        });

        //是否使用上一步同步设置
        $('#login_p13 form').on('submit', function() {
            var val = $(this).find('input[name="use_old_settings"]:checked').val();
            if (val == 1) {//使用上一次的同步设置
                var param = {
                    path: 0
                };
                gkClientInterface.finishSettings(param);
            } else {//不使用上一次的同步设置
                if ($("#login_p3 .btn_prev")) {
                    $('#login_p3 .btn_prev').remove();
                }
                var prev = $("<button type='button' class='btn_prev'>"+L('next_step')+"</button>");
                prev.on('click', function() {
                    history.back();
                    return;
                });
                $('#login_p3 form .right').prepend(prev);

                gkClientLogin.setHash('login_p3');
            }
            return false;
        });
        $('#login_p13 form').on('click', function() {
            var val = $(this).find('input[name="use_old_settings"]:checked').val();
            if (val == 1) {
                $(this).find(':button').html(L('done'));
            }
            else {
                $(this).find(':button').html(L('next_step'));
            }
        });

        //同步设置
        $('#login_p3 form').on('submit', function() {
            var _self = $(this);
            var gkSettingsType = $(this).find('input[name="chose_settings"]:checked').val();
            if (gkSettingsType == 1) {//非默认设置
                gkClientLogin.setHash('login_p11');
            } else if(gkSettingsType == 2){
                gkClientLogin.setHash('login_p14');
            } else {//默认设置z
                var defaultPath = gkClientInterface.getNormalPath();
                var isEmpty = gkClientInterface.checkIsEmptyPath(defaultPath);
                if (!parseInt(isEmpty)) {
                    var content = '<div>'+L('synchronize_directory_will_be_overwrite',defaultPath)+'</div>';

                    gkClientModal.show({
                        title: L('pls_choose'),
                        content: content,
                        buttons: [
                            {
                                text: L('rechoose'),
                                click: function() {
                                    gkClientModal.close();
                                }
                            },
                            {
                                text: L('local_files_overwrite_cloud_files'),
                                click: function() {
                                    var overWriteInput = $('input[name="over_write"]');
                                    overWriteInput.val(0);
                                    gkClientModal.close();
                                    var param = {
                                        path: 1,
                                        overwrite: 0
                                    };
                                    gkClientInterface.finishSettings(param);
                                }
                            },
                            {
                                text: L('cloud_files_overwrite_local_files'),
                                click: function() {
                                    var overWriteInput = $('input[name="over_write"]');
                                    overWriteInput.val(1);
                                    gkClientModal.close();
                                    var param = {
                                        path: 1,
                                        overwrite: 1
                                    };
                                    gkClientInterface.finishSettings(param);
                                }
                            }
                        ]
                    });
                } else {
                    var param = {
                        path: 1
                    };
                    gkClientInterface.finishSettings(param);
                }

            }
            return false
        });
        $('#login_p3 form').on('click', function() {
            var val = $(this).find('input[name="chose_settings"]:checked').val();
            if (val) {
                $(this).find('.btn_next').html(L('next_step'));
            } else {
                $(this).find('.btn_next').html(L('done'));
            }
        });


        //选择同步目录
        $('#select_gk_sync_dir').on('click', function(e) {
            var path = gkClientInterface.getBindPath();
            if (path.length) {
                $('#gk_sync_dir').val(path).attr('title', path);
            }
            e.preventDefault();
        });

        //选择同步目录后
        $('#login_p11 form').on('submit', function() {
            var sync_dir = $(this).find('input[name="sync_dir"]:checked').val();
            var path = gkClientInterface.getNormalPath();
            if (sync_dir == 1) {
                path = $(this).find('input[name="gk_sync_dir"]').val();
            }

            var isEmpty = gkClientInterface.checkIsEmptyPath(path);
            if (!parseInt(isEmpty)) {
                var content = '<div>'+L('synchronize_directory_will_be_overwrite',path)+'</div>';

                gkClientModal.show({
                    title: L('pls_choose'),
                    content: content,
                    buttons: [
                        {
                            text: L('rechoose'),
                            click: function() {
                                gkClientModal.close();
                            }
                        },
                        {
                            text: L('local_files_overwrite_cloud_files'),
                            click: function() {
                                var overWriteInput = $('input[name="over_write"]');
                                overWriteInput.val(0);
                                gkClientModal.close();
                                gkClientLogin.setHash('login_p12');
                            }
                        },
                        {
                            text: L('cloud_files_overwrite_local_files'),
                            click: function() {
                                var overWriteInput = $('input[name="over_write"]');
                                overWriteInput.val(1);
                                gkClientModal.close();
                                gkClientLogin.setHash('login_p12');
                            }
                        }
                    ]
                });
            } else {
                gkClientLogin.setHash('login_p12');
            }

            return false
        });

        //选择性同步
        $('#select_sync_dirs').on('click', function(e) {
            gkClientInterface.selectSyncFile();
            e.preventDefault();
        });

        //选择性同步下一步
        $('#login_p12 form').on('submit', function() {
            var path = 1, syncnode = 0;
            var sync_dir = $('input[name="sync_dir"]:checked').val();
            var chose_dir = $('input[name="chose_dir"]:checked').val();
            var overwrite = $('input[name="over_write"]').val();
            if (sync_dir == 1) {
                path = 2;
            }
            if (chose_dir == 1) {
                syncnode = 1;
            }
            var param = {
                path: path,
                syncnode: syncnode
            };
            if (overwrite.length) {
                param.overwrite = parseInt(overwrite);
            }
            param = gkClientLogin.checkVirtual(param);
            //console.log(param);
            gkClientInterface.finishSettings(param);
            return false;
        });

//        var qrImg = $('<img class="qrcode" alt="您的网络似乎有问题，请检查您的网络连接。" src="' + gkClientInterface.getSiteDomain() + '/account/get_login_qr?key=' + key + '&client=1" />');
//        if ($('.slide_banner .qr_img').size()) {
//            $('.slide_banner .qr_img').prepend(qrImg);
//        }
        //幻灯片运行
        gkClientLogin.bindUI();
        //检测二维码登录 
        var checkLogin = function(key) {
            $.ajax({
                url: gkClientInterface.getSiteDomain() + '/account/check_client_qr_login',
                dataType: 'json',
                type: 'post',
                data: {
                    key: key,
                    client: 1
                },
                success: function(logined) {
                    if (logined == 1) {
                        gkClientInterface.loginByKey();
                    }
                },
                error: function() {

                }
            });
        };

//        var loginCheckTimer = setInterval(function() {
//            if (location.hash == '#!login_p2') {
//                checkLogin(key);
//            }
//        }, 5000);
        //checkLogin(key);
        this.initVirtual();
    },
    //绑定UI事件
    bindUI: function() {
        //slide效果
        var slide = function(scope) {
            $('h1', scope).on('click', function(){
                if (!$(this).hasClass('fold')) {
                    return;
                }
                $(this).parent().siblings().find('.content').slideUp('fast', function() {
                    $(this).prev().addClass('fold');
                });
                $(this).next('.content').slideDown('fast', function() {
                    $(this).prev().removeClass('fold');
                });
            });
        };
        slide($('#login_p2'));
    },
    showPage: function(target) {
        $('.login_page').hide().eq(target).show();
        $('.login_page').filter(target).show();
        if (target == '#login_p11') {
            var defaultPath = gkClientInterface.getNormalPath();
            $('#default_gk_sync_dir').text(defaultPath);
            $('#gk_sync_dir').val(defaultPath).attr('title', defaultPath);
        } else if (target == '#login_p14') {
            var drives = gkClientInterface.getDiskInfo();
            var drive_list = drives['list'];
            var options = '';
            for (var i in drive_list) {
                var drive = drive_list[i];
                var value = L('local_drive',drive['name'], Util.Number.bitSize(drive['free'], 0));
                options += '<option value="' + drive['name'] + ':\\" free="' + drive['free'] + '">' + value + '</option>';
            }
            $('.local_drives').html(options);
        }
    },
    showClientGuild: function(step) {
        var steps = $('.client_guild');
        steps.eq(step).show();
        gkClientInterface.toogleArrow(0);
        if (step == 3) {
            gkClientInterface.toogleArrow(1);
        }
    },
    choseSyncType: function() {

    },

    //虚拟盘相关
    initVirtual: function () {
        //虚拟盘设置
        var virtualForm = $('#is_virtual_settings');
        var checkSize = function () {
            var freeSize = parseInt($('.local_drives :selected', virtualForm).attr('free'));
            var setSize = parseInt($('#virtual_size', virtualForm).val());
            $('#virtual_size', virtualForm).val(setSize);
            if (!setSize) {
                return [0, L('pls_set_virtual_size')];
            }
            var err = $('.err', virtualForm);
            if (setSize * 1024 * 1024 * 1024 > freeSize) {
                err.show().text(L('virtual_beyond_size'));
                return [0, L('virtual_beyond_size')];
            } else {
                err.hide();
                return [1];
            }
        };
        $('#virtual_size', virtualForm).on('blur', function () {
            checkSize();
        }).on('keydown', function (e) {
                if (e.keyCode > 47 && e.keyCode < 58 || e.keyCode > 95 && e.keyCode < 106 || $.inArray(e.keyCode, [8, 9, 13, 37, 39]) > -1) {
                    return true;
                } else {
                    return false;
                }
            });
        $('.local_drives', virtualForm).on('change', function () {
            checkSize();
        });
        virtualForm.on('submit', function () {
            var result = checkSize();
            if (!result[0]) {
                alert(result[1]);
                return false;
            }
            gkClientLogin.setHash('login_p15');
            return false;
        });
        //虚拟盘密码设置
        var virtualPwdForm = $('#is_virtual_password_settings');
        var checkPwd = function () {
            var pwd = $('#virtual_password', virtualPwdForm).val();
            var rpwd = $('#re_virtual_password', virtualPwdForm).val();
            var err = $('.err', virtualPwdForm);
            if (!pwd.length) {
                return [0, L('pls_set_password')];
            }
            if (pwd.length < 6){
                err.show().text(L('password_great_then', 6));
                return [0, L('password_great_then', 6)];
            }else{
                err.hide();
            }
            if (pwd != rpwd) {
                err.show().text(L('passwords_do_not_match'));
                return [0, L('passwords_do_not_match')];
            } else {
                err.hide();
                return [1];
            }
        };
        $('#re_virtual_password', virtualPwdForm).on('blur', function () {
            checkPwd();
        });
        virtualPwdForm.on('submit', function () {
            var result = checkPwd();
            if (!result[0]) {
                alert(result[1]);
                return false;
            }
            gkClientLogin.setHash('login_p12');
            return false;
        });
        //虚拟盘登录
        var virtualLoginForm = $('#is_virtual_login');
        virtualLoginForm.on('submit', function(){
            var password = $(this).find('#virtual_login_password');
            var loginBtn = $(this).find('button[type="submit"]');
            var spinner = new Spinner(gkClientLogin.loadingIcon).spin(loginBtn);
            loginBtn.append(spinner.el);
            if(!gkClientInterface.checkPassword(MD5(password.val()), 'disk')){
                loginBtn.find('.spinner').remove();
                $('.info', virtualLoginForm).show();
                alert(L('password_error'));
            };
            return false;
        });
    },
    //完成时检测虚拟盘
    checkVirtual: function(params){
        var virtualForm = $('#is_virtual_settings');
        var virtualPwdForm = $('#is_virtual_password_settings');
        var virtualSize = parseInt($('#virtual_size', virtualForm).val());
        if(!virtualSize){
            return params;
        }
        var password = $('#virtual_password', virtualPwdForm).val();
        params.size = virtualSize * 1024 * 1024 * 1024;
        params.password = MD5(password);
        params.diskpath = $('.local_drives', virtualForm).val();
        params.prompt = $.trim($('#virtual_password_prompt', virtualPwdForm).val());
        params.path = 3;
        return params;
    }
};

var gkClientModal = {
    show: function(params) {
        var _self = this;
        var settings = params;
        var overlay = $('<div class="overlay"></div>');
        var modal = $('<div class="modal"></div>');
        var content = $('<div class="modal_content"></div>');
        var close = $('<a href="javascript:void(0)" class="modal_close"></a>');
        content.append(settings.content);
        modal.append(content).append(close);
        $('body').append(overlay).append(modal);
        if (!settings.height) {
            settings.height = 200;
        }
        if (!settings.width) {
            settings.width = 400;
        }
        modal.css({
            'top': '50%',
            'left': '50%',
            'width': settings.width,
            'height': settings.height,
            'margin-top': settings.height * -0.5,
            'margin-left': settings.width * -0.5
        });
        if (settings.title && settings.title.length) {
            var top = $('<div class="modal_top">' + settings.title + '</div>');
            modal.prepend(top);
        }
        if (settings.buttons.length) {
            var bottom = $('<div class="modal_bottom"></div>');
            modal.append(bottom);
            $.each(settings.buttons, function(i, n) {
                var button = $('<button type="button">' + n.text + '</button>');
                bottom.append(button);
                button.click(function() {
                    n.click();
                });
            });
        }
        close.on('click', function() {
            _self.close();
            return;
        });
    },
    close: function() {
        $('body > .overlay').remove();
        $('body > .modal').remove();
    }
};

/*登录后客户端的回调函数*/
function gLoginResult(data) {
    var loginBtn = $('#form_login button[type="submit"]');
    loginBtn.removeAttr('disabled');
    loginBtn.find('.spinner').remove();
    if (!data) {
        gkClientInterface.showError(L('response_date_is_empty'));
        return;
    }
    var rep = JSON.parse(data);
    if (!rep) {
        gkClientInterface.showError(L('invalid_data'));
        return;
    }
    if (rep.error != 0) {
        var message = rep.message;
        if(rep.error == '10015'){
            message = '您所在团队服务已过期，请让团队管理员联系客服升级到够快云库';
        }
        gkClientInterface.showError(message);
        if(rep.error == '10044'){
            var param = {
                url: 'http://www.gokuai.com/software/',
                sso: 0
            };
            gkClientInterface.openURL(param);
            return;
        }
        //第三方登录失败
        if (rep.type == "weblogin") {
            gkClientLogin.setHash('login_p2');
        } else {
            gkClientLogin.setHash('login_p2');
        }
        return;
    }

    if (gkClientInterface.checkLastPath()) {
        gkClientLogin.setHash('login_p13');
    } else {
        gkClientLogin.setHash('login_p3');
    }
}