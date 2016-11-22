// JavaScript Document
var bp = chrome.extension.getBackgroundPage();

////load stored data
document.addEventListener('DOMContentLoaded', function () {
  for (var i=0; i<bp.maxNumBg; i++) {
    document.getElementById("stkCode1").value=bp.stockDetail[1][i];
  }
  refreshData() 
  
})

function refreshData() {
  for (var i=0; i<bp.maxNumBg; i++) {
    //document.getElementById("stkCode1").value=bp.stockDetail[1][i];
    //$("#stkCode1").val(bp.stockDetail[0][i]);
    document.getElementById("name1").innerHTML=bp.stockDetail[2][i];
    document.getElementById("price1").innerHTML=bp.stockDetail[3][i];
    document.getElementById("percentage1").innerHTML=bp.stockDetail[4][i]+"%"; 
  }
}

//Indicate if it will be the first key Down
iFirstKeyDown = 1;
bp.popupRefresh=refreshData;
var sArrSuggested = new Array();

(function($){
	$.fn.extend({
		"changeTips":function(value){
			value = $.extend({
				divTip:""
			},value)
			
			var $this = $(this);
			var indexLi = 0;
			
			//点击document隐藏下拉层
			$(document).click(function(event){
				if($(event.target).attr("class") == value.divTip || $(event.target).is("li")){
					var liVal = $(event.target).text();
					////Get the first half of the value (Stock Code)
		      sArrVal = liVal.split(" ");
					$this.val(sArrVal[0]);
          
          //Store data
          sArrStk = sArrSuggested[indexLi].split(",");
          saveData(0, sArrStk[3], sArrStk[2])
          
					blus();
				}else{
					blus();
				}
			})
			
			//隐藏下拉层
			function blus(){
				$(value.divTip).hide();
			}
			

			//键盘上下执行的函数
			function keychang(up){
				if(up == "up"){
					if(indexLi == 0){
						indexLi = $(value.divTip).children().length-1;
					}else{
						indexLi--;
					}
				}else{
					if(indexLi ==  $(value.divTip).children().length-1){
						indexLi = 0;
					}else if (!iFirstKeyDown){
						indexLi++;
					}
					else {
					  //First down key pressed, not increment indexLi
 						iFirstKeyDown = 0;
					}
				}
				$(value.divTip).children().eq(indexLi).addClass("active").siblings().removeClass();	
			}
			
			//值发生改变时
			function valChange(){
			  iFirstKeyDown = 1;
				var tex = $this.val();//输入框的值
        //Own
        $.ajax({
          type: "GET",
          url: "http://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&key="+tex,
          context: document.body,
          success: function(msg){
            //alert( "Data Saved: " + msg );
            sArrSegment = msg.split("\"");
            if (sArrSegment[1] == "") {
              blus();
            }else {
              //// Clear drop down hints
     					$(value.divTip).empty();

              sArrSuggested = sArrSegment[1].split(";");
              //alert(sArrSuggested[1]);
              for(i=0; i< sArrSuggested.length; i++) {
                sArrSingleStk = sArrSuggested[i].split(",");
                $(value.divTip).append("<li email=\"stk"+i+"\">"+sArrSingleStk[2]+"  "+sArrSingleStk[4]+"</li>");
              }
              
             // alert($(this).value);

         
         
              //鼠标点击和悬停LI
         			$(value.divTip).children().
         			hover(function(){
				        indexLi = $(this).index();//获取当前鼠标悬停时的LI索引值;
					      $(this).addClass("active").siblings().removeClass();
			        })



            }
          }
        });

        if($this.val()==""){
					blus();
				}else{
					$(value.divTip).show();
				}
				
        /*
				//让提示层显示，并对里面的LI遍历
				if($this.val()==""){
					blus();
				}else{
					$(value.divTip).
					show().
					children().
					each(function(index) {
						var valAttr = $(this).attr("email");
						if(index==1){$(this).text(tex).addClass("active").siblings().removeClass();}
						//索引值大于1的LI元素进处处理
						if(index>1){
							//当输入的值有“@”的时候
							if(af.test(tex)){
								//如果含有“@”就截取输入框这个符号之前的字符串
								fronts = tex.substring(tex.indexOf("@"),0);
								$(this).text(fronts+valAttr);
								//判断输入的值“@”之后的值，是否含有和LI的email属性
								if(regMail.test($(this).attr("email"))){
									$(this).show();
								}else{
									if(index>1){
										$(this).hide();
									}	
								}
								
							}
							//当输入的值没有“@”的时候
							else{
								$(this).text(tex+valAttr);
							}
						}
	                })
				}	
				
				*/
			}
			
			
			//输入框值发生改变的时候执行函数
			$(this).bind("input",function(){
				valChange();
			})
			

					
			//按键盘的上下移动LI的背景色
			$this.keydown(function(event){
				if(event.which == 38){//向上
					keychang("up")
				}else if(event.which == 40){//向下
					keychang()
				}else if(event.which == 13){ //回车
					var liVal = $(value.divTip).children().eq(indexLi).text();
					sArrLiVal = liVal.split(" ");
					$this.val(sArrLiVal[0]);
	
	        //Store data
          sArrStk = sArrSuggested[indexLi].split(",");
          saveData(0, sArrStk[3], sArrStk[2])
 
					blus();
				}
			})
							
		}	
	})	
})(jQuery)

function saveData(iId, sCode, sNum) {
	localStorage["stkCode"+iId]=bp.stockDetail[0][iId]=sCode;
	localStorage["stkNum"+iId]=bp.stockDetail[1][iId]=sNum;
	bp.getData();
}