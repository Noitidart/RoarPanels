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

function throwPop(msg, type) {
	var winWidth = 315;
	var aDOMWindow = Services.ww.openWindow(null, self.path + 'roar.xul', '_blank', 'chrome,alwaysRaised,width=' + winWidth + ',height=50', null);
	
	//have to listen to iframe load because height is dynamic of div so i read the height of the div then set aDOMWindow height and iframe height based on that
	
	aDOMWindow.addEventListener('load', function(e) {
		console.log('aDOMWindow loaded');
		var contentWindow = aDOMWindow.document.childNodes[0];
		console.log('contentWindow:', contentWindow);
		var iframe = contentWindow.childNodes[0];
		console.log('iframe:', iframe);
		iframe.addEventListener('DOMContentLoaded', function() {
			console.log('iframe loaded');
			var div = iframe.contentDocument.querySelector('.roar-body');
			var divHeight = parseInt(iframe.contentWindow.getComputedStyle(div, null).getPropertyValue('height'));
			console.log('divHeight:', divHeight);
			//Services.wm.getMostRecentWindow('navigator:browser').setTimeout(function() { console.log('resizing now'); aDOMWindow.resizeTo(winWidth, divHeight + 10); console.log('resizing done'); }, 3000);
			aDOMWindow.resizeTo(winWidth, divHeight + 10);
			iframe.style.height = (divHeight + 10) + 'px';
			//Services.wm.getMostRecentWindow('navigator:browser').setTimeout(function() { console.log('resizing IFRAME now'); iframe.style.height = (divHeight + 10) + 'px'; console.log('resizing IFRAME done'); }, 5000);
		}, false);
		iframe.setAttribute('src', self.path + 'roar.htm');
	}, false);

	console.log('aDOMWindow:', aDOMWindow);
}

function startup(aData, aReason) {
	self.aData = aData;
	throwPop('msg', 'type');
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
}

function install() {}

function uninstall() {}