var http = require("http");
var URL = require("url");
var fs = require("fs");
var path = require("path");
var query = require("querystring");


var types = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};
var t = {
	get : function(url, cb){
	  http.get(url, function(res) {

		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
		  size += chunk.length;
		  chunks.push(chunk);
		});

		res.on('end', function(){
		  var data = Buffer.concat(chunks, size);
		  cb(null, data);
		});

	  }).on('error', function(e) {
		cb(e, null);
	  });
	}
}
var server = http.createServer(function(req,res){
	// need it...	
	var pathname = URL.parse(req.url).pathname;	
	if(/\.do$/.test(pathname)){
		var sname = pathname.substring(pathname.indexOf("/")+1);
		var item = query.parse(req.url.substring(req.url.indexOf("?")+1));
		if(sname=="content.do"){ //index.html的查询
			res.writeHead(200,{'Content-Type':types["html"]});
			t.get(item.href,function(e,data){			
				var newstr = iconv.decode(data, 'gb2312');
				var $ = cheerio.load(newstr);
				var imglist = $(".imgList").html();
				
				res.write(imglist);
				res.end();
			});
		}else if(sname=="item.do"){ //dtxq.html的查询
			res.writeHead(200,{'Content-Type':types["html"]});			
			t.get(item.href,function(e,data){			
				var newstr = iconv.decode(data, 'gb2312');
				var $ = cheerio.load(newstr);
				var imglist = $("#contents img");
				var prev = $(".thisclass").prev().find("a").attr("href");
				var next = $(".thisclass").next().find("a").attr("href");
				var domain = item["href"].substring(0,item["href"].lastIndexOf("/")+1);
				var result = {};
				if(prev!="#"){
					result.prev = domain+prev;
				}
				if(next!="#"){
					result.next = domain+next;
				}
				result.items = [];
				imglist.each(function(){
					result.items.push($(this).attr("src"));
				});
				res.write(JSON.stringify(result));
				res.end();
			});
		}else if(sname=="next.do"){	//xiangXi.html的查询	
			
		}else if(sname=="saveInfo.do"){	//保存报告数据	
			
		}
	}else{
		var realPath = __dirname+pathname ;
		var ext = path.extname(realPath);
		var contentType = "";
		if(ext==""){
			contentType = "html";
			realPath+="index.html";
		}else{
			contentType = ext.substring(1);
		}
		realPath = decodeURI(realPath);
		
		fs.exists(realPath,function(exists){
			if(exists){
				fs.readFile(realPath,"binary",function(err,file){
					if(err){
						res.writeHead(200,{'Content-Type':types["html"]});
						res.end("500");
					}else{
						res.writeHead(200,{'Content-Type':types[contentType]});
						res.write(file,"binary");
						res.end("");
					}				
				});
			}else{
				res.writeHead(200,{'Content-Type':types["html"]});
				res.end("404");
			}
		});
	}
}).listen(8081);




