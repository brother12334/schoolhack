import VueTippy, { TippyComponent, tippy } from "./vendor/node_modules/vue-tippy/dist/vue-tippy.esm.js";
import { languageLibraryDefault } from "./lang/lang.mjs";
import * as OPHELPERS from "./op_helpers.mjs";
import * as _ from "./vendor/node_modules/underscore/underscore-esm-min.js";
import VueI18n from "./vendor/node_modules/vue-i18n/dist/vue-i18n.esm.browser.min.js";
import * as Sentry from "https://cdn.jsdelivr.net/npm/@sentry/vue@7/+esm";
import { ExtraErrorData as ExtraErrorDataIntegration } from "https://cdn.jsdelivr.net/npm/@sentry/integrations@7/+esm";
import Analytics from 'https://cdn.jsdelivr.net/npm/analytics@0.8.14/+esm'
import googleAnalytics from 'https://cdn.jsdelivr.net/npm/@analytics/google-analytics@1.0.7/+esm'

Vue.use(VueI18n);
Vue.use(VueTippy);

tippy.setDefaults(OPHELPERS.tippyConfig);
Vue.component("tippy", TippyComponent);
Vue.config.productionTip = false;


globalThis.Vue = Vue;


export var OP = function () {
	//clog: shorter version of clog. Turned off on OPHELPERS.isProd() = false;
	window.clog = (OPHELPERS.isProd()) ? function () { } : console.log.bind(console);
	window.clogGroup = (OPHELPERS.isProd()) ? function () { } : console.group.bind(console);
	window.clogGroupCollapsed = (OPHELPERS.isProd()) ? function () { } : console.groupCollapsed.bind(console);
	window.clogGroupEnd = (OPHELPERS.isProd()) ? function () { } : console.groupEnd.bind(console);
}
export default OP;

OP.isDemo = !OPHELPERS.isProd();

OP.initPage = function () {
	OP();
	OP.loadSentry();
	OP.setLanguage(sessionUser.language);
	OP.loadCookieModal();

	globalThis.Vue.OPHELPERS = OPHELPERS
	globalThis.Vue.prototype.$OPHELPERS = OPHELPERS


	OP.loadNavigation();
	OP.loadModals();

	if (window.CookieControl && window.CookieControl.getCookie('op_prefs_system_warning_dismissed')) {
		// $('#systemWarning').removeClass('hide')
	} else {
		$('#systemWarning').removeClass('hide');
	}
	$('#systemWarning .icon').click(function () {
		$('#systemWarning').hide();
		if (window.CookieControl) {
			CookieControl.saveCookie('op_prefs_system_warning_dismissed', 'true', 1);
		}
	})


	loadSearch();

	OP.setupMembershipElements();
	OP.setupImageLoading();
	if (backendMessage.length > 0 && backendMessage !== ' _show_signin_message_') {
		//if message is _show_signin_message_, page title is changed instead of popup.
		OP.showMessageModal(backendMessage);
	}

	//profiler
	$('#codeigniter_profiler').on('dblclick', function () {
		$(this).toggle();
	});

	//remove any whitespace after/before to prevent html whitespaces
	$('.editable').each(function () {
		$(this).html(($(this).html().trim()));
	});

	$('[data-toggle="tooltip"]').tooltip(); //enable tooltips

	if (OP.isDemo) {
		///for demo purposes
		//$('.navbar').addClass('expanded');
		//$('.navbar').off('mouseleave')
		//$('.navbar .OPlogo').trigger('mouseover');
	}
}
OP.languageLibrary = {}; //language file
// Create VueI18n instance with options
OP.language = 'en';
OP.i18n = null;
OP.loadLanguage = function (lang = 'en', remoteBranch = 'master', remoteRepo = 'msawired') {
	OP.language = lang;
	let url = `/user/getLanguageLibrary/${remoteBranch}/${remoteRepo}`;

	//using standard 
	var script = document.createElement('script');
	script.src = url;
	script.onload = function () {
		OP.setLanguage(lang);
	};
	script.onerror = function () {
		OP.showErrorModal('There was a problem reading the language file. Please review browser console for errors.')
	};

	document.head.appendChild(script); //or something of the likes

}
OP.setLanguage = function (lang = 'en') {
	// let langs = Object.keys(library['languages']); 
	// langs.filter(a=> a == 'en' || a == lang);
	OP.languageLibrary[lang] = {};
	for (let section in languageLibraryDefault) {
		OP.languageLibrary[lang][section] = {};
		for (let key in languageLibraryDefault[section]) {
			OP.languageLibrary[lang][section][key] = languageLibraryDefault[section][key][lang] ? languageLibraryDefault[section][key][lang] : languageLibraryDefault[section][key]['en'];
		}
	};

	$('html').attr('language', lang);
	if (!OP.i18n) {
		OP.i18n = new VueI18n({
			locale: lang, // set locale
			fallbackLocale: 'en', // set locale
			messages: OP.languageLibrary, // set locale messages
		})
	} else {
		OP.i18n.locale = 'en'; //force update
		OP.i18n.locale = lang;
	}
}


//define intercom function globally, because it is also used on places where standard nav doesn't exist (ie sketch page)
OP.loadIntercom = function () {
	let APP_ID = "z5peuw78";
	if ((typeof sessionUser != 'undefined' && sessionUser.intercomHash && sessionUser.userID > 0)) {
		window.intercomSettings = {
			app_id: APP_ID,
			custom_launcher_selector: '.intercomLink',
			user_hash: sessionUser.intercomHash,
			name: sessionUser.fullname, // Full name
			membershipType: sessionUser.membershipType > 0 ? sessionUser.membershipType : 0,
			memberSince2: sessionUser.subscribedOn ?? null,
			lastLogin_at: sessionUser.lastLogin,
			email: sessionUser.email, // Email address
			user_id: sessionUser.userID, // current_user_id
			userType: sessionUser.userType // userType
		};
		if (sessionUser.membershipID) {
			window.intercomSettings.stripe_id = sessionUser.membershipID;
		}

		if (+sessionUser.userType == 2 && window.userPage == true && sessionUser.userID == user.userID) {
			window.intercomSettings.seatsOverLimit = user.activeStudents.length > user.membershipSeats;
		}
	} else if (typeof sessionUser != 'undefined' && sessionUser.userID == 0 && sessionUser.forceIntercom) {
		window.intercomSettings = {
			app_id: APP_ID
		};
	}
	if (window.intercomSettings) {
		var w = window;
		var ic = w.Intercom;
		if (typeof ic === "function") {
			ic('reattach_activator');
			ic('update', intercomSettings);
		} else {
			var d = document;
			var i = function () {
				i.c(arguments)
			};
			i.q = [];
			i.c = function (args) {
				i.q.push(args)
			};
			w.Intercom = i;

			function l() {
				var s = d.createElement('script');
				s.type = 'text/javascript';
				s.async = true;
				s.src = 'https://widget.intercom.io/widget/' + APP_ID;
				var x = d.getElementsByTagName('script')[0];
				x.parentNode.insertBefore(s, x);
			}
			if (w.attachEvent) {
				w.attachEvent('onload', l);
			} else {
				w.addEventListener('load', l, false);
			}
		}
	}
}

