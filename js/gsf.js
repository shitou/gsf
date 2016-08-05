function filterMathml(mathml){
	var obj = $("<div>"+mathml+"</div>");
	var mfarc = obj.find("mfrac,msqrt,msup,msub,mroot,munder,munderover,msubsup,mover");
	mfarc.each(function(){
		$(this).children(":nonechild").each(function(){
			$(this).replaceWith("<mrow><mn>"+$(this).html()+"</mn></mrow>");
		});
		
	});
	if($(this).parents(".bt1").length==1){
		obj.find(".bg6:nonechild").each(function(){
			$(this).replaceWith("<mrow><"+this.tagName+" class='bg6'></"+this.tagName+"></mrow>");
		});
	}
	if(/^\∑|\∫|\∏|\∯|\∬\|∭|\∮|\∰|\∳|\∲$/.test(obj.children().children(":first").html())){
		obj.children().children(":nonechild").each(function(){
			$(this).replaceWith("<mrow><"+this.tagName+">"+$(this).html()+"</"+this.tagName+"></mrow>");
		});
	}
	return obj.html();
}
function toMathML(jax,callback) {
	var mml;
	try {
	  mml = jax.root.toMathML("");
	} catch(err) {
	  if (!err.restart) {throw err} // an actual error
	  return MathJax.Callback.After([toMathML,jax,callback],err.restart);
	}
	MathJax.Callback(callback)(mml);
  }

