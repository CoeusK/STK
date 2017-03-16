//MyStockBg.js
var dr = 100;
var dg = 150;
var db = 120;
var defTimeout = 15000;
var totalStkNum = 3;
var defMaxNum = 3;
var req = new XMLHttpRequest();
var popupRefresh = null;
var rates = null;


function Stock(code, num, name, curPrice, percent, active) {
    this.code = code;
    this.num = num;
    this.name = name;
    this.curPrice = curPrice;
    this.percent = percent;
}

var stockDetail = new Array();
stockDetail[0] = new Stock("sh000001", "000001", "", 0.0, 0.0, 1);
stockDetail[1] = new Stock("", "", "", 0.0, 0.0, 0);
stockDetail[2] = new Stock("", "", "", 0.0, 0.0, 0);
stockDetail[3] = new Stock("", "", "", 0.0, 0.0, 0);
stockDetail[4] = new Stock("", "", "", 0.0, 0.0, 0);
//stockDetail[0] = new Array(); //Code
//stockDetail[1] = new Array(); //Num
//stockDetail[2] = new Array(); //Name
//stockDetail[3] = new Array(); //Current Price
//stockDetail[4] = new Array(); //Percentage
//for (var i = 0; i < maxItemNum; i++) {
//    stockDetail[0][i] = "";
//    stockDetail[1][i] = "";
//    stockDetail[2][i] = "";
//    stockDetail[3][i] = 0.0;
//    stockDetail[4][i] = 0.0;
//}
////Initialize 
//stockDetail[0][0] = "sh000001";
//stockDetail[0][1] = "sz399107";
//stockDetail[0][2] = "sh600382";
//stockDetail[0][3] = "sz000063";
//stockDetail[0][4] = "sz000568";
var r = parseInt(localStorage.r, 10) || dr
var g = parseInt(localStorage.g, 10) || dg
var b = parseInt(localStorage.b, 10) || db
var fil = localStorage.fil || ""
var maxNumBg = parseInt(localStorage.maxNumBg, 10) || defMaxNum;
var favStkInd = parseInt(localStorage.favStkIndex, 10) || 0;
var refreshInterval = parseInt(localStorage.refreshInterval, 10) || defTimeout;
totalStkNum = parseInt(localStorage.totalStkNum, 10) || totalStkNum;

for (var i = 0; i < totalStkNum; i++) {
    stockDetail[i].code = localStorage.getItem("stkCode" + i) || "sh000001";
    stockDetail[i].num = localStorage.getItem("stkNum" + i) || "000001";
}
getData();
refreshData();
chrome.browserAction.setBadgeBackgroundColor({
    color: [r, g, b, 255]
});

function badgeRefresh() {
    if (stockDetail[favStkInd].percent >= 0) {
        chrome.browserAction.setBadgeBackgroundColor({
            color: [150, 0, 0, 255]
        });
        chrome.browserAction.setBadgeText({
            text: stockDetail[favStkInd].percent.toString()
        });
    } else {
        chrome.browserAction.setBadgeBackgroundColor({
            color: [0, 150, 0, 255]
        });
        chrome.browserAction.setBadgeText({
            text: stockDetail[favStkInd].percent.toString().substr(1)
        });
    }
    titleRefresh();
}

function titleRefresh() {
    var strTitle = "";
    for (i = 0; i < totalStkNum; i++) {
        strTitle = strTitle + stockDetail[i].name + " " + stockDetail[i].curPrice + " " + stockDetail[i].percent + "%" + "\n";
    }
    chrome.browserAction.setTitle({
        title: strTitle
    });
}

function saveStk(id) {
    localStorage["stkCode" + id] = stockDetail[id].code;
    localStorage["stkNum" + id] = stockDetail[id].num;
}

function getData() {
    ////  form the httpRequest
    httpReq = "http://hq.sinajs.cn/list=";
    for (i = 0; i < totalStkNum; i++) {
        httpReq = httpReq + stockDetail[i].code;
        //// Add "," except the last one
        if (i != (totalStkNum - 1)) httpReq = httpReq + ",";
    }
    //alert(httpReq);
    req.open("GET", httpReq)
    req.onerror = function() {
        //setTimeout(getData,refreshInterval);
        chrome.browserAction.setBadgeText({
            text: "?"
        });
    }
    req.onload = function() {
        //setTimeout(getData,refreshInterval);
        //alert(req.responseText);
        if (req.responseText != "") {
            //alert(req.responseText);
            parseStockData(req.responseText);
            //Refresh Badge Text
            badgeRefresh();
            ////Refresh popup if it is null
            if (popupRefresh != null) {
                try {
                    popupRefresh();
                } catch (e) {
                    popupRefresh = null;
                }
            }
        }
    }
    req.setRequestHeader("Content-type", "application/json");
    req.send("{}");
}

function refreshData() {
    var d = new Date();
    var fhour = d.getUTCHours() + d.getUTCMinutes() / 60 + 8;
    if ((fhour <= 11.6 && fhour >= 9.25) || (fhour <= 15.1 && fhour >= 13)) {
        var iDay = d.getUTCDay();
        if (iDay > 0 && iDay < 6) {
            getData();
        }
    }
    setTimeout(refreshData, refreshInterval);
}

function parseStockData(response) {
    rows = response.split("var");
    for (i = 1; i <= totalStkNum; i++) {
        strArray = rows[i].split("=");
        ////Check if it is a empyt response
        if (strArray[1].length > 4) {
            rawData = strArray[1].substr(1, strArray[1].length - 3);
            //alert(rawData);
            dataArray = rawData.split(",");
            stockDetail[i - 1].name = dataArray[0];
            //keep 2 digits after .
            stockDetail[i - 1].curPrice = dataArray[3].substring(0, dataArray[3].indexOf(".") + 3);
            ////Calculate Percentage
            stockDetail[i - 1].percent = (Math.floor((dataArray[3] - dataArray[2]) / dataArray[2] * 10000 + 0.5)) / 100;
            //alert(stockDetail[0][i-1]+"  "+stockDetail[1][i-1]+"  "+stockDetail[2][i-1]+"  "+stockDetail[3][i-1]);
        } else {
            stockDetail[i - 1].name = "N/A";
            stockDetail[i - 1].curPrice = "0.00";
            stockDetail[i - 1].percent = "0.00";
        }
    }
}