OP.loadNavigation = function () {
	if (Vue && $('#opNavbarVue').length) {
		Vue.config.productionTip = false;

		//navigation vue
		new Vue({
			el: '#opNavbarVue',
			i18n: OP.i18n
		});
	}
}
OP.loadModals = function () {
	if (Vue && $('#vueDialog').length) {
		OP.dialogReset = {
			key: 1,
			shown: 0,
			show: function (title = 'Message Incoming...', message = '') {
				//TODO I couldn't why title = null wouldn't hide the title bar.
				OP.dialog.title = title;
				OP.dialog.message = message;
				OP.dialog.shown = 1;
			},
			hide: function () { OP.dialog.shown = 0 },
			title: '',
			message: '',
			buttonLabel: 'OK',
			dismissLabel: null,
			allowHTML: false,
			onSuccess: function () { },
			onDismiss: function () { },
			runDismiss: true
		};
		OP.dialog = { ...OP.dialogReset }; //clone

		new Vue({
			el: '#vueDialog',
			data: function () {
				return OP.dialog
			},
			i18n: OP.i18n,
			mounted: function () {
				let self = this;
				$('#vueDialog').on('hidden.bs.modal', function () {
					self.shown = 0;
					if (self.runDismiss) {
						self.onDismiss();
					}
					//reset
					OP.syncObject(OP.dialogReset, OP.dialog);
				});
			},
			methods: {
				onDone: function () { //when primary button clicked
					this.runDismiss = false; //disable dismiss function temporarily
					this.onSuccess();
					this.shown = 0;
				}
			},
			watch: {
				'dismissLabel': function (val) {
					// this.$forceUpdate();
				},
				'shown': function (val) {
					// this.key = Math.random(); //rerender

					if (val) {
						$('#vueDialog').modal('show');
					} else {
						$('#vueDialog').modal('hide');
					}
				}
			}
		});

	}
}

OP.loadCookieModal = function (forceOpen = false) {
	if (!OPHELPERS.isDefined(window.CookieControl) || window.embedPage || (window.sketch && window.sketch.showFullscreen)) { //do not load cookies or show the modal
		return;
	}

	var config = {
		apiKey: 'd8d76d5adfd30633f7b385f30732d645b12fd812',
		product: 'PRO',
		mode: 'gdpr',
		necessaryCookies: ['op_session', 'op_csrf', 'op_remember', 'op_prefs_*', 'stripe-*'],
		optionalCookies: [
			{
				name: 'analytics',
				label: 'Analytics',
				description: 'So that we can catch any issues, fix bugs, and provide live support.',
				cookies: ['intercom-*', 'op_cookie_analytics', 'op_local_cookie_analytics'],
				// vendors: [{
				// 	name: 'Intercom',
				// 	description: 'Live Chat Support',
				// 	url: 'https://www.intercom.com/',
				// 	thirdPartyCookies: false
				// }],
				onAccept: function () {
					if (OP_ENVIRONMENT == 'localhost') {
						if (window.CookieControl) { CookieControl.saveCookie('op_local_cookie_analytics', 'true', 365 * 2); }
					} else {
						if (window.CookieControl) {
							CookieControl.saveCookie('op_cookie_analytics', 'true', 365 * 2);
						}
					}
					OP.loadIntercom();
					GA = OP.loadGA();
				},
				onRevoke: function () {
					if (window.CookieControl) {
						CookieControl.delete('op_cookie_analytics');
						CookieControl.delete('op_local_cookie_analytics');
					}
				}
			},
			{
				name: 'advertising',
				label: 'Advertising',
				description: 'Nope, we don’t do ads! Instead, you can support us by <a href="/membership/">becoming a Plus+ member</a>.',
				cookies: [],
				onAccept: function () {

				},
				onRevoke: function () { }
			},
		],

		position: 'RIGHT',
		theme: 'LIGHT',
		subDomains: false,
		initialState: 'notify',
		consentCookieExpiry: 365 * 2,
		notifyDismissButton: false,
		closeStyle: 'button',
		setInnerHTML: true,
		accessibility: {
			overlay: false
		},
		text: {
			notifyTitle: 'Cookies on OpenProcessing',
			notifyDescription: 'We use a few cookies to analyze user experience and ensure our website works well.',
			title: 'Cookies on OpenProcessing',
			intro: 'We use a few cookies to analyze user experience and ensure our website works well.',
			necessaryTitle: 'Functional Cookies',
			necessaryDescription: 'So that we can remember your login info and preferences. Necessary stuff.',
			on: ' ',
			off: ' ',
			closeLabel: 'Save',
			showVendors: 'Show Vendors'
		},
		branding: {
			fontFamily: "'Dosis','Source Sans Pro', Helvetica, sans-serif",
			fontColor: "#333",
			backgroundColor: "#f5f5f5",
			fontSizeIntro: "1em",
			fontSizeHeaders: "0.8em",
			fontSize: "1em",
			toggleText: "#fff",
			toggleColor: "#73C2E9",
			toggleBackground: "#fff",
			buttonIcon: null,
			buttonIconWidth: "64px",
			buttonIconHeight: "64px",
			removeIcon: true,
			removeAbout: true
		},
		excludedCountries: forceOpen ? [] : ["all"],
		onLoad: function () {
			if (forceOpen && window.CookieControl) {
				window.CookieControl.open();
			}
		}

	};
	window.CookieControl.load(config);
}

