var gkClientSetting = {
    clientInfo:null,
    init:function(){
	//初始化版本
	$(".version").html(L('sync_client_version')+": "+navigator.userAgent.substring(navigator.userAgent.indexOf(";")+1,navigator.userAgent.indexOf(";W")));
	//个人信息
		 $("#layout_member_info").tmpl(this.getComputerInfo()).appendTo($(".person_message"));	     
		  //设置配置文件位置
		  $(".file_index").find("input").val(gkClientInterface.getClientInfo().configpath);
		  //设置配置文件位置
		  $(".sync").find("input").val(gkClientInterface.getClientInfo().bindpath);
		  //设置权限
		  var baseconfig = {},gjconfig={},clientInfo = gkClientInterface.getClientInfo() ? gkClientInterface.getClientInfo() : this.clientInfo;

		  for(var k in clientInfo){
			  if(k == "auto"){
			  baseconfig["auto"] = {};
			  baseconfig["auto"]["k"] = k;
			     baseconfig["auto"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["auto"]["name"] = L('start_gokuai_on_system_startup');
			  }
			  if(k == "classic"){
			  baseconfig["classic"] = {};
			  baseconfig["classic"]["k"] = k;
			     baseconfig["classic"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["classic"]["name"] = L('revert_to_the_classic_contextmenu');
			  }
			    if(k == "https"){
	
				  gjconfig["https"] = {};
				  gjconfig["https"]["k"] = k;
			      gjconfig["https"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				  gjconfig["https"]["name"] = L('enable_https_contection');
			  }
			    if(k == "local"){
				 gjconfig["local"] = {};
				 gjconfig["local"]["k"] = k;
			     gjconfig["local"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 gjconfig["local"]["name"] = L('enable_lan_sync');
			  }
			   if(k == "lock"){
				 baseconfig["lock"] = {};
				 baseconfig["lock"]["k"] = k;
			     baseconfig["lock"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["lock"]["name"] = L('select_lock_file_remind_me_by_desktop_notification')
			  }
			  
			    if(k == "prompt"){
				 baseconfig["prompt"] = {};
				 baseconfig["prompt"]["k"] = k;
			     baseconfig["prompt"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["prompt"]["name"] = L('show_desktop_notifications');
			  }
			    if(k == "recycle"){
				baseconfig["recycle"] = {};
				 baseconfig["recycle"]["k"] = k;
			     baseconfig["recycle"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["recycle"]["name"] = L('other_members_del_my_share_folders_tip');
			  }

			    if(k == "shelltool"){
				 baseconfig["shelltool"] = {};
				 baseconfig["shelltool"]["k"] = k;
			     baseconfig["shelltool"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["shelltool"]["name"] = L('enable_gokuai_explorer_sidebar');
			  }
			  
		  }
		  $("#baseconfig").tmpl({baseconfig:baseconfig}).appendTo($("#main .basic"));
		  $("#gjconfig").tmpl({gjconfig:gjconfig}).appendTo($(".advance_gj"));
		  $(".opt").hover(function(){
		     if($(this).find("i").attr("class").indexOf("no_check_icon") < 0){
			     $(this).find("i").removeClass("check_icon").addClass("hover_check_icon");
			 }
		  },function(){
		  $(this).find("i").removeClass("check_icon").removeClass("hover_check_icon");
		  })
		  //点击取消选项
		    $(".opt").click(function(){
			 
                  if($(this).find("i").attr("class") == "hover_check_icon"){
                    $(this).find("i").removeClass("hover_check_icon").addClass("no_check_icon");
                  }else{
				  if($(this).find("i").attr("class") == "no_check_icon"){
				     $(this).find("i").removeClass("no_check_icon").addClass("check_icon");
				  }
				  else if($(this).find("i").attr("class") == "check_icon"){
				   $(this).find("i").removeClass("check_icon").addClass("no_check_icon");
				  }
				  }
                })
		  //注销登录
		  $(".edit_btn").click(function(){
		    gkClientInterface.logoOut();
		  })
		  //确定
		  $(".purple_btn").click(function(){
		    var params = {},currentLi;
			for(var i = 0,len = $(".opt").length;i<len;i++){
			   currentLi = $(".opt").eq(i);
			   if(currentLi.find("i").attr("class") == "no_check_icon"){
			       params[currentLi.data("config")] = 1;
			   }else{
			     params[currentLi.data("config")] = 0;
			   }
			}
			params["configpath"] = $(".file_index").find("input").val();
            if($('.chk.use_proxy').hasClass('checked')){
                params["proxy"] = 1;
            }else{
                params["proxy"] = 0;
            }
			gkClientInterface.setClientInfo(JSON.stringify(params));
		    gkClientInterface.closeWindow();
		  })
		  //取消
		  $(".cancel").click(function(){
		    gkClientInterface.closeWindow();
		  });
		  //清除缓存数据
		  $(".clearCache").click(function(){
		   if(confirm(L('are_sure_to_clear_cache'))){
		     gkClientInterface.clearCache();
		   }
		  })
		  //设置代理
		  $(".settingDl").click(function(){
		  
		    gkClientInterface.setConfigDl();
		  })
		  //移动
		  $(".move").click(function(){
			var d = gkClientInterface.moveFile( $(".file_index").find("input").val());
		   if(d!=""){
              $(".file_index").find("input").val(d);			
			}
	      })
		  //同步文件位置移动
		  $(".sync-move").click(function(){
		    var old = $(".sync").find("input").val();
			var d = gkClientInterface.getBindPath();
		   if(d!=""){
		      
		      if(confirm(L('are_you_sure_to_move_synchronize_directory',old,d))){
			    $(".sync").find("input").val(d);	
			      var syncPath = $(".sync").find("input").val();
				  gkClientInterface.moveSyncFile(syncPath);
				
			  }
              		
			}
	      })
		  //选择同步位置
		  $(".sync-position").click(function(){
			 var d = gkClientInterface.selectSyncFile("{\"name\":"+$(".sync").find("input").val()+",\"type\":3}"); 
	      })


        $('body').on('click','.chk',function(){
            $(this).toggleClass('checked');
            if($(this).hasClass('user_proxy')){
                if($(this).hasClass('ckecked')){

                }else{

                }
            }
        })
        if(clientInfo.proxy==1){
            $('.chk.use_proxy').addClass('checked');
        }else{
            $('.chk.use_proxy').removeClass('checked');
        }
    },
    getComputerInfo:function(){
        var clientInfo=null;
        var info = gkClientInterface.getClientInfo() ? gkClientInterface.getClientInfo() : this.clientInfo ;
        this.clientInfo = info;
		clientInfo = {
		    photourl:gkClientInterface.getUserInfo()?gkClientInterface.getUserInfo().photourl:"http://oss.aliyuncs.com/gkavatar2/e2/e29aff5326885a7a675a8ff46b6b08ba1e377b06.jpg",
            computer_name:info.computername,
            username:info.username
        };
        return clientInfo;
    },
    getFeatureSetting:function(){
        if(!this.clientInfo){
            this.clientInfo =gkClientInterface.getClientInfo();
        }
        var featureSettings = {
            auto:{
                checked:this.clientInfo.auto==1,
                name:L('start_gokuai_on_system_startup')
            },
            rightmenu:{
                checked:this.clientInfo.rightmenu==1,
                name:L('enable_gokuai_explorer_contextmenu')
            },
            prompt:{
               
            }
        };
        return featureSettings;
    }
};