var gkClientSetting = {
    clientInfo:null,
    init:function(){
	//初始化版本
	$(".version").html("版本："+navigator.userAgent.substring(navigator.userAgent.indexOf(";")+1,navigator.userAgent.indexOf(";W")));
	//个人信息
		 $("#layout_member_info").tmpl(this.getComputerInfo()).appendTo($(".person_message"));	     
		  //设置配置文件位置
		  $(".file_index").find("input").val(gkClientInterface.getClientInfo().configpath);
		  //设置配置文件位置
		  $(".sync").find("input").val(gkClientInterface.getClientInfo().bindpath);
		  //设置权限
		  var baseconfig = {},gjconfig={},clientInfo = gkClientInterface.getClientInfo() ? gkClientInterface.getClientInfo() : this.clientInfo;
console.log(this.clientInfo);		  
		  for(var k in clientInfo){
		 
			  if(k == "auto"){
			  
			  baseconfig["auto"] = {};
			  baseconfig["auto"]["k"] = k;
			     baseconfig["auto"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["auto"]["name"] = "系统启动时运行够快";
			  }
			  if(k == "classic"){
			  baseconfig["classic"] = {};
			  baseconfig["classic"]["k"] = k;
			     baseconfig["classic"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["classic"]["name"] = "使用经典右键菜单";
			  }
			    if(k == "https"){
	
				  gjconfig["https"] = {};
				  gjconfig["https"]["k"] = k;
			      gjconfig["https"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				  gjconfig["https"]["name"] = "开启HTTPS安全连接";
			  }
			    if(k == "local"){
				 gjconfig["local"] = {};
				 gjconfig["local"]["k"] = k;
			     gjconfig["local"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 gjconfig["local"]["name"] = "开启局域网内高速同步";
			  }
			   if(k == "lock"){
				 baseconfig["lock"] = {};
				 baseconfig["lock"]["k"] = k;
			     baseconfig["lock"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["lock"]["name"] = "选中被锁定的文件时，用气泡提醒我。";
			  }
			  
			    if(k == "prompt"){
				 baseconfig["prompt"] = {};
				 baseconfig["prompt"]["k"] = k;
			     baseconfig["prompt"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["prompt"]["name"] = "显示桌面通知";
			  }
			    if(k == "recycle"){
				baseconfig["recycle"] = {};
				 baseconfig["recycle"]["k"] = k;
			     baseconfig["recycle"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["recycle"]["name"] = "别人删除与我共享的文件时，也进入我电脑的回收站";
			  }

			    if(k == "shelltool"){
				 baseconfig["shelltool"] = {};
				 baseconfig["shelltool"]["k"] = k;
			     baseconfig["shelltool"]["checked"] = (clientInfo[k] == 1) ? "no_check_icon" : "check_icon";
				 baseconfig["shelltool"]["name"] = "开启Explorer右侧边栏";
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
			gkClientInterface.setClientInfo(JSON.stringify(params));
		    gkClientInterface.closeWindow();
		  })
		  //取消
		  $(".cancel").click(function(){
		    gkClientInterface.closeWindow();
		  });
		  //清除缓存数据
		  $(".clearCache").click(function(){
		   if(confirm("是否清除缓存数据")){
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
		      
		      if(confirm("您是否确定移动同步目录"+old+"到"+d+"")){
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
                name:'软件自动开机启动'
            },
            rightmenu:{
                checked:this.clientInfo.rightmenu==1,
                name:'Explorer右键菜单支持'
            },
            prompt:{
               
            }
        };
        return featureSettings;
    }
};