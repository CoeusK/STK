// JavaScript Document
var bp = chrome.extension.getBackgroundPage();

function StockInfo(code, num, name) {
    this.code = code;
    this.num = num;
    this.name = name;
}
// temp store the stk info before confirmed
var oTempStk = new Array();
oTempStk[0] = new StockInfo("", "", "");
oTempStk[1] = new StockInfo("", "", "");
oTempStk[2] = new StockInfo("", "", "");
oTempStk[3] = new StockInfo("", "", "");
oTempStk[4] = new StockInfo("", "", "");
var oSingleStk = new StockInfo("", "", "");

////load stored data
document.addEventListener('DOMContentLoaded', function() {
    for (var i = 0; i < bp.maxNumBg; i++) {
        $(".stkconfig .stkcode").eq(i).children("input.stkcodeinput").val(bp.stockDetail[i].num);
        $(".stkconfig").eq(i).children("span.stkname").html(bp.stockDetail[i].name);
    }
    refreshData();
    $("#stkDetail").hide();
    //updateConfig();

    $("#setting").click(function(){ 
        $("#stkDetail").hide();
        $("#stkSetting").show();
    });

    $("#back2detail").click(function(){
        $("#stkDetail").show();
        $("#stkSetting").hide();
    });

    //edit stock function
    $(".stkconfig .stkedit").on("click", function(){ 
        if($(this).hasClass("edit")) {
            console.log("edit branch");
            var iStockIndex = $(".stkconfig .stkedit").index(this);
            //Store current value
            oTempStk[iStockIndex].code = bp.stockDetail[iStockIndex].code;
            oTempStk[iStockIndex].num = bp.stockDetail[iStockIndex].num;
            oTempStk[iStockIndex].name = bp.stockDetail[iStockIndex].name;
            var $InputCode = $(".stkconfig .stkcode").eq(iStockIndex).children("input.stkcodeinput");
            $InputCode.removeAttr("disabled");
            $(this).removeClass().addClass("stkedit icons checkmark");
        } else {
            console.log("checkmark branch");
            iStockIndex = $(".stkconfig .stkedit").index(this);
            $InputCode = $(".stkconfig .stkcode").eq(iStockIndex).children("input.stkcodeinput");
            $InputCode.attr("disabled","disabled");
            saveData(iStockIndex, oTempStk[iStockIndex].code, oTempStk[iStockIndex].num);
            $(this).removeClass().addClass("stkedit icons edit");
        };        
    });
})

function tempStorStkInfo(pInput, oStkInfo) {
     var iIndex = $(".stkcode .stkcodeinput").index(pInput);
     oTempStk[iIndex] = oStkInfo;
     $(".stkconfig").eq(iIndex).children(".stkname").html(oTempStk[iIndex].name);
}


function saveData(iId, sCode, sNum) {
    localStorage["stkCode" + iId] = bp.stockDetail[iId].code = sCode;
    localStorage["stkNum" + iId] = bp.stockDetail[iId].num = sNum;
    //alert("stkCode" + iId);
    bp.getData();
}

function refreshData() {
    for (var i = 0; i < bp.maxNumBg; i++) {

        //if(bp.stockDetail[i].active == 1) {
          $(".stkdetail .stkcode").eq(i).html(bp.stockDetail[i].num);
          $(".stkdetail .stkname").eq(i).html(bp.stockDetail[i].name);
          $(".stkdetail .stkprice").eq(i).html(bp.stockDetail[i].curPrice);
          $(".stkdetail .stkpercent").eq(i).html(bp.stockDetail[i].percent + "%");
        //}
    }
}

function updateConfig() {
    $(".stkconfig .stkcode").eq(0).html(bp.stockDetail[0].code); 
    $(".stkconfig .stkname").eq(0).html(bp.stockDetail[0].name); 
}



