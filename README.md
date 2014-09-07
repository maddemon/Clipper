剪·爱
================================
基础DEMO版本，仅提供了图片和选取文字上传到七牛云存储功能，插件需要配置AK PK和Bucket参数，参数保存在chrome.sync中，
数据传输不经过第三方服务端转发，直接由插件POST。


###下载图片
>下载指定URL图片的代码，利用XHR2，通过permissions指定可以访问任何站点(跨域)。

      var xhr = new XMLHttpRequest();
      xhr.open('GET', info.srcUrl, true);
      xhr.responseType = 'arraybuffer';//xhr2的功能
      xhr.onload = function(e) {
        if (this.status == 200) {
      		var data = new Uint8Array(this.response);
      		var blob = new Blob([data.buffer]);//创建Blob对象
      		//...
      	}
      }

###POST数据 代码
>纯Javascript实现上传，html5利用FormData对象即可，formData包含Blob数据就会自动设置为multipart/form-data。

    var data = new FormData();
    data.append("file",blob,fileName);
    data.append("token",token);
    var xhr = new XMLHttpRequest();
    xhr.open("POST",'http://upload.qiniu.com',true);
    	xhr.onload = function(e) {
    	if (this.status == 200) {
    		notify("恭喜你，成功保存");
    	}
    }
    xhr.send(data);



###生成Token
>官方提供的在线生成器，抄其代码即可。

###其他
>这只是一版最基本DEMO，这方面可以照着Evernote clipper做的很炫，全靠时间，有兴趣的可以拿去用，希望对你有帮助。
