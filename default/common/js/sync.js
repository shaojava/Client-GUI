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
            var local_uri = item.data('local_uri');
            gkClientInterface.openDiskPath(local_uri);
            return false;
        })
        //设置新的本地同步位置
        $('.edit_local_uri').click(function () {
            var item = $(this).parents('.sync_item');
            var local_uri = item.data('local_uri');
            var cloud_uri = item.data('cloud_uri');
            var type = item.data('type');
            var new_local_uri = gkClientInterface.selectFile({
                path:local_uri,
                disable_root:1
            });
            if (new_local_uri && local_uri != new_local_uri) {
                var re = gkClientInterface.checkLinkPath(new_local_uri);
                var enable = _context.checkSelectPath(new_local_uri,re);
                if(!enable){
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
                close:0
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
    showFileTree: function (dialog, mount_id) {
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
                    var sign = gkClientInterface.getAuthorization('list', path, dateStr);
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
                            'name': '团队文件',
                            'iconSkin': 'file_icon icon_team_root ',
                            'className': '',
                            'fullpath': '',
                            'open': true,
                            'isParent': true,
                            'data-hash': '',
                            'data-fullpath': '',
                            'data-filename': '团队文件',
                            'data-icon': 'icon_team_root',
                            'data-type': 2,
                            'children': _context.rendFileList(teamFiles, parentNode)
                        };
                        var myTree = {
                            'tId': '2',
                            'name': '我的文件',
                            'iconSkin': 'file_icon icon_my_root ',
                            'className': '',
                            'open': true,
                            'fullpath': '',
                            'isParent': true,
                            'data-hash': '',
                            'data-fullpath': '',
                            'data-filename': '我的文件',
                            'data-icon': 'icon_my_root',
                            'data-type': 2,
                            'children': _context.rendFileList(myFiles, parentNode)
                        };
                        treeData.push(myTree);
                        treeData.push(teamTree);
                    } else {
                        if (data && data.list) {
                            treeData = _context.rendFileList(data.list, parentNode);
                        }
                    }
                    return treeData;
                }
            },
            callback: {
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
    rendFileList: function (files, parentNode) {
        var _context = this;
        var renderList = [];
        var item = null;
        var name = '';
        var l = files.length || 0;
        $.each(files, function (i, n) {
            n.icon = 'icon_folder';
            var node = _context.rendFileItem(n, parentNode);
            if (i + 1 == files.length) {
                node['className'] += ' last_file_item';
            }
            renderList.push(node);
        });
        return renderList;
    },
    rendFileItem: function (n, parentNode) {
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
            'data-type': 0
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
                            fullpath:local_path,
                            close:1
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
                        console.log(paths);
                        gkClientInterface.setLinkPath(paths);
                        $(this).dialog('close');
                        if (parentDialog.size()) {
                            //window.parent.showLinkedFile();
                            gkClientInterface.closeWindow();
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
    checkSelectPath:function(path,re){
        if (re.disabled == 1) {
            var binded_path = re.path;
            var replace_path = path.replace(/\\/g, '/');
            var replace_bind_path = binded_path.replace(/\\/g, '/');
            var re = replace_path.replace(new RegExp(replace_bind_path), '');
            var msg = '';
            if (!re ||re ==='/') {
                msg = '该文件夹已绑定过同步关系，不能再进行绑定';
            } else if (re == replace_path) {
                msg = '该文件夹的下级文件夹 ' + binded_path + ' 已绑定过同步关系，不能再进行绑定';
            } else {
                msg = '该文件夹的上级文件夹 ' + binded_path + ' 已绑定过同步关系，不能再进行绑定';
            }
            alert(msg);
            return false;
        }
        if(re.empty==0){
            if(!confirm('你选择的文件夹不为空，同步后将被覆盖，请确认')){
                return false;
            }
        }
        return true;
    },
    initAddLink: function () {
        var _context = this;
        var dialog = $('.wrapper');
        var setSelectFile = function (path) {
            var filename = _context.getLocalFilename(path);
            dialog.find('.selected_local_file').remove();
            if (!path) {
                dialog.find('.goto_select_file').show();
            } else {

                dialog.find('.goto_select_file').hide();
                var html = '<div class="d_content selected_local_file">';
                html += '<div><i></i><span>' + filename + '</span><button class="btn select_local_file">修改位置</button></div>';
                html += '<div>';
                html += '<div>本地位置</div>';
                html += '<div><span class="user_select_enable" id="selected_local_path" >' + path + '</span></div>';
                html += '</div>';
                html += '</div>';
                dialog.find('.local_set_wrapper').append(html);
            }
        };
        dialog.find('.local_set_wrapper').on('click', '.select_local_file', function () {
            var old_path = '';
            var input = dialog.find('#selected_local_path');
            if (input.size()) {
                old_path = $.trim(input.val());
            }
            var new_path = gkClientInterface.selectFile({
                path:old_path,
                disable_root:1
            });
            if (new_path != old_path) {
                if(new_path){
                    var re = gkClientInterface.checkLinkPath(new_path);
                    var enable = _context.checkSelectPath(new_path,re);
                    if(!enable){
                       return;
                    }
                }
                setSelectFile(new_path);
            }
            return;
        });

        var mount_id = gkClientInterface.getUserInfo().mount_id;
        _context.showFileTree(dialog, mount_id);

        dialog.find('.start_sync').click(function () {
            var local_path = $.trim($('#selected_local_path').text());
            var webpath = $.trim($('#select_cloud_file_path').text());
            var type = $('#select_cloud_file_path').data('type');
            if (!type) {
                type = 0;
            }
            if (!local_path) {
                alert('请选择本地位置');
                return;
            }
            var cloudSet = {
                filename: Util.String.baseName(webpath),
                type: type,
                webpath: webpath
            };

            _context.showStartSyncDialog(cloudSet, local_path, dialog);
            return;
        });
        dialog.find('.cancel').click(function () {
            gkClientInterface.closeWindow();
            return;
        });
    }

};