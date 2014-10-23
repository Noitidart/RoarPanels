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
	var msgIsHowManyRows = 3;
	var heightOfTextRow = 14;
	var heightOfDiv = 78 + ((msgIsHowManyRows-1) * heightOfTextRow)
	Services.ww.openWindow(null, self.path + 'roar.xul', '_blank', 'chrome,alwaysRaised,width=315,height=' + heightOfDiv, null);
}

function startup(aData, aReason) {
	self.aData = aData;
	console.log('started');
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
}

function install() {}

function uninstall() {}