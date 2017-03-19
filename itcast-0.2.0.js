( function ( global ){
  var document = global.document,
      arr = [],
      push = arr.push,
      slice = arr.slice;

  function itcast ( selector ){
    return new itcast.fn.init( selector );
  }

  itcast.fn = itcast.prototype = {
    constructor: itcast,
    length: 0,   // 由于itcast对象是伪数组对象，默认length属性值为 0
    toArray: function (){
      return slice.call( this );
    },
    get: function ( index ){
      if ( index == null ){
        return this.toArray();
      }

      return this[ index < 0 ? this.length + index : index ];
    },
    eq: function ( index ){
      return itcast( this[ index < 0 ? this.length + index : index ] );
    },
    first: function () {
      return this.eq( 0 );
    },
    last: function () {
      return this.eq( -1 );
    },
    each: function ( callback ){
      itcast.each( this, callback );
      return this;
    },
    splice: arr.splice
  };

  var init = itcast.fn.init = function ( selector ){
    if ( !selector ){
      return this;
    } else if ( itcast.isString( selector ) ){
      if ( itcast.isHTML( selector ) ){
        push.apply( this, itcast.parseHTML( selector ) );
      } else {
        push.apply( this, document.querySelectorAll( selector ) );
      }
    } else if ( itcast.isDOM( selector ) ) {
      this[ 0 ] = selector;
      this.length = 1;
    } else if ( itcast.isArrayLike( selector ) ){
      push.apply( this, selector );
    } else if ( itcast.isFunction( selector ) ){
      document.addEventListener( 'DOMContentLoaded', function (){
        selector();
      } );
    }
  };

  init.prototype = itcast.fn;

  itcast.extend = itcast.fn.extend = function (){
    var args = arguments,
        i = 0,
        l = args.length,
        obj,
        k;

    for ( ; i < l; i++ ){
      obj = args[ i ];
      for ( k in obj ){
        if ( obj.hasOwnProperty( k ) ){
          this[ k ] = obj[ k ];
        }
      }
    }

    return this;
  };

  itcast.extend( {
    each: function ( obj, callback ){
      var i = 0,
          l;
      // 1 如果obj为数组或伪数组
      if ( itcast.isArrayLike( obj ) ){
        l = obj.length;
        // 使用for循环遍历数组或伪数组
        for ( ; i < l; i++ ){
          // 执行指定的回调函数callback，改变内this值为 当前遍历到的元素，同时传入 i 和 obj[ i ]
          // 判断回调函数callback的返回值，如果为false结束循环
          if ( callback.call(obj[ i ], i, obj[ i ] ) === false ){
            break;
          }
        }
      // 2 如果obj是普通对象
      } else {
        for ( i in obj ){
          if ( callback.call(obj[ i ], i, obj[ i ] ) === false ){
            break;
          }
        }
      }

      return obj;
    },
    type: function ( obj ){
      if ( obj == null ){
        return obj + '';
      }

      return typeof obj !== 'object' ? typeof obj :
          Object.prototype.toString.call( obj ).slice( 8, -1 ).toLowerCase();
    },
    parseHTML: function ( html ){
      var div = document.createElement( 'div' ),
          node,
          ret = [];

      div.innerHTML = html;

      for( node = div.firstChild; node; node = node.nextSibling ){
        if ( node.nodeType === 1 ){
          ret.push( node );
        }
      }

      return ret;
    },
    unique:function(arr){
      var ret = [];
      itcast.each(arr,function(){
       if( ret.indexOf(this) === -1){//次数的this指向每一个数组中的元素值arr[i] v
          ret.push(this);
       }
      });
      return ret;
    }
  } );

  itcast.extend( {
    isString: function ( obj ){
      return typeof obj === 'string';
    },
    isHTML: function ( obj ){
      obj = obj + '';
      return obj[ 0 ] === '<' && obj[ obj.length - 1 ] === '>' && obj.length >= 3;
    },
    isDOM: function ( obj ){
      return !!obj && !!obj.nodeType;
    },
    isArrayLike: function ( obj ){
      var length = !!obj && 'length' in obj && obj.length,
          type = itcast.type( obj );

      if ( type === 'function' || itcast.isWindow( obj ) ){
        return false;
      }

      return type === 'array' || length === 0 || 
          typeof length === 'number' && length > 0 && ( length - 1 ) in obj;
    },
    isFunction: function ( obj ){
      return typeof obj === 'function';
    },
    isWindow: function ( obj ){
      return !!obj && obj.window === obj;
    }
  } );

  //itcast上面扩展实例方法（功能类方法）
  itcast.fn.extend({
    appendTo:function(target){
      target = itcast(target);//将传入的目标位置转换成jquery对象  来使用jq的方法
      //this指向方法的调用者   也就是itcast对象
      var that = this;
      var ret = [],node;
      target.each(function(i,v){
        that.each(function(j,node){
          //实现链式编程
          node = i===0?node:node.cloneNode(true);
          ret.push(node);
          v.appendChild(node);
        })
      })
      return ret;
    },
    append:function(source){
      //将source改变成itcast对象
       source = itcast(source);
       source.appendTo(this);
       return this;
    },
    prependTo:function(target){
       //将source改变成itcast对象
       target = itcast(target);
       //缓存this
       var that = this,
          node,
          ret=[];
       //遍历target
       target.each(function(i,v){
        var firstChild = v.firstChild;
        //遍历需要传入的jq对象
        that.each(function(){
          node = i===0?this:this.cloneNode(true);
          ret.push(node);
          v.insertBefore(node,firstChild);
        });
        return itcast(ret);
       });
    },
    prepend:function(source){
      source = itcast(source);
      source.prependTo(this);
       return this;
    },
    next:function(){
      var ret = [];
      this.each(function(i,v){
        var node = v.nextSibling;
        while(node){
          if(node.nodeType===1){
            ret.push(node);
            break;
          }

          node=node.nextSibling;
        }
      });
      return itcast(ret);

    },
    nextAll:function(){
      var ret = [];
      this.each(function(i,v){
        var node = v.nextSibling;
        while(node){
          if(node.nodeType===1){
            ret.push(node);
          }
          node = node.nextSibling;
        }
      });
       return itcast(itcast.unique(ret));
    },
    prev:function(){
      var ret = [];
      this.each(function(i,v){
        //第一种方法
        var node = v.previousSibling;
        while(node){
          if(node.nodeType === 1){
            ret.push(node);
            
            break;
          }
          node = node.previousSibling;
        }
        return ret;
        //第二种方法
        // var node = v.previousElementSibling;
        // ret.push(node);
        // return ret;

      });
      return  itcast(ret);
    },
    prevAll:function(){
      var ret = [];
      this.each(function(i,v){
        var node =v.previousSibling;
        while(node){
          if(node.nodeType===1){
            ret.push(node); 
          }
          node = node.previousSibling;
        }
      });
      return  itcast(ret);
    },
    remove:function(){
      this.each(function(i,v){
        this.parentNode.removeChild(this);
      });
      return this;
    },
    empty:function(){
      this.each(function(){
        this.innerHTML='';
      });
      return this;
    },
    before:function(node){
     
      if(itcast.isString(node)){
        node = itcast(document.createTextNode(node));
      }else{
        node = itcast(node);
      }
      this.each(function(i,v){
        node.each(function(j,k){
          v.parentNode.insertBefore(i===0?k:k.cloneNode(true),v);
        })
      });
      return this;
    },
    after:function(node){
      if(itcast.isString(node)){
          node = itcast(document.createTextNode(node));
        }else{
          node = itcast(node);
        }
        this.each(function(i,v){
          node.each(function(j,k){
            v.parentNode.insertBefore(i===0?k:k.cloneNode(true),v.nextSibling);
          })
        });
        return this;
      }
  });

  //功能类方法    属性方法模块
  itcast.fn.extend({
    val:function(value){
      if(value==undefined){//表示获取   只能获取所有中的第一个
          return this.length===0?undefined:this[0].value;
      }else{//表示设置  设置所有的
          if(this.length===0){
            return undefined;
          }else {
            this.each(function(){
              this.value=value;
            })
          }
      }
    }
  })
  if ( typeof define === 'function' ){
    define( function (){
      return itcast;
    } );
  } else if ( typeof exports !== 'undefined' ) {
    module.exports = itcast;
  } else {
    global.$ = itcast;
  }
}( window ) );