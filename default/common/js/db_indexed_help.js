/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
   //封装对数据库的操作
                (function(win){
                   
                    var _gk_clientside_database = function(options){
                         var req = window.indexedDB.open("zengwenbing123",1);
                  
                         //开始就允许修改表
                         req.onsuccess = function(e){
                               //第二次进入表的时候
                               var db = e.target.result;//得到数据库对象
                        
                               var transaction  = db.transaction("studentinfo","WRITE_READ");
                               var store = transaction.objectStore("studentinfo");  
    var subReq = store.add("zg", "name");  
    // var subReq = store.get(key);  
    // var subReq = store.delete(key);  
    // var subReq = store.clear();  
    subReq.onsuccess = function (e) {  
         
        console.log(subReq.result);  
    };  
                         }
                         req.onerror = function(e){
                             
                         }
                         req.onupgradeneeded = function(e){
                             alert("fds")
                              //得到当前数据库对象
                              var db = e.target.result;
                              db.createObjectStore("studentinfo",{
                                   keyPath:"id",
                                   autoIncrement:true
                              });
                              
                         }
                    }
                     
                     win.GK_CLIENTSIDE_DATABASE = _gk_clientside_database;
                    
                })(window);
        




