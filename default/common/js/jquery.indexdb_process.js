/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var IndexDBProcess = (function(){
    function index_db_process(options){
           if(!(this instanceof index_db_process)){
                return new index_db_process(options);
           }
          this.DB_NAME = options.DB_NAME; 
          this.DB_OBJECT_STORE = options.DB_OBJECT_STORE;
          this.DB_STRUCT = options.DB_STRUCT;
        
          this.init();
    } 
   index_db_process.prototype = {
         init:function(){
             var _this = this;
             $.indexedDB(_this.DB_NAME,{
                
                  "schema":{
                        "1":function(version){
                         
                   _this.OBJECT_STORE =  version.createObjectStore(_this.DB_OBJECT_STORE,{
                                    keyPath:_this.DB_STRUCT[0]["keyName"],
                               autoIncrement:_this.DB_STRUCT[0]["autoIncrement"]
                          });
                          
                          //建立索引
                         $.each(_this.DB_STRUCT,function(k,v){ 
                              _this.OBJECT_STORE.createIndex(v["keyName"],{
                                   unique:v["unique"]
                              })
                          });
                          
                       },
                        "2":function(version){
                           alert(_this.DB_STRUCT);
                           _this.OBJECT_STORE =  version.createObjectStore(_this.DB_OBJECT_STORE);
                        }
                                
                  }
             })//.transaction(_this.DB_OBJECT_STORE,"readwrite");
                       
                 
             
             

            
          
              
         },
         Add:function(obj){
            var _this = this,_objectStore = $.indexedDB(_this.DB_NAME).objectStore(_this.DB_OBJECT_STORE);
            _objectStore.add(obj);
        
         },
         Delete:function(itemId){
              var _this = this,_objectStore = $.indexedDB(_this.DB_NAME).objectStore(_this.DB_OBJECT_STORE);
              var d = _objectStore.delete(itemId);
    
              for(var v in d.rejectWith()){
                   alert(v);
              }
         },
                 //等数据全部存在在操作
         SelectAll:function(fn){
             
             var _this = this,_objectStore = $.indexedDB(_this.DB_NAME).objectStore(_this.DB_OBJECT_STORE);
              _objectStore.each(function(item){
                 fn.call(item.value,item.key,item.value,item);
              })
         },
         SelectOnly:function(itemId,fn){
             var _this = this,_objectStore = $.indexedDB(_this.DB_NAME).objectStore(_this.DB_OBJECT_STORE);
             _objectStore.get(itemId).then(function(item){
                  fn.call(item,item);
             });
         },
         Clear:function(){
           //清除表所有的数据
             var _this = this,_objectStore = $.indexedDB(_this.DB_NAME).objectStore(_this.DB_OBJECT_STORE);
             _objectStore.clear();
         }
   }
   return index_db_process;
      
})();


