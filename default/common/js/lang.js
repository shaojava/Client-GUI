var lang ='zh-cn';
if(Util.Browser.compareVersion(gkClientInterface.getClientVersion(),'2.1.5.0')>=0 &&navigator.language){
    lang = navigator.language;
    if (lang != 'zh-cn' && lang != 'en-us') {
        lang = 'en-us';
    }
}
document.write(unescape("%3Cscript src='../common/js/lang/"+lang+".js' type='text/javascript'%3E%3C/script%3E"));