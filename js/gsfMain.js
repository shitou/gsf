function insertVal(str){
	var sel = getSelection();
	var at = sel.getRangeAt(0);
	var elt = document.createElement("div");
	elt.innerHTML = str;
	
	var node = elt.children[0];
	
	at.insertNode(node);
}
function setMath(math){
	
	//math = "<math>"+$(math).html()+"</math>";
	
	if($.currIfr){
		if($($.currIfr).is("img")){
			$($.currIfr).replaceWith(getInsertTemplete(encodeURIComponent(math)));
			//$.currIfr.src = "js/mathview.html?"+math;
			$.currIfr = null;
		}else{
			$.currIfr.src = "js/mathview.html?"+encodeURIComponent(math);
			$.currIfr = null;
		}
		$(".dialogBg").hide();
	}else{
		$(".dialogBg").hide();
		$($.editCurr).focusCurr(window);
		
		insertVal(getInsertTemplete(encodeURIComponent(math)));
	}
	
}

function InitGsf(opt){
	$.gsfInput = opt.input;
	$('body').append('<div class="dialogBg">'+
					'	<a href="javascript:void(0)" id="linkClose">关闭</a>'+
					'	<iframe id="dialogGsf" src="ui.html" scrolling="no" width="80%" height="600" frameborder="0"></iframe>'+
					'</div>');
	$(".dialogBg").click(function(e){
		if(e.target.className=="dialogBg"){
			$("#linkClose").click();
		}
	});
	$(opt.clickBtn).click(function(){
		$(".dialogBg").show();
	});
	$("#linkClose").click(function(){
		$(".dialogBg").hide();
		document.getElementById("dialogGsf").contentWindow.resetGsf();
		$.currIfr = null;
	});
	$($.gsfInput).find("img").bind("dblclick",function(){

		var latex = "{"+unescape(this.src.substring(this.src.indexOf("gif.latex?")+10))+"}";
		$(".dialogBg").show();
		//document.getElementById("dialogGsf").contentWindow.UpdateMath(latex);
		$.currIfr = this;
		var mathml = latexToMathML(latex);
		var text = "<span class='math'>"+$(mathml).html()+"</span>";
		document.getElementById("dialogGsf").contentWindow.$("#gsf").html(text);
		document.getElementById("dialogGsf").contentWindow.initEdit();
		
	});
	$($.gsfInput).focus(function(){
		$.editCurr = this;
	});

}
function latexToMathML(latex) {
	var n = document.getElementById("latexToMathMl");
	if(!n){
		$("body").append('<span id="latexToMathMl" style="display:none;"></span>');
		n = document.getElementById("latexToMathMl");
	}
	latex = latex.replace(/^(\$|\\)(.*)(\$|\\)$/g,"$2");
	
	n.innerHTML = "$"+latex+"$";
	
	AMprocessNode(n, false);
	return n.innerHTML;
}
function loadGs(ifr){

	var body = ifr.contentWindow.document.body.children[0];
	var t = 0;
	if($(body).children().children("msubsup,msubsub").length>0){
		t = 6;
		body.style.marginTop = t+"px";
	}
	
	ifr.height = parseInt(getComputedStyle(body.children[0]).height)+t*2;
	ifr.width = parseInt(getComputedStyle(body.children[0]).width);
	
	body.parentNode.ondblclick = function(){
		parent.$(".dialogBg").show();
		parent.document.getElementById("dialogGsf").contentWindow.$("#gsf").html($(body).clone());
		parent.$.currIfr = ifr;
		parent.document.getElementById("dialogGsf").contentWindow.initEdit();

	}
}