OP.loadSentry = function () {
	//init sentry error collection
	// if (!OPHELPERS.isDefined(Sentry) || OP_ENVIRONMENT === 'localhost') {
	if (!OPHELPERS.isDefined(Sentry)) {
		return;
	}
	clog('Loading Sentry...');
	OP.Sentry = Sentry;
	let env = OP.getEnvironment();

	OP.Sentry.init({
		Vue,
		dsn: "https://c9e1e20b5bac4b559906be31565bba72@o221510.ingest.sentry.io/1368154",
		release: "openprocessing@" + OP_VERSION,
		environment: env,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: env == 'production' ? 0.3 : 0,
		tracesSampleRate: env == 'production' ? 0.006 : 0, //for performance monitoring
		failedRequestStatusCodes: [[400, 499], [500, 599]],
		// tracePropagationTargets: ["/openprocessing.org", /^\//],
		integrations: [
			new Sentry.Replay({
				networkDetailAllowUrls: ['/sketch/save_ajax']
			}),
			new Sentry.BrowserTracing({
				tracePropagationTargets: ["/openprocessing.org", /^\//],
			}),
			new ExtraErrorDataIntegration({
				// Limit of how deep the object serializer should go. Anything deeper than limit will
				// be replaced with standard Node.js REPL notation of [Object], [Array], [Function] or
				// a primitive value. Defaults to 3.
				depth: 3,
			}),
		]
	});

	if (sessionUser && sessionUser.userID > 0 && OP.Sentry && OP.Sentry.setUser) {
		OP.Sentry.setUser({
			"id": sessionUser.userID
		});
	}
	if (OP.Sentry.withScope) {
		$(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
			if (navigator.onLine === true) { //ignore errors caused by user going offline 
				//log error
				OP.Sentry.withScope((scope) => {
					let message = OPHELPERS.getResponseMessage(jqXHR);
					scope.setLevel("info");
					scope.setExtra("url", ajaxSettings.url);
					scope.setExtra("data", ajaxSettings.data);
					scope.setExtra("status", jqXHR.status);
					scope.setExtra("error", thrownError || message);
					scope.setExtra("response", jqXHR.response);
					scope.setExtra("responseText", jqXHR.responseText ? jqXHR.responseText.substring(0, 100) : '')
					scope.setExtra("responseJSON", jqXHR.responseJSON)
					if (message) {
						scope.setFingerprint([message, 'XHR error']);
					}
					OP.Sentry.captureException(thrownError || message);
				});
			}
		});
	}
}

OP.getEnvironment = function () {
	let host = window.location.host;
	if (host.indexOf('local.openprocessing.org') == 0) return 'localhost';
	if (host.indexOf('design.openprocessing.org') == 0) return 'staging';
	return 'production';
}


var loadSearch = function () {
	var search = $('.searchForm input');
	search.on('focus', function () {
		$(this).addClass('filled');
	})
		.on('blur', function () {
			if ($(this).val() != '') {
				$(this).addClass('filled');
			} else {
				$(this).removeClass('filled');
			}
		});

	// //set tag behavior
	// var tags = $('.searchForm .tags a');
	// tags.on('click', function (e) {
	// 	e.preventDefault();
	// 	$('.navbar .searchForm input[name="time"]').val($(this).attr('data-time'));
	// 	$('.navbar .searchForm input[name="type"]').val($(this).attr('data-type'));
	// 	$('.navbar .searchForm input[name="q"]').val($(this).attr('data-q'));
	// 	$('.navbar .searchForm form').submit();
	// 	return false;
	// });

}


