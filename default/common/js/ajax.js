             /**
         *选择链接类型
         * **/  
         function get_link_type(linkObj){
             
             ajax({
                  url:"http://gkdev.gokuai.com/api/link_publish",
                  data:"token="+gkClient.gGetToken()+"&fullpath="+PAGE_CONFIG.path+"&auth="+linkObj.options[linkObj.selectedIndex].value+"",
                  success:function(data){
                     $(".get_links").attr("href",data.link);
                  }
             })
             
         }
       
        
         /**
         * 元素清除数据
         * **/  
         function tag_clear(idenity){
           if(idenity == 1){$(".share_info_parent").empty()}
           else if(idenity == 2){$(".share_info_update").empty()}
           else{
               $(".links_update").empty();
           }
          
         }
        
         /**
         * ajax共享请求数据
         * **/ 
         function check_is_dl(ele,openState){
                 if(openState == 1){
                    ele.text("独占修改").show().removeClass("nodzupdate").addClass("dzupdate");
          
                 }else if(openState < 1){
          //取消独占修改
                   ele.text("取消独占").show().removeClass("dzupdate").addClass("nodzupdate"); 
                  }
            
         }
          /**
         * ajax共享请求数据
         * **/ 
        function share_ajax_load_data(dataJson,callback){
         
            ajax({
                data:dataJson,
                  success:function(data){
        
                     
                      tag_clear(1);
                    if(!data["share_members"].length){
                        $("<span style='color:#999;margin-left:5px;display:block;text-align:center'>未与任何人共享</span>").appendTo(affiliatedperson_dl);
                       $(".compary_finance i").hide();
                        return;
                    }
                    $.each(data["share_members"],function(k,v){
                       v["auth"] = v["auth"] == 0 ? "查看者":v["auth"] == 1 ? "编辑者" : "拥有者";  
                    })
                    callback();
                    $("#affiliatedperson").tmpl({"d":data["share_members"]}).appendTo(affiliatedperson_dl);                                
                                                          }
                                                       });
                        
        }
           /**
         * ajax动态更新数据
         * **/ 
        
         function update_ajax_load_data(dataJson){
              ajax({data:dataJson,
                   
                                 success:function(data){
                                   
                                     tag_clear(2);
                                       if(data["history"] == null){
                                           $("<span style='color:#999;margin-left:5px;text-align:center;display:block'>该文件或者文件夹最近没有更新</span>").appendTo($(".share_info_update"));
                                       }
                                       
                                       var v = null;
                          
                                       for(var i = 0,l = data["history"].length - 1;i<l;i++){
                                          v = data["history"][i];
                                     
                                         //  alert(getLocalTime(data["history"][i+1]["dateline"]));
                                         var nextHour = getLocalTime(data["history"][i+1]["dateline"]).match(/(\d+):(\d+)/)[0].split(":")[0];
                                      var _tmp_dateline =  getLocalTime(v["dateline"]).match(/(\d+):(\d+)/); 
                                 
                                         v["dateline"] = _tmp_dateline[0].split(":")[0]; 
                                      
                                         v["minutes"] = v["minutes"];
                                         var nextDate = data["history"][i+1]["date_txt"];
                                         if(v["date_txt"] != nextDate){
                                              data["history"][i+1]["status"] = true;//为true的时候不一样
                                             
                                              //显示小时
                                              v["hour"] = v["dateline"] + "点";
                                            
                                              if(+v["dateline"] > 12){
                                                 
                                                  v["hdeg"] = ((+v["dateline"]) - 12) * 30;
                                              }else{
                                                  v["hdeg"] = (+v["dateline"]) * 30;
                                              }
                                              v["mdeg"] = +v["minutes"] * 6;
                                              if(+v["dateline"] >= 8 && +v["dateline"] <= 17){
                                                   v["issxw"] = "白天";
                                                   v["sxwicon"] = "sun";
                                                   
                                              }else{
                                                   v["issxw"] = "晚上";
                                                   v["sxwicon"] = "moon";
                                              }
                                             
                                         }
                                         if(v["date_txt"] == nextDate){
                                            
                                              if(v["dateline"] == nextHour){
                                                  
                                                    data["history"][i+1]["status"] = false;
                                              }else{
                                                    
                                                    data["history"][i+1]["status"] = true;
                                              }
                                             if(typeof v["status"] === "undefined"){
                                                 v["status"] = true;
                                             }
                                              
                                              v["hour"] = v["dateline"] + "点";
                                             
                                               if(+v["dateline"] > 12){
                                                  v["hdeg"] = ((+v["dateline"]) - 12) * 30;
                                                  
                                              }else{
                                                  v["hdeg"] = (+v["dateline"]) * 30;
                                              }
                                             
                                              v["mdeg"] = +v["minutes"] * 6;
                                              if(+v["dateline"] >= 8 && +v["dateline"] <= 17){
                                                   v["issxw"] = "白天";
                                                   v["sxwicon"] = "sun";
                                              }else{
                                                   v["issxw"] = "晚上";
                                                   v["sxwicon"] = "moon";
                                              }
                                            
                                         }                          
   
                                       }
                                    
                                     // alert(data["history"][data.length - 1].constructor);
                                      
     
                                      
                                        data["history"][data["history"].length - 1]["date"] = data["history"][data["history"].length - 1]["date"].replace(/[^\d+]/g,".");
                                        if(data["history"][data["history"].length - 1]["status"] === true){
                                               var _tmp_dateline = getLocalTime(data["history"][data["history"].length - 1]["dateline"]);
                                         
                                          data["history"][data["history"].length - 1]["dateline"] = _tmp_dateline; 
                                              data["history"][data["history"].length - 1]["hour"] = data["history"][data["history"].length - 1]["dateline"] + "点";
              
                                               if(+data["history"][data["history"].length - 1]["hour"] > 12){
                                                  data["history"][data["history"].length - 1]["hdeg"] = ((+data["history"][data["history"].length - 1]["dateline"]) - 12) * 30;
                                                  
                                              }else{
                                                  data["history"][data["history"].length - 1]["hdeg"] = (+data["history"][data["history"].length - 1]["dateline"]) * 30;
                                              }
                                             
                                              data["history"][data["history"].length - 1]["mdeg"] = +data["history"][data["history"].length - 1]["minutes"] * 6;
                                              if(+data["history"][data["history"].length - 1]["dateline"] >= 8 && +data["history"][data["history"].length - 1]["dateline"] <= 17){
                                                   data["history"][data["history"].length - 1]["issxw"] = "白天";
                                                   data["history"][data["history"].length - 1]["sxwicon"] = "sun";
                                              }else{
                                                   data["history"][data["history"].length - 1]["issxw"] = "晚上";
                                                   data["history"][data["history"].length - 1]["sxwicon"] = "moon";
                                              }
                                            
                                          } 
   
                                   $("#updates").tmpl({"d":data["history"]}).appendTo($(".share_info_update"));
                                 },
                                         error:function(){
                                          
                                         }
                            });
        }
       
       /**
         * 生成带刻度的时钟
         * **/
        
        function create_time_clock(hour,minutes){
            
        }
        
         /**
         * ajax请求链接数据
         * **/
          function link_ajax_load_data(url,dataJson,callback){
                  ajax({url:url,data:dataJson,success:callback});         
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
         * 建立文件夹标签
         * **/ 
        function create_dir_tag(fileurl){
                      var _file_tag_url = '选择链接类型 <select class="select select_radius" onchange="get_link_type(this)"><option value="1000" data-type="preview" data-tip="允许链接访问者预览">预览链接</option><option value="1011" data-type="download" data-tip="允许链接访问者预览、下载">下载链接</option><option value="1111" data-type="cooperate" data-tip="允许链接访问者预览、下载、上传">协作链接</option><option value="0100" data-type="unknownUpload" data-tip="允许链接访问者上传/更新文件，但无法查看文件夹内的文件">匿名上传链接</option></select><div class="links_type"><a class="extend_button fontcolor_blue get_links" href="'+fileurl+'">获取链接</a></div>';
                      $(".links_update").html(_file_tag_url);
                        
        }
        
          /**
         * 建立文件标签
         * **/ 
        function create_file_tag(fileurl){
            
            var _file_tag_url = '选择链接类型 <select class="select select_radius" onchange="get_link_type(this)"><option value="1000" data-type="preview" data-tip="允许链接访问者预览">预览链接</option><option value="1011" data-type="download" data-tip="允许链接访问者预览、下载">下载链接</option><option value="1111" data-type="cooperate" data-tip="允许链接访问者预览、下载、上传">协作链接</option></select><div class="links_type"><a class="extend_button fontcolor_blue get_links" href="'+fileurl+'">获取链接</div></div>';
            $(".links_update").html(_file_tag_url);
        }
              
        /**
         * 显示独立参与人
         * **/  
        function show_dl_person(){
            $(".affiliatedperson_share").show();
        }
        
         /**
         * 隐藏独立参与人
         * **/ 
         function hide_dl_person(){
            $(".affiliatedperson_share").hide();
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
              //alert($(".compary_finance").get(0).offsetHeight + $(".header").get(0).offsetHeight);
              $(".share_info").height($(window).height() - 294); 
          }
           /**
         * 页面一系列的ajax操作
         * **/ 
        function ajax(options){
             var _defaults = {
                  "url":"http://gkdev.gokuai.com/api/client_sidebar",
                   "dataType":"json",
                   "type":"GET",
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
                   //share_ajax_load_data("type=share&fullpath="+fullpath+"");
                   update_ajax_load_data("token="+gkClient.gGetToken()+"&type=history&fullpath="+fullpath+"");
                   
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
               is_get_sc();
                return _image_url;
           }
            //获取是否收藏
            function is_get_sc(){
                 ajax({
                      url:"http://gkdev.gokuai.com/api/get_file",
                      data:"token="+gkClient.gGetToken()+"&fullpath="+PAGE_CONFIG.path,
                      success:function(data){
                         var last_dateline = getLocalTime(data["last_dateline"])
                         var date = new Date(last_dateline);
                         //改变最后修改日期
                         var year = date.getFullYear();
                         var month = date.getMonth()+1;
                         var dates = date.getDate();
                         var hour = date.getHours();
                         var minutes = date.getMinutes();
                         if((""+month).length == 1){
                              month="0"+month;
                         }
                         if((""+dates).length == 1){
                              dates="0"+dates;
                         }
                         if((""+hour).length == 1){
                              hour="0"+hour;
                         }
                         if((""+minutes).length == 1){
                              minutes="0"+minutes;
                         }
                         var last_date = year+"."+month+"."+dates+" "+hour+":"+minutes;
            
                $(".last_mofile_time").html(last_date);
                           if(data.favorite == 0){
                                //没有收藏
                                $(".compart_file_img s").removeClass("sc").addClass("nosc");
                           }else{
                                //收藏
                                $(".compart_file_img s").removeClass("nosc").addClass("sc");
                           }
                      }
                 })
            }