//Indicate if it will be the first key Down
iFirstKeyDown = 1;
bp.popupRefresh = refreshData;
var sArrSuggested = new Array();
(function($) {
    $.fn.extend({
        "changeTips": function(value) {
            value = $.extend({
                divTip: ""
            }, value)
            var $this = $(this);
            //Find the matching UL for tips
            var $CurUL = $(this).parent().next("ul"); 
            var indexLi = 0;
            //点击document隐藏下拉层
            $CurUL.click(function(event) {
                    if ($(event.target).attr("class") == value.divTip || $(event.target).is("li")) {
                        var liVal = $(event.target).text();
                        ////Get the first half of the value (Stock Code)
                        sArrVal = liVal.split(" ");
                        $this.val(sArrVal[0]);
                        //Store data 
                        sArrStk = sArrSuggested[indexLi].split(",");
                        oSingleStk.num = sArrStk[2];
                        oSingleStk.code = sArrStk[3];
                        oSingleStk.name = sArrStk[4];
                        //Update the displaed stk name
                        tempStorStkInfo($this, oSingleStk);
                        //alert("aaa");
                        //saveData(0, oTempStkCode, oTempStkNum);
                        blus();
                    } else {
                        blus();
                    }
                })
                //隐藏下拉层
            function blus() {
                $CurUL.hide();
            }
            //键盘上下执行的函数
            function keychang(up) {
                if (up == "up") {
                    if (indexLi == 0) {
                        indexLi = $CurUL.children().length - 1;
                    } else {
                        indexLi--;
                    }
                } else {
                    if (indexLi == $CurUL.children().length - 1) {
                        indexLi = 0;
                    } else if (!iFirstKeyDown) {
                        indexLi++;
                    } else {
                        //First down key pressed, not increment indexLi
                        iFirstKeyDown = 0;
                    }
                }
                $CurUL.children().eq(indexLi).addClass("active").siblings().removeClass();
            }
            //值发生改变时
            function valChange() {
                iFirstKeyDown = 1;
                var tex = $this.val(); //输入框的值
                //alert(tex);

                //Own
                $.ajax({
                    type: "GET",
                    url: "http://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&key=" + tex,
                    context: document.body,
                    success: function(msg) {
                        //alert( "Data Saved: " + msg );
                        sArrSegment = msg.split("\"");
                        if (sArrSegment[1] == "") {
                            blus();
                        } else {
                            //// Clear drop down hints
                            $CurUL.empty();
                            sArrSuggested = sArrSegment[1].split(";");
                            //alert(sArrSuggested[1]);
                            for (i = 0; i < sArrSuggested.length; i++) {
                                sArrSingleStk = sArrSuggested[i].split(",");
                                $CurUL.append("<li email=\"stk" + i + "\">" + sArrSingleStk[2] + "  " + sArrSingleStk[4] + "</li>");
                            }
                            // alert($(this).value);
                            //鼠标点击和悬停LI
                            $CurUL.children().
                            hover(function() {
                                indexLi = $(this).index(); //获取当前鼠标悬停时的LI索引值;
                                $(this).addClass("active").siblings().removeClass();
                            })
                        }
                    }
                });
                if ($this.val() == "") {
                    blus();
                } else {
                    $CurUL.show();
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
            $(this).bind("input", function() {              
                valChange();
                })
                //按键盘的上下移动LI的背景色
            $this.keydown(function(event) {
                if (event.which == 38) { //向上
                    keychang("up")
                } else if (event.which == 40) { //向下
                    keychang()
                } else if (event.which == 13) { //回车
                    var liVal = $CurUL.children().eq(indexLi).text();
                    sArrLiVal = liVal.split(" ");
                    $this.val(sArrLiVal[0]);
                    //Store data
                    sArrStk = sArrSuggested[indexLi].split(",");
                      
                    oSingleStk.num = sArrStk[2];
                    oSingleStk.code = sArrStk[3];
                    oSingleStk.name = sArrStk[4];
                    //Update the displaed stk name
                    tempStorStkInfo($this, oSingleStk);
                    blus();
                }
            })
        }
    })
})(jQuery)