function filterMml(mml){
	mml = mml.replace(/<math([^>]+)>/g,"<span class='math'>").replace(/<\/math>/g,"</span>").replace(/\n\s+/g,"");
	return mml;
}
function checkMathml(mml){
	var gsf = $(mml);
	var msqrt = $(gsf).find("msqrt");
	
	msqrt.each(function(){
		if(this.children.length>1){
			var mrow = $(this).children("mrow:first");
			if(mrow.length==0){
				$(this).append("<mrow></mrow>");
				mrow = $(this).children("mrow:first");
			}
			mrow.append(mrow.siblings());
		}
	});
	return gsf;
}
function insertVal(mathml){
	if($("body").find($.focusCurr).length==0){
		$.focusCurr = $("#gsf [contenteditable]:last");
	}
	$.focusCurr.focusCurr();
	var sel = getSelection();
	var bnode = $(sel.anchorNode);
	if(!bnode.is("[contenteditable]") && $("#gsf").find(bnode).length==0){
		return;
	}
	var at = sel.getRangeAt(0);
	at.deleteContents();
	var node = document.createElement("div");
	node.innerHTML = mathml;
	var istNode = node.children[0];
	at.insertNode(istNode);
	var oldNode = istNode.parentNode;
	var oldTag = oldNode.tagName;
	var listNode = oldNode.childNodes;
	var newNode = document.createElement("mrow");
	var ptNode = istNode.parentNode.parentNode;
	for(var i=0;i<listNode.length;i++){
		var n = listNode[i];
		if(n.nodeValue && n.nodeValue.trim()!=""){
			var tnode = document.createElement(oldTag);
			tnode.innerHTML = filterMml(n.nodeValue);
			newNode.appendChild(tnode);
		}else{
			newNode.appendChild(n.cloneNode(true));
		}
	}
	ptNode.replaceChild(newNode,oldNode);
	var firstClen = newNode.children[0].children.length;
	var lastClen = newNode.children[newNode.children.length-1].children.length;
	if(firstClen>0 && lastClen>0){
		$(newNode).append("<mrow class='bgnone'></mrow>");
		$(newNode).prepend("<mrow class='bgnone'></mrow>");
	}else if(firstClen>0 && lastClen==0){
		$(newNode).prepend("<mrow class='bgnone'></mrow>");
	}else if(firstClen==0 && lastClen>0){
		$(newNode).append("<mrow class='bgnone'></mrow>");
	}
	newNode.innerHTML = newNode.innerHTML.replace(/>(\s+|\n+)</g,"><");
	var pt = newNode;
	//if(!/mrow|mo|mi|mn/.test(pt.tagName.toLowerCase())){
		pt = newNode.parentNode;
		$(newNode).replaceWith(newNode.innerHTML);
		
	//}
	initEdit();
	var ptlist = $(pt).find(".bg6").not(".bgnone");
	if(ptlist.length==0){
		$.focusCurr = $(pt).children(":last").focus();
	}else{
		$.focusCurr = ptlist.first().focus();
	}
	$.focusCurrOffset = {
		start : 0,
		end : 0
	}

}
$.expr[":"].nochild = function(obj){
	return $(obj).text().trim()=="";
}
$.expr[":"].onechild = function(obj){
	return $(obj).find("*").length==1;
}
$.expr[":"].nonechild = function(obj){
	return $(obj).find("*").length==0;
}
$.cxArr = [];
$.cxIndex = -1;
function cxFunc(){
	//记录10步操作，提供撤销与还原
	//setTimeout(function(){
		var str = $("#gsf").html();
		if(str==$.cxArr[$.cxArr.length-1])return;
		$.cxArr.push(str);
		if($.cxArr.length==11){
			$.cxArr.splice(0,1);
		}
		
	//});
}
function cxInit(){
	return;
	$("body").bind("keydown",function(e){
		var code = e.keyCode;
		if(e.ctrlKey && code==90){
			if($.cxIndex==-1){
				$.cxIndex = $.cxArr.length-1;
			}

			$("#gsf").html($.cxArr[$.cxIndex]);
			initEdit();
			if($.cxIndex>0){
				$.cxIndex--;
			}
			return false;
		}else if(e.ctrlKey && code==89){
			if($.cxIndex==-1){
				$.cxIndex = 0;
			}
			$("#gsf").html($.cxArr[$.cxIndex]);
			initEdit();
			if($.cxIndex<$.cxArr.length-1){
				$.cxIndex++;
			}
			return false;
		}
		cxFunc();
	});
}
function resetGsf(){
	$("#gsf").html('<span class="math"><mrow><mrow class="one" contenteditable="true"></mrow></mrow></span>').find("[contenteditable]").focus();
	initEdit();
}
function initEdit(){
	$("#gsf [contenteditable]").removeAttr("contenteditable");
	$("#gsf").find("munder,munderover,msubsup,msub").each(function(){
		if($(this).parent().is("mrow") && $(this).next().is("mrow") && $(this).siblings().length==1){
			$(this).next().addClass("bgnone");
		}
	});
	var arr = [];
	$("#gsf *").each(function(){
		var elt = this;			
		if(elt.children.length==0){
			var str = elt.innerHTML.trim();
			if(/^\(|\[|\{|\〈|\||\‖|\⌊|\⌋|\⌈|\⌉|\〚|\〛|\〉|\}|\]|\)|\/$/.test(str) && str.length==1){
				if(!$(this).hasClass("text")){
					$(this).addClass("noedit1");
				}else{
					arr.push(elt);
				}
			}else if(/^\˜|\^|\⌢|\︹|\¯|\¯|\¯|\_|\_|\_|\→|\←|\⇀|\↔|\→|\←|\⇁|\↔|\⇄|\⇌$/.test(str) && str.length==1){
				if(!$(this).hasClass("text")){
					$(this).addClass("noedit2");
				}else{
					arr.push(elt);
				}
			}else if(/^\∑|\∫|\∬|\∭|\∮|\∯|\∰|\∲|\∳|\∪|\∩|\∏|\∐$/.test(str) && str.length==1){
				if(!$(this).hasClass("text")){
					$(this).addClass("noedit3");
				}else{
					arr.push(elt);
				}
			}else{
				arr.push(elt);
			}
		}
	});
	updateKuohao();
	$(arr).attr("contenteditable",true).unbind("keydown keyup click focus").bind("keydown",function(e){
		var code = e.keyCode;
		if(code==13){
			return false;
		}else if(code==37){
			var ct = $("#gsf [contenteditable]");
			var index = ct.index(this);
			if(index<0){index=ct.length-1}
			if($.focusCurrOffset.start==0){
				ct.eq(index-1).focusEnd();
				return false;
			}
		}else if(code==38){
			var ct = $("#gsf [contenteditable]");
			var index = ct.index(this);
			if(index<0){index=ct.length-1}
			ct.eq(index-1).focusEnd();
			return false;
		}else if(code==39){
			var ct = $("#gsf [contenteditable]");
			var index = ct.index(this);
			if(index>=ct.length-1){index=-1}
			if($.focusCurrOffset.start==this.innerHTML.length){
				ct.eq(index+1).focus();
				return false;
			}
		}else if(code==40){
			var ct = $("#gsf [contenteditable]");
			var index = ct.index(this);
			if(index>=ct.length-1){index=-1}
			ct.eq(index+1).focusEnd();
			return false;
		}else if(code==8){
			if(this.innerText.length==0){
				var ct = $("#gsf [contenteditable]");
				var index = ct.index(this);
				if(index<0){index==0}
				if(ct.filter("[contenteditable]").length<=1){
					resetGsf();
					return;
				};
				ct.eq(index-1).focusEnd();
				if($(this).parent("mrow").prev("mrow").children(".noedit3").length>0){
					$(this).parent().parent().next(":empty").remove();
					$(this).parent().parent().remove();
				}else if($(this).prev(".noedit3").length>0){
					$(this).parent().next(":empty").remove();
					$(this).parent().remove();
				}
				if($(this).prev("mrow").children(".noedit1").length>0){
					var mrow = $(this).prev("mrow");
					if(mrow.prev(":nonechild").length==1){
						mrow.next(":empty").remove();
						mrow.prev(":nonechild").focusEnd();
					}else{
						$(this).focus();
					}
					mrow.remove();
					
					return false;
				}
				if($(this).siblings().length==0 && $(this).parent().siblings(".noedit1").length>0){
					var mrow = $(this).parent().parent();
					if(mrow.prev(":nonechild").length==1){
						mrow.next(":empty").remove();
						mrow.prev(":nonechild").focusEnd();
					}else{
						$(this).focus();
					}
					mrow.remove();
					return false;
				}
				if($(this).siblings().length==0 && $(this).parent().is(".del")){
					var mrow = $(this).parent();
					if(mrow.prev(":nonechild").length==1){
						mrow.next(":empty").remove();
						mrow.prev(":nonechild").focusEnd();
					}else{
						$(this).focus();
					}
					mrow.remove();
					return false;
				}
				if(!$(this).hasClass("bgnone")){
					var mrowtag = $(this).parent().parent();
					var mtag = $(this).parent();
					if($(this).siblings().length==0 && (mrowtag.is("mfrac") || mtag.is("mfrac"))){
						var tag = mrowtag;
						if(mtag.is("mfrac")){
							tag = mtag;
						}
						if(tag.prev().length==1){
							tag.prev().focusEnd();
							tag.next(":empty").remove();
						}else{
							tag.next().focusEnd();
						}
						if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
						tag.remove();
					}else if($(this).parent().prev().find(".noedit2").length==1){
						var tag = $(this).parent().parent();
						if(tag.prev().length==1){
							tag.prev().focusEnd();
							tag.next(":empty").remove();
						}else{
							tag.next().focusEnd();
						}
						if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
						tag.remove();
					}else if($(this).siblings().length==0 && $(this).parent().is("mtd") && $(this).parents("mtable").length>0){
						var tag = $(this).parents("mtable:first");
						/***********表格的删除*********/
						var tagParent = tag.parent();
						if(tag.siblings(".noedit1").length>0){
							if(tagParent.prev().length==1){
								tagParent.prev().focusEnd();
								tagParent.next(":empty").remove();
							}else{
								tagParent.next().focusEnd();
							}
							if(tagParent.siblings().length==1 && tagParent.siblings(":empty").length){tagParent.siblings().removeClass("bgnone");}
							tagParent.remove();
						}else{
							if(tag.prev().length==1){
								tag.prev().focusEnd();
								tag.next(":empty").remove();
							}else{
								tag.next().focusEnd();
							}
							if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
							tag.remove();
						}
					}else if($(this).siblings().length==0 && (mrowtag.is("menclose") || mtag.is("menclose"))){
						var tag = mrowtag;
						if(mtag.is("menclose")){
							tag = mtag;
						}
						if(tag.prev().length==1){
							tag.prev().focusEnd();
							tag.next(":empty").remove();
						}else{
							tag.next().focusEnd();
						}
						if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
						tag.remove();
					}else if($(this).siblings().length==0 && (mrowtag.is("mroot") || mtag.is("mroot"))){
						var tag = mrowtag;
						if(mtag.is("mroot")){
							tag = mtag;
						}
						if(tag.prev().length==1){
							tag.prev().focusEnd();
							tag.next(":empty").remove();
						}else{
							tag.next().focusEnd();
						}
						if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
						tag.remove();
					}else if($(this).siblings().length==0 && (mrowtag.is("munderover,msub,msup,msubsup,munder") || mtag.is("munderover,msub,msubsup,msup,munder"))){
						var tag = mrowtag;
						if(mtag.is("munderover,msub,msubsup,msup,munder")){
							tag = mtag;
						}
						if(tag.next().is(".bgnone") && tag.siblings().length==1){
							if(tag.parent().prev().length==1){
								tag.parent().prev().focusEnd();
								tag.parent().next(":empty").remove();
							}else{
								tag.parent().next().focusEnd();
							}
							var tagParent = tag.parent();
							if(tagParent.siblings().length==1 && tagParent.siblings(":empty").length){tagParent.siblings().removeClass("bgnone");}
							tagParent.remove();
						}else{
							if(tag.prev().length==1){
								tag.prev().focusEnd();
								tag.next(":empty").remove();
							}else{
								tag.next().focusEnd();
							}
							if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
							tag.remove();
						}
					}else if($(this).siblings().length==0 && (mrowtag.is("mover") || mtag.is("mover"))){
						var tag = mrowtag;
						if(mtag.is("mover")){
							tag = mtag;
						}
						
						if(tag.prev().length==1){
							tag.prev().focusEnd();
							tag.next(":empty").remove();
						}else{
							tag.next().focusEnd();
						}
						if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
						tag.remove();
					}else if($(this).siblings().length==0 && (mrowtag.is("msqrt") || mtag.is("msqrt"))){
						var tag = mrowtag;
						if(mtag.is("msqrt")){
							tag = mtag;
						}
						if(tag.prev().length==1){
							tag.prev().focusEnd();
							tag.next(":empty").remove();
						}else{
							tag.next().focusEnd();
							;
						}
						if(tag.siblings().length==1 && tag.siblings(":empty").length){tag.siblings().removeClass("bgnone");}
						tag.remove()
					}else{
						if($(this).siblings(":nonechild").length>0){
							$(this).remove();
						}else{
							$(this).removeClass("bg6");
							
						}
					}

				}
				return false;
			}else{
				var sel = getSelection();
				var at = sel.getRangeAt(0);
				if(at.startOffset==0 && at.endOffset==0){
					var ct = $("#gsf [contenteditable]");
					var index = ct.index(this);
					if(index<0){index==0}
					ct.eq(index-1).focusEnd();
				}
			}
		}
		
	}).bind("keyup",function(e){
		if(this.innerText.length>0){
			$(this).removeClass("bg6");
		}else{
			$(this).addClass("bg6");
		}
	}).bind("click focus keyup",function(e){
		updateRange(this);
		
	}).each(function(){
		if($(this).text().trim()==""){
			$(this).addClass("bg6");
		}
	});
	
};
function updateRange(me){
	$.focusCurr = $(me);
	var sel = getSelection();
	
	if(sel.rangeCount>0){
		var at = sel.getRangeAt(0);
		$.focusCurrOffset = {
			start : at.startOffset,
			end : at.endOffset
		}
	}
}
$.fn.focusEnd = function(){
	var div = $(this)[0];
	if(div){
		
		div.focus();
		if(window.getSelection){
			var sel = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(div);
			range.collapse(false);
			sel.removeAllRanges();
			sel.addRange(range);
		}else if(document.selection){
			div.innerHTML = div.innerHTML;
		}
						
	}
	return this;
}
$.fn.focusCurr = function(win){
	win = win || window;
	var div = $(this)[0];
	if(div){
		div.focus();
		if(window.getSelection){
			var sel = win.getSelection();
			var at = sel.getRangeAt(0);
			var offset = win.$.focusCurrOffset;
			
			if(!offset){
				$(div).focusEnd();
			}else{
				at.setStart(sel.anchorNode,offset.start);
				at.setEnd(sel.focusNode,offset.end);
				sel.removeAllRanges();
				sel.addRange(at);
			}
		}
	}
	return this;
}
$(function(){
	//initMathJax();
	$(".gsfGGtitle li").click(function(){
	  $(this).addClass("active").siblings().removeClass("active");
	  var index = $(this).index();
	  $(".gsfGGList .gsfGGContent").eq(index).show().siblings().hide();
	}).filter(".active").click();
	$(".gsfTools .math>button,#ulzf .gbtDown>button").click(function(){
		var mathml = filterMathml(this.innerHTML);
		insertVal(mathml);
		var gbtDown = $(this).parents(".gbtDown:first");
		gbtDown.hide();
		setTimeout(function(){
			gbtDown.css("display","");
		});
	});
	
	initEdit();
	cxInit();
	gsf.onpaste = function(){
		return false;
	}
	/*$(gsf).mousedown(function(e){
		this.start = e.target;
		$(".bgSelect").removeClass("bgSelect");
	}).mousemove(function(e){
		if(this.start){
			var now = e.target;
			if($(now).find(this.start).length==1){
				$(this.start).removeClass("bgSelect");
				$(now).addClass("bgSelect");
			}else if(this.start.parentNode == now.parentNode){
				$(now).parents(".bgSelect").removeClass("bgSelect");
				$(this.start).addClass("bgSelect");
				$(now).addClass("bgSelect");
			}else if(this.start == now){
				$(".bgSelect").removeClass("bgSelect");
				$(now).addClass("bgSelect");
			}
			
		}
	}).mouseup(function(e){
		this.start = undefined;
	});*/
	$("#gsf").click(function(e){
		if(e.target.id=="gsf"){
			$.focusCurr = $(this).find("[contenteditable]:last").focusEnd();
		}
	});
	$.focusCurr = $("#gsf [contenteditable]:last");
	$("#btnGetGsf").click(function(){
		var math = $($("#gsf").html());
		
		math.find("br").remove();
		math.find("[contenteditable]").removeAttr("contenteditable").removeClass("bg6");
		math.attr("contenteditable",false).addClass("cur");
		
		
		parent.getInsertTemplete = getInsertTemplete;
		parent.$.fn.focusEnd = $.fn.focusEnd;
		parent.$.fn.focusCurr = $.fn.focusCurr;
		parent.setMath(math[0].outerHTML);

		resetGsf();
		return;
		if($.currIfr){
			$.currIfr.src = "mathview.html?"+math[0].outerHTML;
			$.currIfr = null;
		}else{
			$("#gsfMath").append(getInsertTemplete(math[0].outerHTML));
		}
		
	});
	$("#getLatex").bind("input",function(){
		$.currIfr = null;
		var me = this;
		if(me.value.trim().indexOf("<math")==0){
			var math = $(me.value);
			if(math.children().length==1 && math.children("mrow").length==1){
				math = math.children("mrow");
			}
			$(gsf).children(".math").children("mrow").html(filterMathml(math.html()));
			initEdit();
		}else{
			if(window.math!=null){
				UpdateMath(me.value);
			}
		}
	});
	$(".bt1").css({
		display:"block",
		opacity:0
	});
	setTimeout(function(){
		updateKuohao(".bt1");
		$(".bt1").css({
			display:"",
			opacity:""
		});
	});
});
function getInsertTemplete(mathml){
	return "<iframe height='50' scrolling='no' width='100' onload='top.loadGs(this)' src='js/mathview.html?"+mathml+"'><iframe>";
}
function updateKuohao(slt){
	var selector = "#gsf .noedit1";
	if(slt)selector = slt + " .noedit1";
	$(selector).each(function(){
		var height1 = parseInt($(this).css("fontSize"));
		var height2 = $(this).siblings().not(".noedit1,:empty").height();
		if(height1>height2)return;
		$(this).css({
			display:"inline-block",
			transform:"scale(1,"+height2/height1+")"
		});
	});
	updateFuhao(slt?slt:"#gsf");
}
function updateFuhao(slt){
	$(slt+" .noedit2").each(function(){
		var width1 = $(this).width();
		var width2 = $(this).parent().parent().width();
		if(width1>width2)return;
		$(this).css({
			display:"inline-block",
			transform:"scale("+width2/width1+",1)"
		});
	});
}
function initMathJax(){
	var QUEUE = MathJax.Hub.queue;  // shorthand for the queue
	var math = null, box = null;    // the element jax for the math output, and the box it's in

	//
	//  Hide and show the box (so it doesn't flicker as much)
	//
	var HIDEBOX = function () {box.style.visibility = "hidden"}
	var SHOWBOX = function () {box.style.visibility = "visible"}

	//
	//  Get the element jax when MathJax has produced it.
	//
	
	QUEUE.Push(function () {
	  math = MathJax.Hub.getAllJax("MathOutput")[0];
	  box = document.getElementById("box");
	  SHOWBOX(); // box is initially hidden so the braces don't show
	});

	//
	//  The onchange event handler that typesets the math entered
	//  by the user.  Hide the box, then typeset, then show it again
	//  so we don't see a flash as the math is cleared and replaced.
	//
	window.UpdateMath = function (TeX,callback) {
	  TeX = TeX.replace(/^\\\[|\\\]$/g,"");
	  QUEUE.Push(
		  HIDEBOX,
		  ["resetEquationNumbers",MathJax.InputJax.TeX],
		  ["Text",math,"\\displaystyle{"+TeX+"}"],
		  SHOWBOX
	  );
	  MathJax.Hub.Queue(
		  function () {
			var jax = MathJax.Hub.getAllJax("MathOutput");;
			for (var i = 0; i < jax.length; i++) {
			  toMathML(jax[i],function (mml) {
				mml = mml.replace(/<!\-\-[^>]+\-\->/g,"").replace(/class=\"[^\"]+\"/g,"");
				mml = filterMml(mml);
				var obj = checkMathml(mml);
				var rstmml = filterMathml(obj.children().children().html());
				resetGsf();
				insertVal(rstmml);

			  });
			}
		  }
		);
	}
}