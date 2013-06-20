var gkClientSetting = {
    clientInfo:null,
    init:function(){

    },
    getComputerInfo:function(){
        var clientInfo=null;
        var info = gkClientInterface.getClientInfo();
        this.clientInfo = info;
        clientInfo = {
            computer_name:info.computername,
            username:info.username
        };
        return clientInfo
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