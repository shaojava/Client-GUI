var gkClientSync = {
    init:function(){
        var _context = this;
       var files = _context.formatLinkData(gkClientInterface.getLinkPath().list);
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

        //添加新的同步位置
        $('.add_new_sync').click(function(){
            _context.showAddSyncDialog();
            return;
        });

        sync_items.find('.dropdown_menu .select_to_sync').click(function(){
            var item = $(this).parents('.sync_item');
            var webpath = String(item.data('cloud_uri'));
            console.log(webpath);
            gkClientInterface.selectSyncFile(webpath);
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
    showAddSyncDialog:function(){

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
            var cloud_url = _context.getFileLocation(v.webpath, undefined, 0);
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
                //removeAvaiable: v.type<=0
                removeAvaiable:true
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
        if (dir) {
            location += encodeURIComponent(fullpath);
        } else {
            var up_fullpath = Util.String.dirName(fullpath);
            var filename = Util.String.baseName(fullpath) + (dir ? '/' : '');
            location += encodeURIComponent(up_fullpath) + ':' + encodeURIComponent(filename) + ':';
        }
        return location;

    }
};