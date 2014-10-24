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
var winWidth = -1;
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
			if (winWidth == -1) {
				winWidth = parseInt(iframe.contentWindow.getComputedStyle(div, null).getPropertyValue('width')) + 7;
				console.log('winWidth defined as:', winWidth);
			}
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
			iframe.addEventListener('click', function() {
				removePopById(ID);
			}, false);
		}, false);
		iframe.setAttribute('src', self.path + 'roar.htm');
	}, false);

	console.log('aDOMWindow:', aDOMWindow);
}

function movePopById(id, newWinL, newWinT) {
	for (var i=0; i<cActPops.length; i++) {
		if (cActPops[i].ID == id) {
			var thePop = cActPops[i];
			console.log('movePopById , the pop with id found new pos:', newWinL, newWinT);
			break;
		}
	};
	
	if (!thePop) {
		console.error('movePopById pop with id not found!!!');
		return false;
	}
	
	var cWinTop = thePop.aDOMWinT; //thePop.aDOMWindow.screenY; //note: maybe use thePop.aDOMWinT here
	var cWinLeft = thePop.aDOMWinL; //thePop.aDOMWindow.screenX; //note: maybe use thePop.aDOMWinL here
	var newWinTop = newWinT;
	var newWinLeft = newWinL;

	if (cWinTop == newWinTop && cWinLeft == newWinLeft) {
	  console.warn('allready at new position so dont do anything');
	} else {
	  //without anim make xulChildWindow keep same position by using margin
	  thePop.xulChildWindow.setAttribute('left', cWinLeft);
	  thePop.xulChildWindow.setAttribute('top', cWinTop);
	  
	  thePop.aDOMWindow.moveTo(primaryScreenRect.left, primaryScreenRect.top);
	  thePop.aDOMWindow.resizeTo(primaryScreenRect.left + primaryScreenRect.width, primaryScreenRect.top + primaryScreenRect.height);

	  //set up finalize function
	  thePop.xulChildWindow.addEventListener('transitionend', function(e) {
		console.log('transition ended, now resizing window');
		//e.stopPropagation();
		thePop.xulChildWindow.removeEventListener('transitionend', arguments.callee, false);
		//shrink aDOMWindow
		
		//var oldIframeHeight = thePop.iframe.style.height;
		thePop.iframe.style.height = '0'; //this is not working
		thePop.iframe.ownerDocument.defaultView.getComputedStyle(thePop.iframe, null).getPropertyValue('height'); //hack to make the height of 0 take
		thePop.aDOMWindow.resizeTo(winWidth, thePop.divHeight + addToDivHeight);
		thePop.iframe.style.height = (thePop.divHeight + addToDivHeight) + 'px'; //oldIframeHeight;
		thePop.aDOMWindow.moveTo(newWinLeft, newWinTop);

		var oldTransition = thePop.xulChildWindow.style.transition; //i dont think i need this
		thePop.xulChildWindow.style.transition = '';
		//finalize position of xulChildWindow with no anim
		thePop.xulChildWindow.style.marginTop = '';
		thePop.xulChildWindow.style.marginLeft = '';
		thePop.xulChildWindow.removeAttribute('left');
		thePop.xulChildWindow.removeAttribute('top');
		thePop.aDOMWindow.setTimeout(function() {
			thePop.xulChildWindow.style.transition = oldTransition;
		}, 100);
	  }, false);

	  //move to new pos
	  thePop.xulChildWindow.style.marginTop = (newWinTop - cWinTop) + 'px';
	  thePop.xulChildWindow.style.marginLeft = (newWinLeft - cWinLeft) + 'px';
	  thePop.aDOMWinL = newWinLeft;
	  thePop.aDOMWinT = newWinTop;
	}
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
//note: todo: if one panel is talle then screen height, and theres nothing in this column then of course just put here, not in the col to left
function removePopById(id) {
	//classes is an array of strings or just a strings
	var found = false;
	//console.log('removePopById looking for id:', id);
	for (var i=0; i<cActPops.length; i++) {
		//console.log('currently found id of:', cActPops[i].ID);
		if (cActPops[i].ID == id) {
			found = true;
			cActPops[i].aDOMWindow.close();
			var remdDomWinT = cActPops[i].aDOMWinT; //the domwint that the removed pop had
			var remdDomWinL = cActPops[i].aDOMWinL;
			console.log('removed position:', remdDomWinL, remdDomWinT);
			var remdI = i;
			cActPops.splice(remdI, 1);
			console.log('removed pop at i of ', remdI);
			
			for (var j=i; j<cActPops.length; j++) {
				//movePopById(cActPops[j].ID, aDOMWinT, aDOMWinL);
				//move pops after this remd pop
				var nextPop = cActPops[j];
				if (remdI == 0 && j == 0) { //test to see if it was the top right most (first) pop that was removed //can do test of `remdDomWinT == primaryScreenRect.top && remdDomWinL == primaryScreenRect.left + primaryScreenRect.width - winWidth`
					var aDOMWinL = primaryScreenRect.left + primaryScreenRect.width - winWidth; //this can just be remdDomWinL
					var aDOMWinT = primaryScreenRect.top; //this can be just remdDomWinT
				} else {
					//var aDOMWinL = cActPops[cActPops.length-1].aDOMWinL + primaryScreen.width;
					var lastPop = cActPops[j-1];
					if (j == remdI) {
						var aDOMWinT = remdDomWinT;
						var aDomWinL = remdDomWinL;
						if (aDOMWinT + (nextPop.divHeight + addToDivHeight /*this div*/) > primaryScreenRect.top + primaryScreenRect.height) {
							var aDOMWinL = remdDomWinL - offsetDivLeft - winWidth;
							aDOMWinT = primaryScreenRect.top;
						} else {
							var aDOMWinL = remdDomWinL;
						}
					} else {
						var aDOMWinT = lastPop.aDOMWinT + lastPop.divHeight + addToDivHeight;
						if (aDOMWinT + (nextPop.divHeight + addToDivHeight /*this div*/) > primaryScreenRect.top + primaryScreenRect.height) {
							var aDOMWinL = lastPop.aDOMWinL - offsetDivLeft - winWidth;
							aDOMWinT = primaryScreenRect.top;
						} else {
							var aDOMWinL = lastPop.aDOMWinL;
						}	
					}
				}
				console.log('re position win to:', aDOMWinL, aDOMWinT);
				/*
				nextPop.aDOMWinL = aDOMWinL;
				nextPop.aDOMWinT = aDOMWinT;
				*/
				movePopById(nextPop.ID, aDOMWinL, aDOMWinT);
				
				//end move pops after this remd pop
			}
			console.log('done re-positioning the pops after the rem');
			break;
		}
	};
	if (!found) {
		console.error('removePopById could not find pop with ID of:', id);
	}
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