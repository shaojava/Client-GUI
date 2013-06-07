             /**
         *选择链接类型
         * **/  
         function get_link_type(linkObj){
             ajax({
                  url:"http://localhost:8888/api/check_publish_closed",
                  data:"fullpath="+PAGE_CONFIG.path+"&auth="+linkObj.options[linkObj.selectedIndex].value+"",
                  success:function(data){
                  
                      alert($(".get_links").attr("href"));
                  }
             })
         }
       
        
         /**
         * 元素清除数据
         * **/  
         function tag_clear(idenity){
           if(idenity == 1){affiliatedperson_dl.empty();affiliatedperson_yy.empty();}
           else if(idenity == 2){$(".affiliatedperson_update").remove()}
           else{$(".url_links").remove();}
          
         }
          /**
         * ajax共享请求数据
         * **/ 
        function share_ajax_load_data(dataJson){
            ajax({data:dataJson,
                  success:function(data){
                    tag_clear(1);
                  //添加模板到html上
                  $("#affiliatedperson_dl").tmpl({"d":data["share_members"]}).appendTo(affiliatedperson_dl);
                  $.each(data["share_groups"],function(k,v){
                  if(v["group_name"] === "开发组"){ //产品
                  localStorage["share_groups"][v["group_name"]] = {data:v["member_list"],share_members_identity:1};
                  $("#affiliatedperson_cp").tmpl({"d":v["member_list"]}).appendTo(affiliatedperson_cp);
                                                  }else{ //运营
                                                          localStorage["share_groups"][v["group_name"]] = {data:v["member_list"],share_members_identity:2};
                                                          $("#affiliatedperson_yy").tmpl({"d":v["member_list"]}).appendTo(affiliatedperson_yy);
                                                  }
                                                      })
                                                          tag_hover_title();
                                         
                                                          }
                                                       });
                        
        }
           /**
         * ajax动态更新数据
         * **/ 
        
         function update_ajax_load_data(dataJson){
             
              ajax({data:dataJson,
                                 success:function(data){
                                       tag_clear(3);
                                       $.each(data,function(k,v){
                                         
                                            var _tmp_dateline = getLocalTime(v["dateline"]).match(/(\d{1,2}):(\d{1,2})/);
                                            v["dateline"] = _tmp_dateline[0]
                                       })
    
                                   $("#updates").tmpl({"d":data}).appendTo($(".share_info_update"));
                                      
                                      tag_hover_title();
                                       
                                 }
                            });
        }
    
        
         /**
         * ajax请求链接数据
         * **/
          function link_ajax_load_data(dataJson,fullpath){  
 
                   ajax({
                         url:"http://localhost:8888/api/check_publish_closed",
                         data:dataJson,
                          success:function(data){
                               
                              tag_clear(3);
                              if(data.isclosed === false){
                                  ajax({
                                         url:"http://localhost:8888/api/link_publish",
                                         data:"fullpath="+fullpath+"&auth=1000",
                                         success:function(data){
                                              create_file_tag(data.link);
                                         }
                                  })
                              }else{
                                  $("<div class='links_update'>"+data.msg+"</div>").appendTo($(".links_update").parent());
                              }
                              
                          }
                       
                   })
            
                    
        }
        
        
        /**
         * 页面的任务的hover title效果
         * **/  
        function tag_hover_title(){
                  var _count_li = $(".share_info").find("li");
                  _count_li.each(function(){
                       if($(this).attr("data-auth") == "0") $(this).children("a").attr("title","查看者");
                       else if($(this).attr("data-auth") == "1") $(this).children("a").attr("title","编辑者");
                       else $(this).children("a").attr("title","拥有者");  
                   })
         }  
        
         /**
         * 建立文件标签
         * **/ 
        function create_file_tag(fileurl){
                      var _file_tag_url = '选择链接类型 <select class="select select_radius" onchange="get_link_type(this)"><option value="1000" data-type="preview" data-tip="允许链接访问者预览">预览链接</option><option value="1011" data-type="download" data-tip="允许链接访问者预览、下载">下载链接</option><option value="1111" data-type="cooperate" data-tip="允许链接访问者预览、下载、上传">协作链接</option><option value="0100" data-type="unknownUpload" data-tip="允许链接访问者上传/更新文件，但无法查看文件夹内的文件">匿名上传链接</option></select><div class="links_type"><a class="extend_button fontcolor_blue get_links" href="'+fileurl+'">获取链接</a><a class="extend_button fontcolor_blue" href="javascript:void(0)" onclick="create_gj_links()">创建高级链接</a></div>';
                      $(".links_update").html(_file_tag_url);
        }
        
          /**
         * 建立文件夹标签
         * **/ 
        function create_dir_tag(fileurl){
            
            var _file_tag_url = '选择链接类型 <select class="select select_radius" onchange="get_link_type(this)"><option value="1000" data-type="preview" data-tip="允许链接访问者预览">预览链接</option><option value="1011" data-type="download" data-tip="允许链接访问者预览、下载">下载链接</option><option value="1111" data-type="cooperate" data-tip="允许链接访问者预览、下载、上传">协作链接</option></select><div class="links_type"><a class="extend_button fontcolor_blue get_links" href="'+fileurl+'">获取链接</div><a href="javascript:void(0)" class="extend_button fontcolor_blue" onclick="create_gj_links()">创建高级链接</a></div>';
            $(".links_update").html(_file_tag_url);
        }
              
        /**
         * 显示独立参与人
         * **/  
        function show_dl_person(){
            $(".affiliatedperson_1").show();
        }
        
         /**
         * 隐藏独立参与人
         * **/ 
         function hide_dl_person(){
            $(".affiliatedperson_1").hide();
         }
        
          /**
         * 将数据存入缓存
         * {@params} callback function 
         * **/ 
          function write_storage_cache(data){

                   $.each(data,function(k,v){
                         switch(k){
                               case "share_members":
                                     localStorage["share_member"] = {data:data["share_members"],share_members_identity:0};
                                     break;
                              default:
                                   $.each(v,function(k1,v1){
                                         if(v1["group_name"] === "开发组"){
                                           localStorage["share_groups"][v1["group_name"]] = {data:v1["member_list"],share_members_identity:1};
             
                                        }else{
                                           localStorage["share_groups"][v1["group_name"]] = {data:v1["member_list"],share_members_identity:2};
                                        }
                                   })
                                    
                                     break;
                         }
                                      
                        })
                                                
          }
           /**
         * 元素高度自适应浏览器缩小
         * **/ 
          function slideBottom(){ 
              $(".share_info").height($(window).height() - 210); 
          }
           /**
         * 页面一系列的ajax操作
         * **/ 
        function ajax(options){
             var _defaults = {
                  "url":"http://localhost:8888/api/client_sidebar",
                   "dataType":"json",
                   "type":"POST",
                   "success":function(data){}      
             };
             options = $.extend({},_defaults,options);
             $.ajax(options);
        }
          /**
         * 判断保存时间是否过期
         * **/ 
         function check_cache_expire(){
          
             return localStorage["app_runtime_time"] < (+new Date()- 3000);
         }
          /**
         * 时间戳转为日期
         * **/ 
	function getLocalTime(nS) {     
               return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');     
        }
        /**
         * 创建高级链接
         * **/ 
        function create_gj_links(){
            if(!PAGE_CONFIG.path)return;
            var params = {
                url: '/client/client_file_detail?tab=link&fullpath=' + encodeURIComponent(PAGE_CONFIG.path),
                sso: 1,
                resize: 0,
                width: 800,
                height: 600
            };
            gkClientInterface.openSingleWindow(params);
        }
        /**
         * 创建链接
         * **/ 
        function create_pt_links(){
            if(!PAGE_CONFIG.path) {
                 tag_clear(3);
            }           
            var fullpath = PAGE_CONFIG.path;
           
            var authvalue = $(".select_radius").get(0).options[$(".select_radius").get(0).selectedIndex].value;
       $.ajax({
                 url:"http://localhost:8888/api/link_publish",
                 data:"fullpath="+fullpath+"&auth="+authvalue+"",
                 dataType:"json",
                 type:"post",
                 success:function(data){
                     tag_clear(3);
                     $("<div class='url_links' style='text-align:center'><a href='"+data.link+"' title='"+fullpath+"'>"+fullpath+"</a></div>").appendTo($(".links_update").parent());
                 }
            })
        }
        
              
         //一些后缀名数据
         var extensions = {
               'SORT_MOVIE' :['mp4', 'mkv', 'rm', 'rmvb', 'avi', '3gp', 'flv', 'wmv', 'asf', 'mpeg', 'mpg', 'mov', 'ts', 'm4v'],
    'SORT_MUSIC' : ['mp3', 'wma', 'wav', 'flac', 'ape', 'ogg', 'aac', 'm4a'],
    'SORT_IMAGE' : ['jpg', 'png', 'jpeg', 'gif', 'psd'],
    'SORT_DOCUMENT': ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'odt', 'rtf', 'ods', 'csv', 'odp', 'txt'],
    'SORT_CODE' : ['js', 'c', 'cpp', 'h', 'cs', 'vb', 'vbs', 'java', 'sql', 'ruby', 'php', 'asp', 'aspx', 'html', 'htm', 'py', 'jsp', 'pl', 'rb', 'm', 'css', 'go', 'xml', 'erl', 'lua'],
    'SORT_ZIP' : ['rar', 'zip', '7z', 'cab', 'tar', 'gz', 'iso'],
    'SORT_EXE' : ['exe', 'bat', 'com']
         };
           
           //定义选择文件夹的时候
           function select_file_dir(fullpath){
                
                 if(fullpath == "")fullpath = "/";        
                   share_ajax_load_data("type=share&fullpath="+fullpath+"");
                   update_ajax_load_data("type=history&fullpath="+fullpath+"");
                   
                   return get_image_url(fullpath);
                   
           }
           //判断文件后缀名
           function get_file_extension(filename){
                var reg  = /\.([a-zA-Z]*)/;
                return (reg.exec(filename)) ? reg.exec(filename)[1] :null;
           }
           //根据文件后缀名返回图片的类型
           function get_image_type(extension){
                 
                  for(var k in extensions){
                   for(var i = 0,len = extensions[k].length;i<len;i++){
                             if(extensions[k][i] === extension){
                               return k;   
                             }
                       } 
                  }
                  return "SORT_DIR";
                  
           }
           //根据类型返回图片的url
           function get_image_url(fullpath){
               var _type = get_image_type(get_file_extension(fullpath));
               var _image_url = "";
                switch(_type){
                     case "SORT_MOVIE":
                          _image_url = "../common/images/images_2013/fileicon/video_32.png";       
                          break;
                     case "SORT_MUSIC":
                         _image_url = "../common/images/images_2013/fileicon/music_32.png";   
                          break;
                     case "SORT_IMAGE":
                         _image_url = "../common/images/images_2013/fileicon/pic_32.png";   
                          break;
                     case "SORT_DOCUMENT":
                         _image_url = "../common/images/images_2013/fileicon/txt_32.png";   
                          break;
                     case "SORT_CODE":
                         _image_url = "../common/images/images_2013/fileicon/file_32.png";   
                          break;
                     case "SORT_ZIP":
                         _image_url = "../common/images/images_2013/fileicon/zip_32.png";   
                          break;
                     case "SORT_EXE":
                         _image_url = "../common/images/images_2013/fileicon/exe_32.png";   
                          break;
                     case "SORT_DIR":
                         _image_url = "../common/images/images_2013/fileicon/文件夹32.png";   
                          break;
                }
                
                return _image_url;
           }