OP.dateSQL = function () {
	var date = new Date();
	date = date.getUTCFullYear() + '-' +
		('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
		('00' + date.getUTCDate()).slice(-2) + ' ' +
		('00' + date.getUTCHours()).slice(-2) + ':' +
		('00' + date.getUTCMinutes()).slice(-2) + ':' +
		('00' + date.getUTCSeconds()).slice(-2);
	return date;

}

/** adds hideUntilLoaded class to given images, and removes that class when image is loaded
 **/
OP.setupImageLoading = function (selector) {
	if (typeof selector == 'undefined') {
		selector = '.sketchThumb:not(.noUnveil):not(.unveiled):not(.noThumbnail), .userThumb:not(.noUnveil):not(.unveiled):not(.noThumbnail)';
	}
	let elements = $(selector);
	elements.addClass('hideUntilLoaded');

	//set unveil
	if (elements.length > 0) {
		elements.unveil(100, function (img) {
			$(this).trigger('load', function () {
				$(this).removeClass('hideUntilLoaded');
				if ($(this).attr('src') == '/assets/img/blank.png') {
					$(this).addClass('noThumbnail');
				} else {
					$(this).addClass('unveiled');
				}
			});
		});
		$(window).resize();
	}

	//set imagesLoaded
	/*if ($(selector).length > 0) {
			$(selector).imagesLoaded()
					.progress(function (imgLoad, image) {
							$(image.img).removeClass('hideUntilLoaded');
					})
					.error(function () {
							$(this).attr('src', '/assets/img/blank.png');
					});
	}*/

}

OP.getSketchThumbURL = function (sketch, thumbnailUpdatedOn = null) {
	let sketchID = '';
	if (typeof sketch === 'number' || typeof sketch === 'string') {
		sketchID = sketch;
	} else {
		sketchID = sketch.visualID;
		thumbnailUpdatedOn = thumbnailUpdatedOn ?? sketch.thumbnailUpdatedOn;
	}
	let hash = !!thumbnailUpdatedOn ? '?hash=' + thumbnailUpdatedOn.replace(/\D/g, "") : '';
	let extension = sketchID > 385700 ? '@2x.jpg' : '.jpg';
	return `${AWS_THUMB_BUCKET_URL}/thumbnails/visualThumbnail${sketchID + extension + hash}`;
}

/** listSketches adds the given sketches in data in a list format. selector should be UL (unordered list);
 **/
OP.listSketches = function (selector, data, classes = '', forceRetina = false) {
	d3.select(selector).classed('sketchList', true);

	var sketches = d3.select(selector).selectAll('li.sketchLi')
		.data(data, function (d) {
			return +d.visualID
		});
	var sketchLi = sketches
		.enter()
		.append('li')
		.attr('class', classes)
		.classed('sketchLi', true)
	var linkContainer = sketchLi
		.append('a')
		.classed('sketchThumbContainer', true)
		.classed('archived', function (d) {
			d.isArchived = d.isPjs == 0;
			return +d.isArchived
		})
		.attr('href', function (d) {
			return '/sketch/' + d.visualID;
		});
	sketchLi
		.append('div')
		.classed('sketchActions', true); //container for actions. These are filled by the page case by case basis.
	let overflow = linkContainer
		.append('div')
		.classed('sketchThumbOverflow', true);
	overflow
		.append('img')
		.attr('src', function (d) {
			return '/assets/img/blank.png'
			//return '/sketch/' + d.visualID + '/thumbnail'
		})
		.attr('data-src', function (d) {
			let thumbDate = !!d.thumbnailUpdatedOn ? '?hash=' + d.thumbnailUpdatedOn.replace(/\D/g, "") : '';
			return `/sketch/${d.visualID}/thumbnail/thumbnail.jpg${thumbDate}`;
		})
		.attr('class', 'sketchThumb');
	//draw meta data container
	linkContainer
		.append('div')
		.attr('class', 'attrLabel');


	let pLabel = linkContainer
		.append('div')
		.attr('class', 'sketchLabel')
		.append('p')
	pLabel.append('span')
		.classed('sketchTitle', true)
		.text(d => d.title);

	pLabel.append('span')
		.text(function (d) {
			return d.fullname ? 'by ' + d.fullname : '';
		});

	let sketchMeta = pLabel.append('div')
		.classed('sketchMeta', true);
	sketchMeta.append('span')
		.classed('views', true)
		.text(function (d) {
			return d.numberOfViews > 0 ? d.numberOfViews : '0';
		});
	sketchMeta.append('span')
		.classed('hearts', true)
		.text(function (d) {
			return d.numberOfHearts > 0 ? d.numberOfHearts : '0';
		});
	sketchMeta.append('span')
		.classed('comments', true)
		.text(function (d) {
			return d.numberOfComments > 0 ? d.numberOfComments : '0';
		});
	sketchMeta.append('span')
		.classed('pinned', true)
		.text('Pinned');

	//onUpdate
	d3.select(selector).selectAll('.attrLabel').text(function (d) {
		var attrText = [];
		if (+d.status == 2) { //if waiting for approval, only show that data 
			attrText.push('Waiting Approval');
		} else {
			if (+d.isLate) attrText.push('Late');
			if (+d.isExample) attrText.push('Example');
			if (+d.isDraft) attrText.push('Draft');
			if (+d.isArchived) attrText.push('Archived');
			if (+d.isPrivate == 1) attrText.push('Private');
			if (+d.isPrivate == 2) attrText.push('Class only');
			if (+d.isPrivate == 3) attrText.push('Teachers only');
			if (+d.parentID) attrText.push('Fork');
			if (+d.isTutorial) attrText.push('Tutorial');
		}
		if (attrText.length === 0) {
			return '';
		} else if (attrText.length > 1) {
			$(this).attr('title', attrText.join('/'));
			//shorten words
			attrText = $.map(attrText, function (f) {
				return f == "Example" || f == "Late" ? f : f.substring(0, 2);
			});
		}
		return attrText.join('/');
	})


	sketches.exit().remove();


	OP.setupImageLoading($(selector).find(' .sketchThumb'));


}

OP.listUsers = function (selector, data, classes = '', sortFunction = false, loadImages = true, limit = false) {
	d3.select(selector).classed('userList', true);
	let hiddenItems = 0;
	var users = d3.select(selector).selectAll('li.userLi')
		.data(data, function (d) {
			return d.userID
		});
	var usersListItems = users
		.enter()
		.append('li')
		.attr('class', classes)
		.classed('userLi', true);
	var usersContainer = usersListItems
		.append('a')
		.classed('userThumbContainer', true)
		.attr('href', function (d) {
			return '/user/' + d.userID;
		});
	usersContainer
		.append('div')
		.text(function (d) {
			return d.fullname
		})
		.attr('class', 'userLabel')
		.each(function (d) {
			var splits = d.fullname.split(' ');
			var first = splits[0];
			var rest = '';
			var html = '<span>' + first + '</span>';
			if (splits.length > 0) {
				rest = splits.slice(1).join(' ');
				html += ' <span>' + rest + '<span>';
			}
			d3.select(this).html(html);

		});
	usersContainer
		.append('img')
		.attr('src', function (d) {
			return '/assets/img/blank.png';
		})
		.attr('data-src', function (d) {
			return "/user/" + d.userID + "/thumbnail"
		})
		.attr('class', 'userThumb');
	usersContainer
		.append('div')
		.classed('userThumbPlus', function (u) {
			return u.membershipType > 0
		});
	users.exit().remove();

	//on update
	d3.select(selector).selectAll('li.userLi')
		.classed('hideWhenMinimized', function (d, i) {
			let res = limit > 0 && i > limit - 1;
			res ? hiddenItems++ : null;
			return res;
		});

	if (_.isFunction(sortFunction)) {
		users.sort(sortFunction);
	}
	if (loadImages !== false) {
		OP.setupImageLoading(selector + ' .userThumb');
	}

	//add "show all" link if hidden items exist
	d3.select(selector)
		.selectAll('li.seeMore').data([1234]).enter().append('li') //add only once
		.attr('class', 'seeMore ' + classes)
		.classed('hide', hiddenItems < 1)
		.attr('data-seemore', '+' + hiddenItems)
		.on('click', function () {
			d3.select(selector).classed('minimized', false);
		})
		.append('img')
		.attr('src', function (d) {
			return "/assets/img/blank.png"
		})
		.attr('class', 'ratioKeeper');

	d3.select(selector).classed('minimized', hiddenItems > 0);


}
/** setupLiveForm sets up marked items into contentEditable in-place form
	 class markers = .editable,.notEditable, .removable, .selectable;
	 looks for attributes:  name="tags" label="tags" description="use commas"
	 **/


OP.animateTextIn = function (selector, duration, delay, animateInDelay, animateOutDelay) {
	var title = $(selector);
	if (!$('html').hasClass('wf-active')) {
		title.css('opacity', 0); //make sure to hide to text until animation starts
		window.setTimeout(function () {
			OP.animateTextIn(selector, duration, delay, animateInDelay, animateOutDelay);
		}, 200);
		return;
	}

	//prepare title
	title.addClass('animateText');
	var breakCharacter = '▒';
	var breakHTML = '<lb>' + breakCharacter + '</lb>';
	title.breakLines({
		lineBreakHtml: breakHTML
	});

	//set height to prevent jumps
	title.css({
		height: title.height() + 'px'
	});
	var titleText = title.text();

	var titleArray = titleText.split('');
	title.html(''); //clear inside
	var letters = d3.select(selector).selectAll('span').data(titleArray);
	//    var rand = Math.round(Math.random()*6+2);
	var rand = 2;
	letters
		.enter()
		.append('span')
		.html(function (d, i) {
			var ret = d === ' ' ? '&nbsp;' : d;
			//set width to 0 if this is space and next is linebreak, to prevent line drop
			if (ret === '&nbsp;' && titleArray[i + 1] === breakCharacter) {
				ret = '';
			}
			if (ret === breakCharacter) { //put a break after the span
				$('<br/>').insertAfter(this);
				return '';
			}
			return ret;

		})
		.attr('data-width', function () {
			return $(this).width()
		})
		.style('width', function () {
			return $(this).attr('data-width') + 'px'
		})
		.style('text-indent', function (d, i) {
			//negative value comes from left, positive from right;
			//return Math.random() > 1 ? 0 : -$(this).width() + 'px';
			return Math.random() > 0.5 ? $(this).width() + 'px' : -$(this).width() + 'px';
		})
		.style('opacity', 1);
	letters
		.transition()
		.duration(duration)
		.delay(function (d) {
			return Math.random() * delay + animateInDelay;
		})
		.ease('quad-in-out')
		.style('text-indent', '0px')

	if (animateOutDelay && animateOutDelay > 0) {
		window.setTimeout(function () {
			OP.animateTextOut(selector, duration, delay)
		}, animateOutDelay);
	}

	//finally reveal the title
	title.css('opacity', 1);

}
OP.animateTextOut = function (selector, duration, delay) {
	var title = $(selector);
	var letters = d3.select(selector).selectAll('span');
	var rand = Math.round(Math.random() * 6 + 2);
	letters
		.transition()
		.duration(duration)
		.delay(function (d) {
			return Math.random() * delay
		})
		.style('text-indent', function (d, i) {
			return i % rand !== 0 ? $(this).width() + 'px' : -$(this).width() + 'px';
		})
		.style('opacity', 0);

	//title.removeClass('animateText');



}


/** Hide/show related messages if user has membership **/
//The rule is that all elements show by default, and hideIf and removeIf elements are removed per session user status
OP.setupMembershipElements = function () {
	if (+sessionUser.membershipType === 2) { //if professor
		$('html').addClass('professorPlus');
		$('.removeIfProfessorPlus').remove();
	} else if ((+sessionUser.membershipType === 1 || +sessionUser.membershipType === 3)) { //plus or studentPlus
		$('html').addClass('plus');
		$('.removeIfPlus').remove();
	} else { //if nonMember
		$('html').addClass('nonMember');
		$('.removeIfProfessorPlus, .removeIfPlus').remove();
	}

	if (sessionUser.userID == 0) {
		$('html').addClass('nonMember guest');
		$('.removeIfProfessorPlus, .removeIfPlus, .removeIfMember').remove();
	}

}
OP.logError = function (error, scopeFunc = null) {
	// console.error('Logged Error:', error);
	if (OP.Sentry) {
		if (scopeFunc) {
			OP.Sentry.configureScope(scopeFunc);
		}
		OP.Sentry.captureException(error);
	}
}
OP.logInfo = function (message, scopeFunc = null) {
	if (OP.Sentry) {
		if (scopeFunc) {
			OP.Sentry.configureScope(scopeFunc);
		}
		OP.Sentry.captureMessage(message, 'info');
	}
}
OP.logBreadcrumb = function (data) {
	if (OP.Sentry) {
		OP.Sentry.addBreadcrumb(data);
	}
}

OP.loadGA = function () {
	//google analytics
	if (!GA_MEASUREMENT_ID || Analytics === undefined) {
		return;
	}
	clog('Loading Google Analytics');

	const analytics = Analytics({
		app: 'OpenProcessing',
		plugins: [
			googleAnalytics({
				measurementIds: [GA_MEASUREMENT_ID]
			})
		]
	})

	if (sessionUser && sessionUser.userID > 0) {
		analytics.identify(`user-${sessionUser.userID}`, {
			isMember: sessionUser.membershipType > 0
		})
	}

	/* Track a page view */
	if (!window.location.pathname.startsWith('/user/')) { //user name has its own tracking
		analytics.page();
	}

	return analytics;
}

OP.loadCaptcha = function () {
	if (typeof window.recaptcha == 'undefined') {
		$('body').append("<script src = 'https://www.google.com/recaptcha/api.js'></script>");
	}
}
OP.showMessageBox = function(message,title,duration = 3000, parent = null, position="bottom-right"){
	let options = {};
	options.closeButton = duration == 0;
	options.timeOut = duration;
	duration==0 ? options.extendedTimeOut = 0: null; 
	options.preventDuplicates = true;
	if(parent !== null){
		options.target = parent;
	}
	options.positionClass = 'toast-'+position;
	toastr.info(message, title, options);
}
OP.showMessageModal = function (message, onSuccess, allowHTML = false) {
	//convert response to message
	if (typeof message != 'string') {
		allowHTML = (message.getResponseHeader && message.getResponseHeader('X-Allow-HTML') === 'true') ?? allowHTML; //enable if HTML is allowed via the server
		message = OPHELPERS.getResponseMessage(message);
	}

	let messageDiv = $('#messageModal').find('.message');
	if (allowHTML === true) {
		messageDiv.addClass('markdown').html(message); //set message
	} else {
		messageDiv.removeClass('markdown').text(message); //set message
	}
	$('#messageModal .modal-footer button').off('click').on('click', onSuccess ? onSuccess : null); //set action

	$('#messageModal').modal('show'); //show
}
OP.showImageModal = function (imageSrc) {
	//check if vue on modal is initialized. if so, use that one, otherwise init
	let v = $('#imageModal').get(0).__vue__;
	if (v) {
		v.src = imageSrc;
		v.init();
	} else {
		new Vue({
			el: '#imageModal',
			data: {
				src: imageSrc,
				loading: true,
				width: null,
				height: null,
			},
			mounted: function () {
				let self = this;
				$(this.$el).on('shown.bs.modal', () => {
					self.focus();
				})
				$(this.$el).on('hidden.bs.modal', () => {
					self.src = null;
				})
				this.init();
			},
			methods: {
				init: function () {
					this.loading = true;
					this.width = null;
					this.height = null;
					this.show();
				},
				show: function () {
					$(this.$el).modal('show')
					setTimeout(() => {
						$(this.$el).find('a').trigger('focus');
					}, 200);
				},
				close: function () {
					$(this.$el).modal('hide');
				},
				getImageWidth: function () {
					return $('#imageModal_image').width();
				},
				getImageHeight: function () {
					return $('#imageModal_image').height();
				},
				isDataFile() {
					return this.src && this.src.indexOf('data:') === 0;
				}
			},
			computed: {
				filePath: function () {
					return this.isDataFile() ? null : this.src;
				}
			},
			watch: {
				src: function (val) {
					this.loading = true;
				},
				loading: function (val) {
					if (!val) {
						this.$nextTick(() => {
							$(this.$el).find('a').trigger('focus');
							window.setTimeout(() => {
								this.width = this.getImageWidth();
								this.height = this.getImageHeight();
								// bug: add timeout, otherwise width and height shows up -60 if cached.
							}, 200);
						});
					}
				}
			}
		})
	}
}
OP.showErrorModal = function (message, header = "Oops, that didn't work", onSuccess = null, allowHTML = false) {
	//convert response to message
	if (typeof message === 'object') {
		//get html allow response.
		if (message.name == 'AxiosError') {
			allowHTML = (message.response && message.response.headers.get('X-Allow-HTML') === 'true') || allowHTML; //enable if HTML is allowed via the server
		} else {
			allowHTML = (message.getResponseHeader && message.getResponseHeader('X-Allow-HTML') === 'true') || allowHTML; //enable if HTML is allowed via the server
		}
		message = OPHELPERS.getResponseMessage(message);
	}
	if (!message) {
		message = 'Something went wrong. Please try again.';
	}

	let messageDiv = $('#errorModal .message');
	if (allowHTML === true) {
		messageDiv.addClass('markdown').html(message); //set message
	} else {
		messageDiv.removeClass('markdown').text(message); //set message
	}
	$('#errorModal .modal-title').text(header); //set action
	$('#errorModal .modal-footer button').off('click').on('click', onSuccess ? onSuccess : null); //set action
	$('#errorModal').modal('show'); //show
	return message; //returns string version of the message
}
/** Generic Modal
 * Options include:
 * title
 * content
 * size: 'md',
 * buttonText: 'Submit',
 * ajaxURL
 * ajaxDone
 * ajaxFail
 * ajaxAlways
 */
OP.setupAjaxModal = function (options) {
	let $modal;
	if (options.container) {
		$modal = $(options.container);
		//if container is provided, then we assume the title and content are already set
	} else {
		$modal = $('#ajaxModal').clone();
		$modal.find('.modal-title').text(options.title ?? '');
		$modal.find('.modal-body').html(options.content ?? '');
	}
	$modal.find('.modal-dialog').addClass(options.size ? ('modal-' + options.size) : 'modal-lg');
	let $btn = $modal.find('.btn-primary');
	let $cancelBtn = $modal.find('.btn-default');
	options.buttonText = options.buttonText ?? 'Submit';
	$btn.text(options.buttonText);
	$btn.attr('data-loading-text', options.buttonText); //keep the size same, shows icon instead with .loading
	$btn.attr('data-success-text', options.buttonText); //keep the size same, shows icon instead with .loading


	//setup button
	$modal.find('.btn-primary')
		.off('click.modalSubmit')
		.on('click.modalSubmit', function (s) {
			$btn.addClass('loading').removeClass('btn-success btn-error');
			$cancelBtn.addClass('disabled'); //disable cancel as well.
			if (options.ajaxURL) {
				$.ajax({
					method: 'GET',
					dataType: 'json',
					url: options.ajaxURL,
					cache: false
				})
					.done(function (res) {
						$btn.button('success').addClass('btn-success');
						if (options.ajaxDone) {
							options.ajaxDone(res)
						}
					})
					.fail(function (res) {
						$btn.button('error').addClass('btn-error');
						if (options.ajaxFail) {
							options.ajaxFail(res)
						}
					})
					.always(function (res) {
						$btn.removeClass('loading');
						if (options.ajaxAlways) {
							options.ajaxAlways(res)
						}
						window.setTimeout(function () {
							$btn.button('reset').removeClass('btn-success btn-error');
							$cancelBtn.removeClass('disabled')
						}, 3000)
					});
			}
		});
	return $modal;
}

/** Generic Modal
 * Options include:
 * title
 * content
 * ajaxURL
 * ajaxDone
 * ajaxFail
 * ajaxAlways
 */
OP.setupModal = function (selector, options) {
	let $modal = $(selector);
	//setup button
	$modal.find('.btn-primary')
		.off('click.modalSubmit')
		.on('click.modalSubmit', function (s) {
			var $btn = $(this).button('loading');
			if (options.ajaxURL) {
				$.ajax({
					method: 'GET',
					dataType: 'json',
					url: options.ajaxURL,
					cache: false
				})
					.done(options.ajaxDone)
					.fail(options.ajaxFail)
					.always(options.ajaxAlways);
			}
		});
	return $modal;
}

// Written for: http://stackoverflow.com/questions/4671713/#7431801
// by Nathan MacInnes, nathan@macinn.es

// use square bracket notation for Closure Compiler
OP.breakLines = $.fn.breakLines = function (options) {
	var defaults = {
		// HTML to insert before each new line
		'lineBreakHtml': '<br />',
		// Set this to true to have the HTML inserted at the start of a
		// <p> or other block tag
		'atStartOfBlocks': false,
		// false: <LINEBREAK><span>text</span>;
		// true: <span><LINEBREAK>text</span>
		'insideStartOfTags': false,
		// If set, the element's size will be set to this before being
		// wrapped, then reset to its original value aftwerwards
		'widthToWrapTo': false
	};
	options = $.extend(defaults, options);
	return this.each(function () {
		var textNodes, // all textNodes (as opposed to elements)
			copy, // jQuery object for copy of the current element
			el = $(this), // just so we know what we're working with
			recurseThroughNodes, // function to do the spitting/moving
			insertedBreaks, // jQuery collection of inserted line breaks
			styleAttr; // Backup of the element's style attribute

		// Backup the style attribute because we'll be changing it
		styleAttr = $(this).attr('style');

		// Make sure the height will actually change as content goes in
		el.css('height', 'auto');

		// If the user wants to wrap to a different width than the one
		// set by CSS
		if (options.widthToWrapTo !== false) {
			el.css('width', options.widthToWrapTo);
		}

		/*
				This function goes through each node in the copy and splits
				it up into words, then moves the words one-by-one to the
				element. If the node it encounters isn't a text node, it
				copies it to the element, then the function runs itself again,
				using the copy as the currentNode and the equivilent in the
				copy as the copyNode.
		*/
		recurseThroughNodes = function (currentNode, copyNode) {
			$(copyNode).contents().each(function () {
				var nextCopy,
					currentHeight;

				// update the height
				currentHeight = el.height();

				// If this is a text node
				if (this.nodeType === 3) {
					// move it to the original element
					$(this).appendTo(currentNode);
				} else {
					// Make an empty copy and put it in the original,
					// so we can copy text into it
					nextCopy = $(this).clone().empty()
						.appendTo(currentNode);
					recurseThroughNodes(nextCopy, this);
				}

				// If the height has changed
				if (el.height() !== currentHeight) {
					// insert a line break and add to the list of
					// line breaks
					insertedBreaks = $(options.lineBreakHtml)
						.insertBefore(this)
						.add(insertedBreaks);
				}
			});
		};

		// Clone the element and empty the original
		copy = el.clone().insertAfter(el);
		el.empty();

		// Get text nodes: .find gets all non-textNode elements, contents
		// gets all child nodes (inc textNodes) and the not() part removes
		// all non-textNodes.
		textNodes = copy.find('*').add(copy).contents()
			.not(copy.find('*'));

		// Split each textNode into individual textNodes, one for each
		// word
		textNodes.each(function (index, lastNode) {
			var startOfWord = /\W\b/,
				result;
			while (startOfWord.exec(lastNode.nodeValue) !== null) {
				result = startOfWord.exec(lastNode.nodeValue);
				// startOfWord matches the character before the start of a
				// word, so need to add 1.
				lastNode = lastNode.splitText(result.index + 1);
			}
		});

		// Go through all the nodes, going recursively deeper, until we've
		// inserted line breaks in all the text nodes
		recurseThroughNodes(this, copy);

		// We don't need the copy anymore
		copy.remove();

		// Clean up breaks at start of tags as per options
		insertedBreaks.filter(':first-child').each(function () {
			if (!options.atStartOfBlocks &&
				$(this).parent().css('display') === "block") {
				$(this).remove();
			}
			if (!options.insideStartOfTags) {
				$(this).insertBefore($(this).parent());
			}
		});
		// Restore backed-up style attribute
		$(this).attr('style', styleAttr);
	});
};

//sync iterable object properties of FROM to TO
//helpful when object is being updated with server props while keeping reactive props in place
OP.syncObject = function (from, to, exclude = []) {
	clogGroupCollapsed('Syncing Object');
	for (let key in from) {
		if (from.hasOwnProperty(key) && !exclude.includes(key)) {
			to[key] = from[key];
			clog(`synced ${key}: ${from[key]}`);
		}
	}
	clogGroupEnd('Syncing Object');
}
/**
 * options.url: url of ajax call
 * options.data: array of key-value pairs to submit
 * option.submitButton: submit button selector
 * 
 * 
 *   */
OP.ajaxForm = function (options) {
	let url = options.url;
	let form = $(options.form);
	let submitButton = options.submitButton ? $(options.submitButton) : form.find('[type=submit]');
	let beforeSubmit = (_.isFunction(options.beforeSubmit)) ? options.beforeSubmit : false;
	let done = (_.isFunction(options.done)) ? options.done : false;
	let always = (_.isFunction(options.always)) ? options.always : false;
	let fail = (_.isFunction(options.fail)) ? options.fail : false;
	let xhr = null;

	let submitForm = function (event) {
		event.preventDefault();
		if (beforeSubmit) beforeSubmit();

		let data = OPHELPERS.isDefined(options.data) ? options.data : null;
		if (!data) { //if data is not defined then use serialized form data
			data = {};
			let formArray = form.serializeArray();
			for (var i = 0; i < formArray.length; i++) {
				data[formArray[i]['name']] = formArray[i]['value'];
			}
		}
		submitButton.removeClass('btn-success btn-error').addClass('loading')
		xhr = $.postJSON(url, data)
			.done(function (response) {
				submitButton.addClass('btn-success')
				if (done) done(response);
			})
			.fail(function (response) {
				submitButton.addClass('btn-error')
				if (fail) {
					fail(response);
				} else {
					OP.showErrorModal(response);
				}
			})
			.always(function () {
				window.setTimeout(function () {
					submitButton.removeClass('btn-success btn-error loading')
				}, 2000)
				if (always) always();
			});
		return false;
	};

	if (options.submitButton) {
		submitButton.on('click', submitForm);
	}
	form.on('submit', submitForm);

	return xhr;

}
export const OPLiveForm = function (options) {

	/** options:
	container:
	enableOnLoad: true|*false: enables the form immediately
	disableOnSubmit: *true|false: enables the form immediately
	submitURL:
	onLoad:
	onSuccess: after ajax call
	**/
	this.container = $(options.container);
	this.notEditables = this.container.find('.notEditable');
	this.editables = this.container.find('.editable');
	this.selectables = this.container.find('.selectable');
	this.removables = this.container.find('.removable');
	this.toggleables = this.container.find('.toggleable');
	this.textareas = this.container.find('textarea');
	this.selects = this.container.find('select');

	this.enableOnLoad = (typeof options.enableOnLoad !== 'undefined') ? options.enableOnLoad : false;
	this.disableOnSubmit = (typeof options.disableOnSubmit !== 'undefined') ? options.disableOnSubmit : true;

	this.onSuccess = (_.isFunction(options.onSuccess)) ? options.onSuccess : false;
	this.beforeSubmit = (_.isFunction(options.beforeSubmit)) ? options.beforeSubmit : false;
	this.onLoad = (_.isFunction(options.onLoad)) ? options.onLoad : false;
	this.onEnable = (_.isFunction(options.onEnable)) ? options.onEnable : false;
	this.onDisable = (_.isFunction(options.onDisable)) ? options.onDisable : false;
	this.onAlways = (_.isFunction(options.onAlways)) ? options.onAlways : false;
	this.onFail = (_.isFunction(options.onFail)) ? options.onFail : false;
	this.submitURL = options.submitURL;
	this.submitButton = $(options.submitButton);

	var self = this;
	this.submitButton.on('click', function () {
		self.submit()
	});



	if (this.onLoad) this.onLoad();
	if (options.enableOnLoad) {
		this.enable();
	}
	return this;

}

OPLiveForm.prototype.enable = function () {
	var self = this;
	this.container.addClass('edit OPLiveForm');
	this.container.find('.notEditable')
		.css('opacity', 0)
		.css('pointer-events', 'none');
	this.container.find('.editable')
		.addClass('edit')
		//.attr('contentEditable', true);
		.each(function () {
			$(this).html($(this).html().trim()); //remove any whitespace after/before to prevent html whitespaces
			var textAreaSettings = {
				allowHTML: false, //allow HTML formatting with CTRL+b, CTRL+i, etc.
				allowImg: false, //allow drag and drop images
				singleLine: $(this).hasClass('singleLine'), //make a single line so it will only expand horizontally
				pastePlainText: true, //paste text without styling as source
				placeholder: false //a placeholder when no text is entered. This can also be set by a placeholder="..." or data-placeholder="..." attribute
			}
			$(this).toTextarea(textAreaSettings).toTextarea('enable');
		});

	this.container.find('.removable, .selectable,.toggleable')
		.addClass('edit');



	//selectables: turns children into radio buttons, only on click
	this.selectables.find('a')
		.on('click', function (e) {
			e.preventDefault();
		});

	this.selectables.children().off('click').on('click', function () {
		$(this.parentElement).children().removeClass('selected');
		$(this).addClass('selected');
	})

	//setup removable behavior
	this.removables.children().off('click').on('click', function () {
		$(this).remove();
	});

	this.toggleables.off('click').on('click', function (e) {
		e.preventDefault();
		$(this).toggleClass('selected');
	});

	this.textareas.addClass('edit');

	this.selects.addClass('edit');


	//prevent html pasting
	/* disabled: toTextarea handles this now
	this.container.find('[contenteditable]')
			.off('paste')
			.on('paste', function (e) {
					e.preventDefault();
					var text = (e.originalEvent || e).clipboardData.getData('text/html') || '';
					var safeText = $('<div></div>').html(text).text();
					$(this).text(safeText);
			});
			*/
	if (self.onEnable) this.onEnable();
	return self;
}
OPLiveForm.prototype.disable = function () {
	var self = this;
	this.container.removeClass('edit OPLiveForm');

	this.editables.removeClass('edit')
		//.attr('contentEditable', false);
		.toTextarea('disable');
	this.removables.removeClass('edit');
	this.selectables.removeClass('edit');
	this.toggleables.removeClass('edit');
	this.textareas.removeClass('edit');
	this.selects.removeClass('edit');

	this.toggleables.off('click');
	if (self.onDisable) self.onDisable();
	return self;
}
OPLiveForm.prototype.getFormData = function () {
	var self = this;
	//collect form data to submit
	var formData = {};
	this.container.find('input:not([type="radio"]):not([type="checkbox"])').each(function () {
		let name = $(this).attr('name');
		let value = $(this).val().trim();
		formData[name] = value;
	});
	this.container.find('input[type="radio"]:checked').each(function () {
		let name = $(this).attr('name');
		let value = $(this).val().trim();
		formData[name] = value;
	});
	this.container.find('input[type="checkbox"]:checked').each(function () {
		let name = $(this).attr('name');
		let value = $(this).val().trim();
		formData[name] = value;
	});
	this.container.find('.editable:not(input)').each(function () {
		let name = $(this).attr('name');
		let value = $(this).text().trim();
		formData[name] = value;
	});
	this.selectables.each(function () {
		let name = $(this).attr('name');
		let value = $(this).find('.selected').attr('value');
		formData[name] = value;
	});
	this.removables.each(function () {
		let name = $(this).attr('name');
		let value = [];
		$(this).children().each(function () {
			value.push($(this).attr('value'));
		});
		formData[name] = value;
	});
	this.toggleables.each(function () {
		let name = $(this).attr('name');
		let value = $(this).hasClass('selected');
		formData[name] = value;
	});
	this.textareas.each(function () {
		let name = $(this).attr('name');
		let value = $(this).val();
		formData[name] = value;
	});
	this.selects.each(function () {
		let name = $(this).attr('name');
		let value = $(this).val();
		formData[name] = value;
	});
	return formData;
}
OPLiveForm.prototype.submit = function () {
	var self = this;
	//disable form elements
	if (this.disableOnSubmit) {
		this.disable();
	}
	if (self.beforeSubmit) self.beforeSubmit();
	self.submitButton.removeClass('btn-success btn-error').button('loading');
	$.postJSON(self.submitURL, self.getFormData())
		.done(function (response) {
			self.submitButton.button('success').addClass('btn-success');
			self.notEditables
				.css('opacity', '')
				.css('pointer-events', '');

			if (self.onSuccess) self.onSuccess(response);
			return false;
		})
		.fail(function (response) {
			self.submitButton.button('error').addClass('btn-error');
			if (self.onFail) {
				self.onFail(response);
			} else {
				var message = OPHELPERS.getResponseMessage(response);
				OP.showMessageModal("Oops, we got some problem here:  " + message);
			}
		})
		.always(function () {
			window.setTimeout(function () {
				self.submitButton.button('normal').removeClass('btn-success btn-error');
			}, 2000)
			if (self.onAlways) self.onAlways();
		});
	return self;
}


jQuery.fn.extend({
	ajaxButton: function () {
		var normalText = $(this).text();
		var loadingText = $(this).attr('data-loading-text');
		$(this)
			.off('click.ajaxButton')
			.on('click.ajaxButton', function () {
				$(this)
					.addClass('disabled')
					.attr('disabled', 'true')
					.text($(this).attr('data-loading-text'));
			});
		return $(this);
	},
	resetButton: function () {
		$(this)
			.removeClass('disabled')
			.removeAttr('disabled')
			.text($(this).attr('data-normal-text'));
		return $(this);
	}

});

OP.linkify = function (text) {
	var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(urlRegex, function (url) {
		return '<a href="' + url + '">' + url + '</a>';
	});
}

OP.cookie = {
	prefix: 'op_',
	domain: '.openprocessing.org', //so that they match backend
	getItem: function (sKey) {
		if (!sKey) {
			return null;
		}
		sKey = this.prefix + sKey;
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain = this.domain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		sKey = this.prefix + sKey;
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain = this.domain) {
		if (!this.hasItem(sKey)) {
			return false;
		}
		sKey = this.prefix + sKey;
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) {
			return false;
		}
		sKey = this.prefix + sKey;
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			let val = aKeys[nIdx].replace(this.prefix, '');
			aKeys[nIdx] = decodeURIComponent(val);
		}
		return aKeys;
	}
};

//post json + CSRF functionality
(function ($) {
	$(document).bind("ajaxSend", function (elm, xhr, s) {
		// if (s.type == "POST") {
		xhr.setRequestHeader(OP_CSRF.name, OP_CSRF.hash);
		// }
	});
	//create a post json to use with json ajax calls
	$.postJSON = function (url, data, dataType = 'json') {
		return $.ajax({
			url: url,
			method: "POST",
			data: data,
			dataType: dataType //type expected on server return
		})
	}
})(jQuery);


//inter-window messaging
if (typeof BroadcastChannel !== 'undefined') {
	OP.broadcastChannel = new BroadcastChannel('OpenProcessing');
	OP.broadcastChannel.onmessage = function (msg) {
		// clog(msg);
		msg = msg.data;
		if (msg == "updateSessionUser") {
			$.getJSON('/user/getSessionUser_ajax')
				.done(function (response) {
					clog(response);
					OP.syncObject(response.object, sessionUser);
				})
		}
	}
} else {
	//create empty one to prevent errors
	OP.broadcastChannel = {
		'postMessage': function () { }
	};

}