function onClickHandler(info, tab) {
    //console.log("item " + info.menuItemId + " was clicked");
    //console.log("tab: " + JSON.stringify(tab));
	info.title = tab.title;
	switch(info.mediaType){
		case "image":
			uploadImage(info);
		break;
		case "selection":
			uploadText(info);
		break;
		case "page":
			uploadPage(info);
		break;
		default:
			if(info.selectionText){
				uploadText(info);
			}
		break;
	}
};

function uploadImage(info){
    //console.log("info: " + JSON.stringify(info));
	/*
		{
			"editable":false,
			"linkUrl":"http://www.cnblogs.com/",
			"mediaType":"image",
			"menuItemId":"contextimage",
			"pageUrl":"http://www.cnblogs.com/",
			"srcUrl":"http://static.cnblogs.com/images/logo_small.gif",
			"title":"博客园 - 开发者的网上家园"
		} 	
	*/
	
	var fileName = info.srcUrl.substring(info.srcUrl.lastIndexOf('/')+1);
	notify("保存图片："+fileName);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', info.srcUrl, true);
	xhr.responseType = 'arraybuffer';

	xhr.onload = function(e) {
	  if (this.status == 200) {
			var data = new Uint8Array(this.response);
			var blob = new Blob([data.buffer]);
			var formData = new FormData();
			formData.append("file",blob,fileName);
			uploadFile(formData);
		}
		else{
			notify("请求出错");
		}
	};

	xhr.send();
}

function uploadText(info){
    //console.log("info: " + JSON.stringify(info));
	/*
	
	Object {editable: false, 
	menuItemId: "contextselection", 
	pageUrl: "http://jsperf.com/string-to-uint8array", 
	selectionText: "0,j=str.length;i<j;++i){   arr.push(str.charCodeAt(i)); } uint=new Uint8Array(arr);", 
	title: "string to Uint8Array · jsPerf"}
	*/
	
	var content = "标题：" + info.title 
	+ "\r\n原文地址：" + info.pageUrl
	+ "\r\n选取正文：" + info.selectionText;
	notify("保存段落：" + info.title);
	
	var formData = new FormData();
	formData.append("file",getContentBlog(content),info.title+".txt");
	uploadFile(formData);
	
	function getContentBlog(str){
		str = unescape(encodeURIComponent(str));
		var arr=[];
		for(var i=0,j=str.length;i<j;++i){
		  arr.push(str.charCodeAt(i));
		}
		uint = new Uint8Array(arr);
		return new Blob([uint.buffer]);
	}
}

function uploadPage(info){
    console.log("info: " + JSON.stringify(info));
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function() {

  var contexts = ["selection","image"];	
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "【剪】爱"+(context == "image"?"图":(context=="page"?"页":"文"));
    chrome.contextMenus.create({"title": title, "contexts":[context], "id": "context" + context});
  }

});

function uploadFile(data){
/*
	<uploadToken>	是	上传凭证，位于token消息中。
	<xVariableName>		自定义变量的名字。
	<xVariableValue>		自定义变量的值。
	<fileName>	是	原文件名。
	对于没有文件名的情况，建议填入随机生成的纯文本字符串。
	本参数的值将作为魔法变量$(fname)的值使用。
	<fileBinaryData>	是	上传文件的完整内容。
	<key>		资源的最终名称，位于key消息中。如不指定则使用上传策略saveKey字段所指定模板生成Key，如无模板则使用Hash值作为Key。
	<crc32>		上传内容的 CRC32 校验码。
	如填入，则七牛服务器会使用此值进行内容检验。
	<acceptContentType>		当 HTTP 请求指定 Accept 头部时，七牛会返回的 Content-Type 头部的值。
	该值用于兼容低版本 IE 浏览器行为。低版本 IE 浏览器在 multiform 返回 application/json 的时候会表现为下载，返回 text/plain 才会显示返回内容。
	
*/
	getUploadToken(function(token){
		data.append("token",token);
		var xhr = new XMLHttpRequest();
		xhr.open("POST",'http://upload.qiniu.com',true);
			xhr.onload = function(e) {
			if (this.status == 200) {
				notify("恭喜你，成功保存");
			}else{
				console(this);
			}
		}
		xhr.send(data);
	});
}


function getUploadToken(callback){
	chrome.storage.sync.get(function(data){
		var token = data.token;
		if(token){
			var token_time = data.token_time;
			var now =  (new Date().getTime() / 1000);
			if(token_time){
				token_time = new Date(token_time);
				if(token_time.getYear() == NaN){
					token = generateToken(data);
				}else{
					var time = token_time.getTime() / 1000;
					if((now - time) / 3600 > 12){
						token  = generateToken(data);
					}
				}
			}else{
				token  = generateToken(data);
			}
		}else{
			if(!data.bucket || !data.ak || !data.pk){
				notify("请先右键点击【剪·爱】图标，配置七牛属性。");
				return;
			}
			else{
				token = generateToken(data);
			}
		}
		
		if(token){
			callback(token);
		}
	});
}

function generateToken(config){
	var safe64 = function(base64) {
        base64 = base64.replace(/\+/g, "-");
        base64 = base64.replace(/\//g, "_");
        return base64;
    };
	
	var token_time = new Date();
	
	var put_policy = JSON.stringify({
		"scope":config.bucket,
		"deadline":Math.round(token_time.getTime() / 1000) + 12 * 3600
	});
	
	var encoded = base64encode(utf16to8(put_policy));
	
	var hash = CryptoJS.HmacSHA1(encoded, config.pk);
	var encoded_signed = hash.toString(CryptoJS.enc.Base64);
	
	var upload_token = config.ak + ":" + safe64(encoded_signed) + ":" + encoded;
	
	config.token = upload_token;
	config.token_time = token_time.toLocaleString();
	
	chrome.storage.sync.set(config);
	
	console.log(config);
	
	return upload_token;
}

function notify(message){
	console.log(message);
	chrome.notifications.create("",{
		title:"提醒",
		type:"basic",
		iconUrl:"icon.png",
		message:message
	},function(id){});
}







