const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = {
	name: 'RoarPanels',
	suffix: '@jetpack',
	id: 'RoarPanels@jetpack',
	path: 'chrome://roarpanels/content/',
	aData: 0
};

const myServices = {};
Cu.import('resource://gre/modules/devtools/Console.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.defineLazyGetter(myServices, 'as', function(){ return Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService) });

var cActPops = []; //holds obj of {top:0, height:0} of the panels currently thrown //currentlyActivePopups

var addToDivHeight = 10;
var winWidth = 315;
var offsetDivLeft = 10;

var sm = Cc['@mozilla.org/gfx/screenmanager;1'].getService(Ci.nsIScreenManager);
//var left = {}, top = {}, width = {}, height = {};
var primaryScreenRect = {
	left: {value:-1},
	top: {value:-1},
	width: {value:-1},
	height: {value:-1}
};
//i have to define value key in it, otehrwise it wont work
var gr = sm.primaryScreen.GetAvailRect(primaryScreenRect.left, primaryScreenRect.top, primaryScreenRect.width, primaryScreenRect.height);

primaryScreenRect.left = primaryScreenRect.left.value;
primaryScreenRect.top = primaryScreenRect.top.value;
primaryScreenRect.width = primaryScreenRect.width.value;
primaryScreenRect.height = primaryScreenRect.height.value;

function throwPop(classes, msg, type) {
	//classes is an array of strings
	
	//get position for pop
console.log('gr:', gr);
console.log('primaryScreenRect:', primaryScreenRect);
	
	var aDOMWindow = Services.ww.openWindow(null, self.path + 'roar.xul', '_blank', 'chrome,alwaysRaised,width=' + winWidth + ',height=50', null);
	if (classes.length == 0) {
		throw new Error('must provide some class names for this');
	}
	var classesStr = classes.join('`~~`');
	var ID = Math.random();
	
	//have to listen to iframe load because height is dynamic of div so i read the height of the div then set aDOMWindow height and iframe height based on that
	
	aDOMWindow.addEventListener('load', function(e) {
		console.log('aDOMWindow loaded');
		var xulChildWindow = aDOMWindow.document.childNodes[0];
		console.log('xulChildWindow:', xulChildWindow);
		var iframe = xulChildWindow.childNodes[0];
		console.log('iframe:', iframe);
		iframe.addEventListener('DOMContentLoaded', function() {
			console.log('iframe loaded');
			var div = iframe.contentDocument.querySelector('.roar-body');
			var divHeight = parseInt(iframe.contentWindow.getComputedStyle(div, null).getPropertyValue('height'));
			console.log('divHeight:', divHeight);
			//Services.wm.getMostRecentWindow('navigator:browser').setTimeout(function() { console.log('resizing now'); aDOMWindow.resizeTo(winWidth, divHeight + 10); console.log('resizing done'); }, 3000);
			aDOMWindow.resizeTo(winWidth, divHeight + addToDivHeight);
			iframe.style.height = (divHeight + addToDivHeight) + 'px';
			//Services.wm.getMostRecentWindow('navigator:browser').setTimeout(function() { console.log('resizing IFRAME now'); iframe.style.height = (divHeight + 10) + 'px'; console.log('resizing IFRAME done'); }, 5000);
			//iframe.contentDocument.body.style.opacity = 1;
			//iframe.contentDocument.body.style.marginTop = 0;
			
			//position window
				if (cActPops.length == 0) {
					var aDOMWinL = primaryScreenRect.left + primaryScreenRect.width - winWidth;
					var aDOMWinT = primaryScreenRect.top;
				} else {
					//var aDOMWinL = cActPops[cActPops.length-1].aDOMWinL + primaryScreen.width;
					var lastPop = cActPops[cActPops.length-1];
					var aDOMWinT = lastPop.aDOMWinT + lastPop.divHeight + addToDivHeight;
					if (aDOMWinT + (divHeight + addToDivHeight /*this div*/) > primaryScreenRect.top + primaryScreenRect.height) {
						var aDOMWinL = lastPop.aDOMWinL - offsetDivLeft - winWidth;
						aDOMWinT = primaryScreenRect.top;
					} else {
						var aDOMWinL = lastPop.aDOMWinL;
					}
				}
				console.log('move win to:', aDOMWinL, aDOMWinT);
				aDOMWindow.moveTo(aDOMWinL, aDOMWinT);
			//end position window
			
			var thisPop = {ID: ID, classes:classesStr, aDOMWindow: aDOMWindow, xulChildWindow: xulChildWindow, iframe: iframe, divHeight: divHeight, aDOMWinT: aDOMWinT, aDOMWinL: aDOMWinL};
			cActPops.push(thisPop);
			xulChildWindow.style.opacity = 1;
			xulChildWindow.style.marginTop = 0;
		}, false);
		iframe.setAttribute('src', self.path + 'roar.htm');
	}, false);

	console.log('aDOMWindow:', aDOMWindow);
}

function movePop() {
	lastPop.aDOMWindow.resizeTo();
}

function removePopByClass(classes) {
	//classes is an array of strings or just a strings
	if (!classes.length) {
		var justStr = true;
	}
	cActPops.forEach(function(arr, i) {
		if (justStr) {
			if (arr.classes.indexOf(classes) > -1) {
				//remove this pop

			}
		}
	});
}

function startup(aData, aReason) {
	self.aData = aData;
	throwPop(['unrelated'], 'msg', 'type');
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
}

function install() {}

function uninstall() {}