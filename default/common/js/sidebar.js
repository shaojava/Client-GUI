var gkClientSidebar = {
    init:function(){
        var _context = this;
        _context.fetchAccountInfo();
        $(".header_nav").click(function(){
            gkClientInterface.launchpad();
        })
    },
    fetchAccountInfo:function(){
        var account = gkClientInterface.getUserInfo();
        console.log(account);
        var data = {
            username:account.username,
            org_name:account.org_name,
            photourl:account.photourl,
            used_size:Util.Number.bitSize(account.size),
            capacity:Util.Number.bitSize(account.capacity),
            org_used_size:Util.Number.bitSize(account.org_size),
            org_capacity:Util.Number.bitSize(account.capacity)
        };
        var account_info = $('#accountInfoTmpl').tmpl(data).appendTo($('#header'));
        account_info.find('.user_info').show();
    }
};