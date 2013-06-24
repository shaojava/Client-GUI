var gkClientSync = {
    init:function(){
        var _context = this;
         _context.showLinkedFile();
        //添加新的同步位置
        $('.add_new_sync').click(function(){
            _context.showAddSyncDialog();
            return;
        });

    },

    showLinkedFile:function(){
        var _context = this;
        var files = _context.formatLinkData(gkClientInterface.getLinkPath().list);
        $('.list_wrapper .list').remove();
        var list = $('#fileListTmpl').tmpl({
            files:files
        }).appendTo($('.list_wrapper'));
        var sync_items = $('.list .sync_item');
        sync_items.each(function(){
            $(this).find('.set').droplist([4,-144,0,0]);
        });
        //设置新的本地同步位置
        $('.edit_local_uri').click(function(){
            var item = $(this).parents('.sync_item');
            var local_uri = item.data('local_uri');
            var cloud_uri = item.data('cloud_uri');
            var type = item.data('type');
            var new_local_uri = gkClientInterface.selectFile(local_uri);
            if(local_uri != new_local_uri){
                var path = [
                    {
                        webpath:cloud_uri,
                        fullpath:new_local_uri,
                        type:type
                    }
                ];
                gkClientInterface.setLinkPath(path);
                var local_filename = _context.getLocalFilename(new_local_uri);
                item.attr('data-local_uri',new_local_uri).attr('data-local_filename',local_filename);
                item.find('.local_uri a').attr('data-original-title',new_local_uri).text(local_filename);
            }
            return;
        });

        //选择性同步
        sync_items.find('.dropdown_menu .select_to_sync').click(function(){
            var item = $(this).parents('.sync_item');
            var webpath = String(item.data('cloud_uri'));
            var params = {
                webpath:webpath,
                type:item.data('type')
            };
            gkClientInterface.selectSyncFile(params);
            return;
        });

        //取消映射
        sync_items.find('.dropdown_menu .remove_sync').click(function(){
            var item = $(this).parents('.sync_item');
            var webpath = String(item.data('cloud_uri'));
            if(!webpath){
                return;
            }
            var links = [
                {
                    webpath:webpath
                }
            ];
            gkClientInterface.removeLinks(links);
            item.fadeOut(function(){
                item.remove();
            });
            return;
        });
    },
    showFileTree:function(dialog,mount_id){
        var setCloudFile = function(path,icon,type){
            var filename =Util.String.baseName(path);
            dialog.find('.selected_cloud_file').remove();
            var html = '<div class="d_content selected_cloud_file">';
            html +='<div><i class="'+icon+'"></i><span>'+filename+'</span></div>';
            html +='<div>';
            html +='<div>云端位置</div>';
            html +='<div><span id="select_cloud_file_path" data-type="'+type+'">'+path+'</span></div>';
            html += '</div>';
            html +='</div>';
            dialog.find('.cloud_set_wrapper .selected_cloud_file_wrapper').append(html);
        };

        var _context = this;
        var setting = {
            treeId: 'gk_cloud_file_list',
            async: {
                enable: true,
                url: function(treeId, treeNode){
                    var path = '';
                    if(treeNode){
                        path = treeNode['data-fullpath'];
                    }
                    return 'http://r2.gokuai.com/'+path;
                },
                dataType: "json",
                type: "LIST",
                headers:function(treeId, treeNode){
                    var dateStr = new Date().toUTCString();
                    var path = '';
                    if(treeNode){
                        path = treeNode['data-fullpath'];
                    }
                    var sign = gkClientInterface.getAuthorization('list',path,dateStr);
                   var headers = {
                       'x-gk-mount':mount_id,
                       'x-gk-dir':1,
                       'Date':dateStr,
                       'Authorization':sign
                   };
                    return headers;
                },
                dataFilter: function(treeId, parentNode, data) {
                    var treeData = null;
                    if (data && data.list) {
                        treeData = _context.rendFileList(data.list, parentNode);
                    }
                    return treeData;
                }
            },
            callback: {
                beforeAsync: function() {

                },
                onAsyncError: function() {

                },
                onAsyncSuccess: function(event, treeId, treeNode, msg) {
                    var items;
                    if(!treeNode){
                        items = dialog.find('.file_item');
                    }else{
                        var treeObj = $.fn.zTree.getZTreeObj(treeId);
                        var node = treeObj.getNodeByTId(treeNode.tId);
                        items = dialog.find('#' + node.tId + '>ul>li>.file_item');
                    }
                    items.on('click',function(){
                        var path = $(this).data('fullpath');
                        var icon = $(this).data('icon');
                        var type = $(this).data('type');
                        setCloudFile(path,icon,type);
                    })

                    items.click(function(e) {
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
    rendFileList:function(files,parentNode){
        var _context = this;
        var renderList = [];
        var item = null;
        var name = '';
        var l = files.length || 0;
        $.each(files, function(i, n) {
            n.icon = 'icon_folder';
            var node = _context.rendFileItem(n, parentNode);
            if (i + 1 == files.length) {
                node['className'] += ' last_file_item';
            }
            renderList.push(node);
        });
        return renderList;
    },
    rendFileItem:function(n, parentNode){
        var name = n.filename;
        var isShare = n.share==1 || n.cmd>999;
        if(isShare){
            n.icon = 'icon_shared_folder';
        }else{
            n.icon = 'icon_folder';
        }
        var icon = 'file_icon ' + n.icon + ' ';
        if (!isShare && parentNode && (parentNode["data-share"] ==1 || parentNode["data-cmd"]>999)) {
            icon = parentNode["iconSkin"];
        }
        var item = {
            'tId': n.hash,
            'name': name,
            'iconSkin': icon,
            'className': '',
            'fullpath': n.fullpath,
            'isParent':true,
            'data-hash': n.hash,
            'data-dir': n.dir,
            'data-fullpath': n.fullpath,
            'data-filename': n.filename,
            'data-icon': icon,
            'data-share': n.share,
            'data-local': n.local,
            'data-cmd': n.cmd,
            'data-type':0
        };
        return item;
    },
    showStartSyncDialog:function(cloud_settings,local_path,parentDialog){
        var _context = this;
        var webpath =cloud_settings.webpath;
        var filename = cloud_settings.filename;
        var type = cloud_settings.type;
        var html = $('#startSyncDialog').tmpl({
            filename:filename,
            local_path:local_path
        });
        html.gkDialog({
            width:400,
            title:'即将开始同步',
            dialogClass:'start_sync_dialog',
            buttons:[
                {
                    "text": '取消',
                    'class':'btn',
                    "click": function() {
                        $(this).dialog("close");
                    }
                },
                {
                    "text": '选择性同步',
                    'class':'btn blue_btn',
                    "click": function() {
                        var params = {
                            webpath:webpath,
                            type:type
                        };
                        gkClientInterface.selectSyncFile(params);
                        return;
                    }
                },
                {
                    "text": '全部同步',
                    'class':'btn blue_btn',
                    "click": function() {
                        var paths = [{
                            'webpath':webpath,
                            'fullpath':local_path,
                            'type':type
                        }];
                        gkClientInterface.setLinkPath(paths);
                        $(this).dialog('close');
                        if(parentDialog){
                            parentDialog.dialog('close');
                        }
                        _context.showLinkedFile();
                        return;
                    }
                }
            ]
        });
    },
    showAddSyncDialog:function(){
        var _context = this;
        var html = $('#addLinkDialogTmpl').tmpl();
        html.gkDialog({
            width:700,
            height:515,
            title:'请添加一对同步文件夹',
            dialogClass:'add_link_dialog',
            buttons:[
                {
                    "text": '取消',
                    'class':'btn',
                    "click": function() {
                        $(this).dialog("close");
                    }
                },
                {
                    "text": '开始同步',
                    'class':'btn blue_btn',
                    "click": function() {
                        var local_path = $('#selected_local_path').val();
                        var webpath = $('#select_cloud_file_path').text();
                        var type = $('#select_cloud_file_path').data('type');
                        if(!type){
                            type = 0;
                        }
                        if(!local_path){
                               alert('请选择本地位置');
                            return;
                        }
                        var cloudSet = {
                            filename:Util.String.baseName(webpath),
                            type:type,
                            webpath:webpath
                        };
                        _context.showStartSyncDialog(cloudSet,local_path,$(this));
                    }
                }
            ],
            open:function(){
                var dialog = $(this);
                var setSelectFile = function(path){
                    var filename =_context.getLocalFilename(path);
                    dialog.find('.selected_local_file').remove();
                    if(!path){
                        dialog.find('.goto_select_file').show();
                        return;
                    };
                    dialog.find('.goto_select_file').hide();

                    var html = '<div class="d_content selected_local_file">';
                    html +='<div><i></i><span>'+filename+'</span></div>';
                    html +='<div>';
                    html +='<div>本地位置</div>';
                    html +='<div><input type="text" class="input_text input_text_readonly input_text_radius" value="'+path+'" id="selected_local_path" readonly /><button class="btn select_local_file">修改位置</button></div>';
                    html += '</div>';
                    html +='</div>';
                    dialog.find('.local_set_wrapper').append(html);
                };
                $(this).find('.local_set_wrapper').on('click','.select_local_file',function(){
                      var old_path ='';
                    var input = dialog.find('#selected_local_path');
                        if(input.size()){
                            old_path = $.trim(input.val());
                        }
                    var new_path = gkClientInterface.selectFile(old_path);
                    if(new_path != old_path){
                        setSelectFile(new_path);
                    }
                    return;
                });


                var mount_id = gkClientInterface.getUserInfo().mount_id;
                _context.showFileTree($(this),mount_id);
            }
        });
    },
    getLocalFilename:function(local_path){
        var re_fullpath = local_path.replace(/\\/g, '/');
        var local_filename = Util.String.baseName(Util.String.rtrim(re_fullpath,'/'));
        return local_filename;
    },
    formatLinkData:function(paths){
        var _context = this;
         var files = [];
        $.each(paths,function(k,v){
            var icon = 'icon_folder';
           var local_filename = _context.getLocalFilename(v.fullpath);
            var cloud_filename = '';
            if(v.type==1){
                icon = 'icon_my_root';
                cloud_filename = '我的文件';
            }else if(v.type==2){
                icon = 'icon_team_root';
                cloud_filename = '团队文件';
            }else{
                cloud_filename =  Util.String.baseName(v.webpath);;
                if(v.local>0){
                    icon = 'icon_local_folder';
                }else if(v.share==1){
                    icon = 'icon_shared_folder';
                }
            }
            var cloud_url = _context.getFileLocation(v.webpath, 1, 0);
            var local_url = cloud_url;
            var item =  {
                type: v.type,
                icon:icon,
                local_url:local_url,
                local_uri: v.fullpath,
                local_filename:local_filename,
                cloud_uri: v.webpath,
                cloud_url:cloud_url,
                cloud_filename:cloud_filename,
                removeAvaiable: v.type<=0
                //removeAvaiable:true
            };
            files.push(item);
        })
        return files;
    },
    getFileLocation: function(fullpath, dir, showDel) {
        var pre = '/storage';
        var location = pre + '#!files:' + showDel+':';
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

    }
};