var gkClientSync = {
    init: function () {
        var _context = this;
        _context.showLinkedFile();
        //添加新的同步位置
        $('.add_new_sync').click(function () {
            gkClientInterface.openChildWindow({
                url: 'chs/add_link.html',
                //url: 'default/chs/add_link.html',
                width: 700,
                height: 470
            });
            return;
        });
    },
    showLinkedFile: function () {
        var _context = this;
        var files = _context.formatLinkData(gkClientInterface.getLinkPath().list);
        $('.list_wrapper .list').remove();
        var list = $('#fileListTmpl').tmpl({
            files: files
        }).appendTo($('.list_wrapper'));
        var sync_items = $('.list .sync_item');
        sync_items.each(function () {
            $(this).find('.set').droplist([4, -144, 0, 0]);
        });

        sync_items.find('.local_uri a,.cloud_uri a').click(function () {
            var item = $(this).parents('.sync_item');
            var local_uri = item.attr('data-local_uri');
            console.log(local_uri);
            gkClientInterface.openDiskPath(local_uri);
            return false;
        })
        //设置新的本地同步位置
        $('.edit_local_uri').click(function () {
            var item = $(this).parents('.sync_item');
            var local_uri = String(item.data('local_uri'));
            var cloud_uri = String(item.data('cloud_uri'));
            var type = item.data('type');
            var new_local_uri = gkClientInterface.selectFile({
                path: local_uri,
                disable_root: 1
            });
            if (new_local_uri && local_uri != new_local_uri) {
                var re = gkClientInterface.checkLinkPath(new_local_uri);
                var enable = _context.checkSelectPath(new_local_uri, re, cloud_uri);
                if (!enable) {
                    return;
                }
                var path = [
                    {
                        webpath: cloud_uri,
                        fullpath: new_local_uri,
                        type: type
                    }
                ];
                gkClientInterface.setLinkPath(path);
                var local_filename = _context.getLocalFilename(new_local_uri);
                item.attr('data-local_uri', new_local_uri).attr('data-local_filename', local_filename);
                item.find('.local_uri a').attr('data-original-title', new_local_uri).text(local_filename);
            }
            return;
        });

        //选择性同步
        sync_items.find('.dropdown_menu .select_to_sync').click(function () {
            var item = $(this).parents('.sync_item');
            var local_uri = String(item.data('local_uri'));
            var webpath = String(item.data('cloud_uri'));
            var params = {
                webpath: webpath,
                type: item.data('type'),
                close: 0
            };
            gkClientInterface.selectSyncFile(params);
            return;
        });

        //取消映射
        sync_items.find('.dropdown_menu .remove_sync').click(function () {
            var item = $(this).parents('.sync_item');
            var webpath = String(item.data('cloud_uri'));
            if (!webpath) {
                return;
            }
            var links = [
                {
                    webpath: webpath
                }
            ];
            gkClientInterface.removeLinks(links);
            item.fadeOut(function () {
                item.remove();
            });
            return;
        });
    },
    showFileTree: function (dialog, mount_id,path) {
        var setCloudFile = function (path, icon, type) {
            var filename = Util.String.baseName(path);
            dialog.find('.selected_cloud_file').remove();
            var html = '<div class="d_content selected_cloud_file" style="display: none">';
            html += '<div><i class="' + icon + '"></i><span>' + filename + '</span></div>';
            html += '<div>';
            html += '<div>云端位置</div>';
            html += '<div><span id="select_cloud_file_path" data-type="' + type + '">' + path + '</span></div>';
            html += '</div>';
            html += '</div>';
            dialog.append(html);
        };
        var _context = this;
        var setting = {
            treeId: 'gk_cloud_file_list',
            async: {
                enable: true,
                url: function (treeId, treeNode) {
                    var path = '';
                    if (treeNode) {
                        path = treeNode['data-fullpath'];
                    }
                    return gkClientInterface.getRestDomain() + '/' + path;
                },
                dataType: "json",
                type: "LIST",
                headers: function (treeId, treeNode) {
                    var dateStr = new Date().toUTCString();
                    var path = '';
                    if (treeNode) {
                        path = treeNode['data-fullpath'];
                    }
                    var webpath = Util.String.encodeRequestUri(path);
                    var sign = gkClientInterface.getAuthorization('list', webpath, dateStr);
                    var headers = {
                        'x-gk-mount': mount_id,
                        'x-gk-dir': 1,
                        'x-gk-bool': 1,
                        'Date': dateStr,
                        'Authorization': sign
                    };
                    return headers;
                },
                dataFilter: function (treeId, parentNode, data) {
                    var treeData = [];
                    if (parentNode === undefined) {
                        var teamFiles = data.team_files;
                        var myFiles = data.my_files;
                        var teamTree = {
                            'tId': '1',
                            'name': '团队的文件',
                            'iconSkin': 'file_icon icon_team_root ',
                            'className': '',
                            'fullpath': '',
                            'open': true,
                            'isParent': teamFiles && teamFiles.length,
                            'data-hash': '',
                            'data-fullpath': '',
                            'data-filename': '团队的文件',
                            'data-icon': 'icon_team_root',
                            'data-type': 2,
                            'children': _context.rendFileList(teamFiles, parentNode,2)
                        };
                        var myTree = {
                            'tId': '2',
                            'name': '个人的文件',
                            'iconSkin': 'file_icon icon_my_root ',
                            'className': '',
                            'open': true,
                            'fullpath': '',
                            'isParent': myFiles && myFiles.length,
                            'data-hash': '',
                            'data-fullpath': '',
                            'data-filename': '个人的文件',
                            'data-icon': 'icon_my_root',
                            'data-type': 1,
                            'children': _context.rendFileList(myFiles, parentNode,1)
                        };
                        treeData.push(myTree);
                        if (PAGE_CONFIG.orgId != 0) {
                            treeData.push(teamTree);
                        }

                    } else {
                        if (data && data.list) {
                            treeData = _context.rendFileList(data.list, parentNode,data.org_share==1?2:1);
                        }
                    }
                    return treeData;
                }
            },
            callback: {
                onAsyncError:function(){

                },
                onAsyncSuccess: function (event, treeId, treeNode, msg) {
                    var items;
                    if (!treeNode) {
                        items = dialog.find('.file_item');
                    } else {
                        var treeObj = $.fn.zTree.getZTreeObj(treeId);
                        var node = treeObj.getNodeByTId(treeNode.tId);
                        items = dialog.find('#' + node.tId + '>ul>li>.file_item');
                    }
                    items.on('click', function () {
                        var path = $(this).data('fullpath');
                        var icon = $(this).data('icon');
                        var type = $(this).data('type');
                        setCloudFile(path, icon, type);
                    })

                    items.click(function (e) {
                        var jItem = $(this);
                        //var parents = $(e.target).parents('.file_item');
                        var nearFileItem = $(e.target).parents('.file_item');
                        if (!$(e.target).is(jItem) && !nearFileItem.is(jItem)) {
                            return;
                        }
                        if (!String(jItem.data('fullpath'))) {
                            if(!path || jItem.data('type')!=1){
                                return;
                            }
                        }
                        if (!jItem.hasClass('selected')) {
                            dialog.find('.file_item.selected').removeClass("selected");
                            jItem.addClass("selected");
                        } else {
                            jItem.toggleClass("selected");
                        }
                    });
                }
            }
        };
        var zTreeObj = $.fn.zTree.init(dialog.find('.team_share_tree'), setting);
    },
    rendFileList: function (files, parentNode,type) {
        var _context = this;
        var renderList = [];
        if (files && files.length) {
            $.each(files, function (i, n) {
                n.icon = 'icon_folder';
                var node = _context.rendFileItem(n, parentNode,type);
                if (i + 1 == files.length) {
                    node['className'] += ' last_file_item';
                }
                renderList.push(node);
            });
        }
        return renderList;
    },
    rendFileItem: function (n, parentNode,type) {
        var name = n.filename;
        var isShare = n.share == 1 || n.cmd > 999;
        if (isShare) {
            n.icon = 'icon_shared_folder';
        } else {
            n.icon = 'icon_folder';
        }
        var icon = 'file_icon ' + n.icon + ' ';
        if (!isShare && parentNode && (parentNode["data-share"] == 1 || parentNode["data-cmd"] > 999)) {
            icon = parentNode["iconSkin"];
        }
        var item = {
            'tId': n.hash,
            'name': name,
            'iconSkin': icon,
            'className': '',
            'fullpath': n.fullpath,
            'isParent': n.has_child == 1 ? true : false,
            //'isParent':true,
            'data-hash': n.hash,
            'data-dir': n.dir,
            'data-fullpath': n.fullpath,
            'data-filename': n.filename,
            'data-icon': icon,
            'data-share': n.share,
            'data-local': n.local,
            'data-cmd': n.cmd,
            'data-type': type
        };
        return item;
    },
    showStartSyncDialog: function (cloud_settings, local_path, parentDialog) {
        var _context = this;
        var webpath = cloud_settings.webpath;
        var filename = cloud_settings.filename;
        var type = cloud_settings.type;
        var html = $('#startSyncDialog').tmpl({
            filename: filename,
            local_path: local_path
        });
        html.gkDialog({
            width: 400,
            title: '即将开始同步',
            dialogClass: 'start_sync_dialog',
            buttons: [
                {
                    "text": '取消',
                    'class': 'btn',
                    "click": function () {
                        $(this).dialog("close");
                    }
                },
                {
                    "text": '选择性同步',
                    'class': 'btn blue_btn',
                    "click": function () {
                        var params = {
                            webpath: webpath,
                            type: type,
                            fullpath: local_path,
                            close: 1
                        };
                        gkClientInterface.selectSyncFile(params);

                        return;
                    }
                },
                {
                    "text": '全部同步',
                    'class': 'btn blue_btn start_now',
                    "click": function () {
                        var paths = [
                            {
                                'webpath': webpath,
                                'fullpath': local_path,
                                'type': type
                            }
                        ];
                        gkClientInterface.setLinkPath(paths);
                        $(this).dialog('close');
                        if (parentDialog.size()) {
                            //window.parent.showLinkedFile();
                            //gkClientInterface.closeWindow();
                        } else {
                            _context.showLinkedFile();
                        }

                        return;
                    }
                }
            ]
        });
    },
    getLocalFilename: function (local_path) {
        var re_fullpath = local_path.replace(/\\/g, '/');
        var local_filename = Util.String.baseName(Util.String.rtrim(re_fullpath, '/'));
        return local_filename;
    },
    formatLinkData: function (paths) {
        var _context = this;
        var files = [];
        $.each(paths, function (k, v) {
            var icon = 'icon_folder';
            var local_filename = _context.getLocalFilename(v.fullpath);
            var cloud_filename = '';
            if (v.type == 1) {
                icon = 'icon_my_root';
                cloud_filename = '我的文件';
            } else if (v.type == 2) {
                icon = 'icon_team_root';
                cloud_filename = '团队文件';
            } else {
                cloud_filename = Util.String.baseName(v.webpath);
                ;
                if (v.local > 0) {
                    icon = 'icon_local_folder';
                } else if (v.share == 1) {
                    icon = 'icon_shared_folder';
                }
            }
            var cloud_url = _context.getFileLocation(v.webpath, 1, 0);
            var local_url = cloud_url;
            var item = {
                type: v.type,
                icon: icon,
                local_url: local_url,
                local_uri: v.fullpath,
                local_filename: local_filename,
                cloud_uri: v.webpath,
                cloud_url: cloud_url,
                cloud_filename: cloud_filename,
                removeAvaiable: v.type <= 0
                //removeAvaiable:true
            };
            files.push(item);
        })
        return files;
    },
    getFileLocation: function (fullpath, dir, showDel) {
        var pre = '/storage';
        var location = pre + '#!files:' + showDel + ':';
        if (!fullpath.length) {
            return location;
        }
        if (!$.isNumeric(dir)) {
            dir = Util.String.lastChar(fullpath) == '/' ? 1 : 0;
        }

        fullpath = Util.String.rtrim(fullpath, '/');
        var up_fullpath = Util.String.dirName(fullpath);
        var filename = Util.String.baseName(fullpath) + (dir ? '/' : '');
        location += encodeURIComponent(up_fullpath) + ':' + encodeURIComponent(filename) + ':';
        return location;

    },
    checkSelectPath: function (path, re, cloud_path) {
        var replace_path = path.replace(/\\/g, '/');
        if (re.disabled == 1) {
            var binded_path = re.path;
            var replace_bind_path = binded_path.replace(/\\/g, '/');
            var re = replace_path.replace(new RegExp(replace_bind_path), '');
            var msg = '';
            if (!re || re === '/') {
                msg = '该文件夹已绑定过同步关系，不能再进行绑定';
            } else if (re == replace_path) {
                msg = '该文件夹的下级文件夹 ' + binded_path + ' 已绑定过同步关系，不能再进行绑定';
            } else {
                msg = '该文件夹的上级文件夹 ' + binded_path + ' 已绑定过同步关系，不能再进行绑定';
            }
            alert(msg);
            return false;
        }

        return true;
    },
    initAddLink: function (path) {
        var _context = this;
        var dialog = $('.wrapper');
        var slash = '/';
        var slash_p = '\/';
        if(gkClientInterface.isWindowsClient()){
            slash = '\\';
            slash_p = '\\\\';
        }

        //设置选择的路径
        var setSelectFile = function (path,isLocal,type) {
            var filename = _context.getLocalFilename(path);
            var localSetWrapper = $('.local_set_wrapper');
            var cloudSetWrapper = $('.cloud_set_wrapper');
            var setWrapper = isLocal?localSetWrapper:cloudSetWrapper;
            var input =   setWrapper.find('.selected_file_wrapper .path_input');
            var unselectSpan = setWrapper.find('.selected_file_wrapper .unselected_span');
            var checkbox = dialog.find('.chk');
            if (!path) {
                input.val('').attr('title','').removeAttr('data-type').hide();
                unselectSpan.show();

            } else {
                var screenPath = '';
                if(isLocal){
                    screenPath = Util.String.rtrim(path,'/');
                    screenPath = Util.String.rtrim(screenPath,'\\\\');
                }else{
                    screenPath = path;
                }
                input.val(screenPath).attr('title',screenPath);
                input.show();
                unselectSpan.hide();
                if(!isLocal && typeof type !=='undefined'){
                    input.attr('data-type',type);
                }
            }
            var localPath = localSetWrapper.find('.selected_file_wrapper .path_input').val();
            var cloudPath =  cloudSetWrapper.find('.selected_file_wrapper .path_input').val();

            if(!localPath || !cloudPath){
                checkbox.removeClass('checked').addClass('disabled');
            }else{
                checkbox.removeClass('disabled');
            }
        };

        //checkbox
        dialog.find('.chk').click(function(){
            if($(this).hasClass('disabled')){
                return;
            }
            $(this).toggleClass('checked');
            var flag = false;
          var setWrapper = $(this).parents('.set_wrapper');
          var localPathInput = dialog.find('.local_set_wrapper .selected_file_wrapper .path_input');
            var cloudPathInput = dialog.find('.cloud_set_wrapper .selected_file_wrapper .path_input');
            var cloudPath = $.trim(cloudPathInput.val());
            var localPath = $.trim(localPathInput.val());

            if(setWrapper.hasClass('local_set_wrapper')){ //与云端同名
                var newLocalPath = '';
                if($(this).hasClass('checked')){
                    var cloudFileName = Util.String.baseName(cloudPath);
                    newLocalPath = localPath+slash+cloudFileName;
                }else{
                    var temp_re = localPath.replace(/\\/,'/')
                    var dir_path = Util.String.dirName(temp_re);
                    newLocalPath = dir_path.replace(/\//g,'\\');

                }
                setSelectFile(newLocalPath,1);
            }else{ //与本地同名
                var newCloudPath = '';
                if($(this).hasClass('checked')){
                    var localFileName = _context.getLocalFilename(localPath);
                    newCloudPath = cloudPath+'/'+localFileName;
                }else{
                    newCloudPath = Util.String.dirName(cloudPath);

                    if(path&&(newCloudPath =='个人的文件' || newCloudPath =='团队的的文件')){
                        var flag = true;

                    }
                    if(flag){
                        newCloudPath = '';

                    }
                }
                setSelectFile(newCloudPath,0);

            }
            if(dialog.find('.cloud_set_wrapper .chk').hasClass('checked')){
                dialog.find('.local_set_wrapper .chk').addClass('disabled');
            }else{
                dialog.find('.local_set_wrapper .chk').removeClass('disabled');
            }

            if(dialog.find('.local_set_wrapper .chk').hasClass('checked')){
                dialog.find('.cloud_set_wrapper .chk').addClass('disabled');
            }else{
                dialog.find('.cloud_set_wrapper .chk').removeClass('disabled');
            }
            if(flag){
                dialog.find('.set_wrapper .chk').removeClass('checked').addClass('disabled');
            }
            return;
        });

        //选择本地文件
        dialog.find('.select_local_file').on('click', function () {
            var old_path = '';
            var input = dialog.find('#selected_local_path');
            if (input.size()) {
                old_path = $.trim(input.text());
            }
            var new_path = gkClientInterface.selectFile({
                path: old_path,
                disable_root: 1
            });
            if (new_path != old_path) {
                if (new_path) {
                    var re = gkClientInterface.checkLinkPath(new_path);
                    var enable = _context.checkSelectPath(new_path, re);
                    if (!enable) {
                        return;
                    }
                }
                dialog.find('.local_set_wrapper .chk').removeClass('checked');
                setSelectFile(new_path,_context);
            }
            return;
        });

        //选择云端文件
        dialog.find('.select_cloud_file').on('click', function () {
            var dialgoTmpl = $('#selectCloudFileDialog').tmpl();
            dialgoTmpl.gkDialog({
                width: 360,
                height:400,
                title:'选择云端文件夹',
                class:'select_cloud_file_dialog',
                buttons: [
                    {
                        'text': '取消',
                        'click': function () {
                               $(this).dialog('close');
                        }

                    },
                    {
                        'text': '确定',
                        'class': 'blue_btn',
                        click: function () {

                            var webpath = $.trim($(this).find('#select_cloud_file_path').text());
                            var screenpath = webpath;
                            var type = $(this).find('#select_cloud_file_path').data('type');
                            if(type == 1){
                                screenpath = '个人的文件'+(screenpath?'/':'')+screenpath;
                            }else{
                                screenpath = '团队的文件'+(screenpath?'/':'')+screenpath;
                            }
                            var old_path = $.trim(dialog.find('#selected_local_path').text());
                            if(old_path!=screenpath){
                                dialog.find('.cloud_set_wrapper .chk').removeClass('checked');
                            }
                            setSelectFile(screenpath,0,type);
                            if(!webpath && path){
                                dialog.find('.cloud_set_wrapper .chk').removeClass('checked').trigger('click');
                            }
                            $(this).dialog('close');
                        }
                    }
                ],
                open:function(){
                    var mount_id = gkClientInterface.getUserInfo().mount_id;
                    if(mount_id == 0){
                        return;
                    }
                    _context.showFileTree($(this), mount_id,path);
                }
            });
            return;
        });

        //开始同步
        dialog.find('.start_sync').click(function () {
            var local_path = $.trim(dialog.find('.set_wrapper #selected_local_path').val());
            var webpath = $.trim(dialog.find('.set_wrapper #selected_cloud_path').val());
            local_path +=slash;
            webpath = webpath.replace(new RegExp('^(个人的文件|团队的文件)/'),'');
            var type =0;
            if (!webpath) {
                alert('请选择云端文件夹');
                return;
            }
            if (!local_path) {
                alert('请选择本地位置');
                return;
            }

            var local_filename = _context.getLocalFilename(local_path);
            var cloud_filename = Util.String.baseName(webpath);
            var  isEmpty =gkClientInterface.checkIsEmptyPath(local_path);
            if(!parseInt(isEmpty)){
                if (!confirm('确定将 "' + cloud_filename + '"与本地的 "' + local_filename + '" 进行同步吗？如果本地的 "' + local_filename + '" 中存在相同名称的文件夹将会被覆盖。')) {
                    return false;
                }
            }

            var cloudSet = {
                filename: cloud_filename,
                type: type,
                webpath: webpath
            };
            console.log(cloudSet);
            _context.showStartSyncDialog(cloudSet, local_path, dialog);
            return;
        });

        //取消
        dialog.find('.cancel').click(function () {
            gkClientInterface.closeWindow();
            return;
        });

        if(path){
            setSelectFile(path,1);
            dialog.find('.select_local_file').removeClass('blue_btn').addClass('disabled').attr('disabled','disabled');
            setSelectFile( '个人的文件',0);
            dialog.find('.cloud_set_wrapper .chk').trigger('click');
        }

    }

};