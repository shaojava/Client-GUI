var gkClientSync = {
    //检测文件名的格式有效性
    checkFilenameValid: function(filename) {
        filename = $.trim(filename);
        if (!filename) {
            alert(L('FILE_EMPTY_FILE_NAME'));
            return false;
        }
        var reg = /\/|\\\\|\:|\*|\?|\"|<|>|\|/;
        if (reg.test(filename)) {
            alert(L('FILE_FILE_NAME_FORMAT'));
            return false;
        }
        if (filename.length > 255) {
            alert(L('FILE_FILE_NAME_LENTH'));
            return false;
        }
        return true;
    },
    init: function () {
        var _context = this;
        _context.showLinkedFile();
        //添加新的同步位置
        $('.add_new_sync').click(function () {
            gkClientInterface.openChildWindow({
                //url: 'chs/add_link.html',
                url: 'default/chs/add_link.html',
                width: 710,
                height: 470
            });
            return;
        });
    },
    showLinkedFile: function () {
        var _context = this;
        var list = gkClientInterface.getLinkPath().list || [];
        var bindpath = gkClientInterface.getClientInfo().bindpath;
        list.unshift({
            fullpath:bindpath,
            type: 3,
            webpath: "文件"
        });
        var files = _context.formatLinkData(list);
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
                var trimPath =Util.String.rtrim(Util.String.rtrim(new_local_uri,'/'),'\\\\');
                if(!confirm('确定要移动到 '+trimPath+' ?')){
                    return;
                }
                if(type==3){ //移动同步根目录
                    gkClientInterface.moveSyncFile(new_local_uri);
                }else{
                    var path = [
                        {
                            webpath: cloud_uri,
                            fullpath: new_local_uri,
                            type: type
                        }
                    ];
                    gkClientInterface.setLinkPath(path);
                }

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
            var type = item.data('type');
            if(type==3){
                webpath = '';
            }
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
            var localpath = String(item.data('local_uri'));
            if (!webpath) {
                return;
            }
            if(!confirm('确定要取消该同步关系？')){
           // if(!confirm('确定要取消云端文件 ' +webpath+ ' 与 '+localpath+' 的同步？')){
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
            view: {
                nameIsHTML: true
            },
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
                        if(jItem.hasClass('selected')){
                              return;
                        }
                        var createFolderBtn = dialog.parent().find('.create_new_folder');
                        if (!String(jItem.data('fullpath')) && jItem.data('type')==2) {
                            createFolderBtn.addClass('disabled').attr('disabled','disabled');
                       }else{
                            createFolderBtn.removeClass('disabled').removeAttr('disabled');
                        }
                        dialog.find('.file_item.selected').removeClass("selected");
                        jItem.addClass("selected");
                        var treeObj = $.fn.zTree.getZTreeObj('gk_cloud_file_list');
                        var node = treeObj.getNodeByTId(jItem.parent().attr('id'));
                        if(!node.open){
                            jItem.find('.switch').trigger('click');
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
                cloud_filename = '个人的文件';
            } else if (v.type == 2) {
                icon = 'icon_team_root';
                cloud_filename = '团队的文件';
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
        var default_path = path;
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
            }else {
                if(!default_path){
                    checkbox.removeClass('disabled');
                }else{
                    cloudSetWrapper.find('.chk').removeClass('disabled');
                }

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
            if($(this).hasClass('checked')){
                if(setWrapper.hasClass('local_set_wrapper')){
                    var cloud_chk =  $('.cloud_set_wrapper .chk');
                    if( cloud_chk.hasClass('checked')){
                        cloud_chk.trigger('click');
                    }
                }else{
                    var local_chk =  $('.local_set_wrapper .chk');
                    if(local_chk.hasClass('checked')){
                        local_chk.trigger('click');
                    }
                }
            }
          var localPathInput = dialog.find('.local_set_wrapper .selected_file_wrapper .path_input');
            var cloudPathInput = dialog.find('.cloud_set_wrapper .selected_file_wrapper .path_input');
            var cloudPath = $.trim(cloudPathInput.val());
            var localPath = $.trim(localPathInput.val());

            if(setWrapper.hasClass('local_set_wrapper')){ //与云端同名
                if(path){
                    return;
                }
                var newLocalPath = '';
                if($(this).hasClass('checked')){
                    var cloudFileName = Util.String.baseName(cloudPath);
                    newLocalPath = localPath+slash+cloudFileName;
                }else{
                    var temp_re = localPath.replace(/\\/,'/');
                    var dir_path = Util.String.dirName(temp_re);
                    if(temp_re != localPath){
                        newLocalPath = dir_path.replace(/\//g,'\\');
                    }
                }
                setSelectFile(newLocalPath,1);
            }else{ //与本地同名
                var newCloudPath = '';
                if($(this).hasClass('checked')){
                    var localFileName = _context.getLocalFilename(localPath);
                    newCloudPath = cloudPath+'/'+localFileName;
                }else{
                    newCloudPath = Util.String.dirName(cloudPath);
                    if(newCloudPath =='个人的文件' || newCloudPath =='团队的的文件'){
                         flag = true;
                    }
                    if(flag){
                        newCloudPath = '';
                    }
                }
                setSelectFile(newCloudPath,0);

            }
            if(dialog.find('.cloud_set_wrapper .chk').hasClass('checked')){
                //dialog.find('.local_set_wrapper .chk').addClass('disabled');
            }else if(!default_path){
                dialog.find('.local_set_wrapper .chk').removeClass('disabled');
            }

            if(dialog.find('.local_set_wrapper .chk').hasClass('checked')){
                //dialog.find('.cloud_set_wrapper .chk').addClass('disabled');
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
                var cloudChk =dialog.find('.cloud_set_wrapper .chk');
                if(cloudChk.hasClass('checked')){
                    cloudChk.removeClass('checked').trigger('click');
                }
            }
            return;
        });

        //选择云端文件
        dialog.find('.select_cloud_file').on('click', function () {
            var dialgoTmpl = $('#selectCloudFileDialog').tmpl();
            dialgoTmpl.gkDialog({
                width: 386,
                height:400,
                title:'选择云端文件夹',
                dialogClass:'select_cloud_file_dialog',
                buttons: [
                    {
                        'text': '新建文件夹',
                        'class': 'create_new_folder',
                        'click': function () {
                            var item = $(this).find('.file_item.selected');
                            if (item.size() != 1) {
                                alert('请选择文件夹');
                                return;
                            }

                            var filename ='新建文件夹';
                            var treeObj = $.fn.zTree.getZTreeObj('gk_cloud_file_list');

                            var node = treeObj.getNodeByTId(item.parent().attr('id'));
                            var name = '';
                            name += '<span class="edit_filename_wrapper" style="display: inline-block;">';
                            name += '<input class="input_text_radius input_filename" type="text" value="' +filename + '" x-webkit-speech="" />';
                            name += '<span class="edit_btns" style="margin-top: 0px;"><button class="btn blue_btn">确定</button><button class="btn">取消</button></span>';
                            name += '</span>';
                            var newNodeDatas = treeObj.addNodes(node, {
                                'tId': '',
                                'name': name,
                                'iconSkin': 'file_icon icon_folder ',
                                'className': 'file_item_edit',
                                'isParent': false
                            }, false, false, true);
                            var newNodeData = newNodeDatas[0];
                            var jqNewItem = $('#' + newNodeData.tId);
                            var jqInput = jqNewItem.find('input.input_filename');
                            var jqBtns = jqNewItem.find('.edit_btns');
                            var editFileNameWrapper = jqNewItem.find('.edit_filename_wrapper');
                            editFileNameWrapper.append(jqInput).append(jqBtns.css('margin-top', 0));
                            jqInput.on('keyup', function(e) {
                                if (e.keyCode == 13) {
                                    jqBtns.find('button:first').trigger('click');
                                }
                            });
                            jqBtns.find('button:last').on('click', function() {
                                treeObj.removeNode(newNodeData);
                                return;
                            });
                            jqBtns.find('button:first').on('click', function() {
                                var filename = jqInput.val();
                                if (!filename.length) {
                                     alert('文件夹名不能为空');
                                    return;
                                }
                               if (!_context.checkFilenameValid(filename)) {
                                    return;
                               }
                                var up_fullpath = String(item.data('fullpath'));
                                var fullpath = up_fullpath+ '/' + filename + '/';
                                if(!up_fullpath){
                                    fullpath =  filename + '/';
                                }
                                //jqNewItem.loader();
                                gkRest.put(PAGE_CONFIG.mountId,fullpath,undefined, function(data) {
                                   // $.loader.close();
                                    if (!data) {
                                        return;
                                    }
                                    jqBtns.find('button:last').trigger('click');
                                    node.isParent = true;
                                    treeObj.reAsyncChildNodes(node, 'refresh');
                                    item.trigger('click');

                                }, function(request, textStatus, errorThrown) {
                                    var errorMsg = gkClientAjax.Exception.getErrorMsg(request, textStatus, errorThrown);
                                    alert(errorMsg);
                                });
                            });


                            jqInput[0].select();
                            return;
                        }

                    },
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
                            var type = $(this).find('#select_cloud_file_path').data('type');
                            if(!webpath && type==2){
                               alert('不能同步到团队的文件的根目录');
                              return;
                            }
                            var screenpath = webpath;

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
                            if(!webpath){
                                var cloud_chk = dialog.find('.cloud_set_wrapper .chk').removeClass('checked disabled');
                                var localPath = $.trim(dialog.find('#selected_local_path').val());
                                if(localPath){
                                    cloud_chk.trigger('click');
                                }else{
                                    cloud_chk.addClass('checked');
                                }
                                dialog.find('.local_set_wrapper .chk').removeClass('disabled').addClass('disabled');
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
            local_path +=slash;
            var local_filename = _context.getLocalFilename(local_path);
            var cloud_filename = Util.String.baseName(webpath);
            var  isEmpty =gkClientInterface.checkIsEmptyPath(local_path);
            var paths = [
                {
                    'webpath': webpath,
                    'fullpath': local_path,
                    'type': type
                }
            ];
            if(!parseInt(isEmpty)){
                var html = '<div class="sync_confirm_dialog_content">';
                html +='<div class="">';
                html +='<div class="strong">确定开始同步？</div>';
                html +='<div class="tip">如果两个文件夹中存在相同名称的文件，本地将会覆盖云端。</div>';
                html +='</div>';
                html += '</div>';
                $(html).gkDialog({
                    width: 480,
                    title: '开始同步',
                    dialogClass: 'sync_confirm_dialog',
                    buttons: [
                        {
                            "text": '取消',
                            'class': 'btn',
                            "click": function () {
                                $(this).dialog("close");
                            }
                        },
                        {
                            "text": '确定',
                            'class': 'btn blue_btn',
                            "click": function () {

                                $(this).dialog("close");
                                gkClientInterface.setLinkPath(paths);
                            }
                        }
                    ]
                });
            }else{
                gkClientInterface.setLinkPath(paths);
            }
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
            dialog.find('.local_set_wrapper .chk').addClass('disabled');
            setSelectFile( '个人的文件',0);
            dialog.find('.cloud_set_wrapper .chk').trigger('click');
        }

    }

};