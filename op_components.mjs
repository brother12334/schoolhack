import * as OPHELPERS from "./op_helpers.mjs";
import { OP } from "./openprocessing.mjs";
import * as AUTH from "./op_auth.mjs";
import Autocomplete from './vendor/node_modules/@trevoreyre/autocomplete-vue/dist/autocomplete.esm.js';
import axios from './vendor/node_modules/axios/dist/esm/axios.min.js';

globalThis.Vue.use(Autocomplete)

globalThis.Vue.component('css', {
	name: 'css',
	props: {
		'href': {
			type: String,
			required: true
		}
	},
	template: `<link rel="stylesheet" type="text/css" @load="$emit('load')" :href="href"/>`
})

globalThis.Vue.component('op-navbar', {
	props: {
		'user': {
			default: function () { return window.sessionUser }
		},
		'path': {
			default: null
		},
		'pathURL': {
			default: null
		},
		'showContent': {
			default: true
		},
		'section': {
			default: '' //selected section. Can be ['discover','learn','teach','profile']
		},
	},
	computed: {
		'myAvatar': function () {
			return (typeof this.user.avatar == 'string') ? JSON.parse(this.user.avatar) : this.user.avatar;
		},
	},
	data: function () {
		return {
			'isMobile': window.outerWidth < 767,
			'logoURL': (typeof OP_ENVIRONMENT != 'undefined' && OP_ENVIRONMENT == 'localhost') ? '/assets/img/logo/logo_nav_dev@2x.png' : '/assets/img/logo/logo_36x30_color@2x.png'
		}
	},
	methods: {
		goToProfile: function () {
			window.location.href = '/';
		}
	},
	template: `
	<div id="navbar" class="navbar navbar-fixed-top blurBackground dark" role="navigation" v-cloak>
		<div class="container-fluid iconsRow">
			<div id="websiteControls">
				<a href="/" class="OPlogo" id="OPlogoColor">
					<img :src="logoURL">
				</a>

				<div id="navPath" v-if="path"><li>{{path}}</li></div>
				<h1 v-else class="bariol" v-show="showContent"><a href="/">OpenProcessing</a></h1>
				<slot name="filters"></slot>
			</div>

			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<div class="caret"></div>
				<ul class="navbar-nav mr-auto" v-show="showContent">
					<li class="nav-item visible-xs">
						<a class="btn btn-primary" href="/sketch/create">{{$t('navigation.createSketch')}}</a>
					</li>
					<li :class="{'nav-item profileContainer visible-xs pointer':1, 'active': section=='profile'}" @click="goToProfile">
						<op-user :userid="user.userID" :avatar="user.avatar"></op-user>
						<span>&nbsp; {{$t('navigation.myProfile')}}</span>
					</li>
					<li :class="{'nav-item hidden-xs':1, 'active': section=='search'}">
						<searchbox :placeholder="$t('navigation.search')"></searchbox>
					</li>
					<li :class="{'nav-item visible-xs':1, 'active': section=='search'}">
						<a class="nav-link" href="/browse/">{{$t('navigation.search')}}</a>
					</li>
					<li :class="{'nav-item':1, 'active': section=='discover'}">
						<a class="nav-link" href="/discover/">{{$t('navigation.discover')}}</a>
					</li>
					<li :class="{'nav-item':1, 'active': section=='learn'}">
						<a class="nav-link" href="/learn/">{{$t('navigation.learn')}}</a>
					</li>
					<li v-if="!+user.isRestricted" :class="{'nav-item':1, 'active': section=='teach'}">
						<a class="nav-link" href="/teach">{{$t('navigation.teach')}}</a>
					</li>
					<li v-if="" :class="{'nav-item profileContainer hidden-xs':1, 'active': section=='profile'}">
						<op-user :userid="user.userID" :avatar="user.avatar" :link="null" class="nav-link" name="navbar-profile-dropdown"></op-user>
						<op-navbar-dropdown-guest v-if="user.userID == 0"></op-navbar-dropdown-guest>
						<op-navbar-dropdown v-if="user.userID > 0" :user="user"></op-navbar-dropdown>
					</li>
					<li class="nav-item visible-xs" v-if="user.userID == 0">
						<a class="nav-link" href="/signin">{{$t('general.signin')}}</a>
					</li>
					<li class="nav-item visible-xs" v-if="user.userID > 0">
						<a class="nav-link" href="/home/signout">{{$t('general.signout')}}</a>
					</li>
				
					<li class="nav-item hidden-xs">
						<a class="btn btn-primary" href="/sketch/create">{{$t('navigation.createSketch')}}</a>
					</li>
				</ul>
			</div>
			<button type="button" class="icon icon_burger navbar-toggle collapsed visible-xs" data-toggle="collapse"
				data-target="#navbarSupportedContent" aria-expanded="false"></button>

		</div>
	</div>`
})
globalThis.Vue.component('op-navbar-dropdown-guest', {
	methods: {
		'hideSidePanel': function () {
			$('.metricGroup.selected .metric').click();
		}
	},
	template: `
	<tippy class="tippy" v-cloak to="navbar-profile-dropdown" interactive="true"
		placement='bottom' animation='fade' arrow=true size='large' theme='dark navbar-profile-dropdown' append_to="parent"
		delay="100" trigger="click" @show="hideSidePanel()">
		<div class="text-left content">
			<a class="btn btn-default" href="/join">{{$t('general.join') + ' OpenProcessing'}}</a>
			<hr class="grey" />
			<p>Already have an account?</p>
			<a href="/signin"><span class="icon icon_signin_small_white"></span>{{$t('general.signin')}}</a>
		</div>
		<div class="navbar-profile-dropdown-footer text-left">
			<a href="https://intercom.help/openprocessing"><span class="icon icon_question_small_white"></span>
			{{$t('navigation.FAQ')}}</a>
			<a href="mailto:info@openprocessing.org" class="pull-right"><span class="icon icon_email_white"></span>
			{{$t('navigation.contact')}}</a>
		</div>
	</tippy>`
});
globalThis.Vue.component('op-navbar-dropdown', {
	props: {
		'user': {},
	},
	methods: {
		'hideSidePanel': function () {
			$('.metricGroup.selected .metric').click();
		}
	},
	computed: {
		hasPrioritySupport: function () {
			return this.user.membershipType == 1 || this.user.membershipType == 2 || (this.user.membershipType == 3 && this.user.userType == 2);
		},
		totalNavItems: function () {
			//returns total number of items in navigation content arrays
			let total = 0;
			for (var arr in this.user.navigationContent) {
				total += this.user.navigationContent[arr].length;
			}
			return total;
		}
	},
	template: `
		<tippy v-if="+user.userID> 0" class="tippy" v-cloak to="navbar-profile-dropdown" interactive="true" placement='bottom' animation='fade' arrow=true touch=true size='large' theme='dark navbar-profile-dropdown' append_to="parent" trigger="click" delay="100" @show="hideSidePanel()">
			<div class="text-left content"  :lang="user.language">
				<p>
					<a :href="'/user/'+user.userID+'/?view=sketches'"><span class="icon icon_user_white pretext"></span>{{$t('navigation.viewMyProfile')}}</a>
				</p>
				<p v-if="user.membershipType == 0 && !+user.isRestricted">
					<a :href="'/membership/'"><span class="icon icon_plus_member_small_white pretext"></span>{{$t('general.joinPlus')}}</a>
				</p>
				<p v-else-if="+user.membershipType != 3 && !+user.isRestricted">
					<a :href = "'/membership/edit'"><span class="icon icon_plus_member_small_white pretext"></span>{{$t('navigation.editMyMembership')}}</a>
				</p>
				<hr class="grey" v-if="totalNavItems" />
				<div class="section" v-if="user.navigationContent.sketches.length">
					<h4 class="sectionTitle"><span class="icon icon_sketch_white pretext"></span><a :href="'/user/'+user.userID+'/?view=sketches'">{{$t('navigation.sketches')}}</a><a class="plus_icon" href="/sketch/create"><span class="icon icon_plus_circle_white pretext"></span></a></h4>
					<ul>
						<li v-for="(s,index) in user.navigationContent.sketches" v-if="index<5">
							<a :href="'/sketch/'+s.visualID"> {{s.title}}</a>
						</li>
						<li v-if="user.navigationContent.sketches.length>5">
							<small><a class="grey" :href="'/user/'+user.userID+'/?view=sketches'">{{$t('general.showAll')}}</a></small>
						</li>
					</ul>
				</div>
				<div class="section" v-if="user.navigationContent.classes.length">
					<h4 class="sectionTitle"><span class="icon icon_classroom_white pretext"></span><a :href="'/user/'+user.userID+'/?view=classes'">{{$t('navigation.classes')}}</a><a class="plus_icon" href="/class/create"><span class="icon icon_plus_circle_white pretext"></span></a></h4>
					<ul>
						<li v-for="(c,index) in user.navigationContent.classes" v-if="index<5">
							<a :href="'/class/'+ c.collectionID">{{c.title}}</a>
						</li>
						<li v-if="user.navigationContent.classes.length>5">
							<small><a class="grey" :href="'/user/'+user.userID+'/?view=classes'">{{$t('general.showAll')}}</a></small>
						</li>
					</ul>
				</div>
				<div class="section" v-if="user.navigationContent.curations.length">
					<h4 class="sectionTitle"><span class="icon icon_curation_white pretext"></span><a
							:href="'/user/'+user.userID+'/?view=curations'">{{$t('navigation.curations')}}</a><a class="plus_icon" href="/curation/create"><span class="icon icon_plus_circle_white pretext"></span></a></h4>
					<ul>
						<li v-for="(s,index) in user.navigationContent.curations" v-if="index<5">
							<a :href="'/curation/'+ s.curationID">
								{{s.title}}</a>
						</li>
						<li v-if="user.navigationContent.curations.length>5">
							<small><a class="grey" :href="'/user/'+user.userID+'/?view=curations'">{{$t('general.showAll')}}</a></small>
						</li>
					</ul>
				</div>
			</div>
			<div class="navbar-profile-dropdown-footer text-left">
				<a href="/home/signout"><span class="icon icon_signout_small_white pretext"></span>{{$t('general.signout')}}</a>
				<a href="https://intercom.help/openprocessing"><span
						class="icon icon_question_small_white"></span>
				{{$t('navigation.FAQ')}}</a>
				<a v-if="!hasPrioritySupport"
					href="mailto:info@openprocessing.org" class="pull-right"><span class="icon icon_email_white"></span> {{$t('navigation.contact')}}</a>
				<a v-if="hasPrioritySupport"
					href="mailto:info@openprocessing.org?subject=[Priority]" class="pull-right intercomLink"><span
						class="icon icon_intercom_white"></span> {{$t('navigation.support')}}</a>
			</div>
		</tippy>`
})
globalThis.Vue.component('op-join', {
	props: {
		'mode': {
			default: 'join' // can be 'join','signin', 'existing', 'auto'
		},
		'collection': null,
		'title': {
			default: false //used if collection not provided
		},
		'description': {
			default: false //used if collection not provided
		},
		'callback': {
			type: [Function, Boolean],
			default: false
		},
		'captchaKey': '',
		'privateCode': false,
		'canClose': false,
		'forceUsername': false
	},
	data: function () {
		return {
			'user': {
				username: '',
				fullname: '',
				email: '',
				password: '',
				rememberMe: 0,
				restricted: this.restricted
			},
			'errorMessage': false,
			'myMode': this.mode,
			'sessionUser': null //set on beforeMount if exists
		}
	},
	watch: {
		'mode': function (val) {
			this.updateMyMode(val);
		},
		'myMode': function (val) {
			let self = this;
			//reset 
			this.errorMessage = '';
			this.user.username = '';
			this.user.email = '';
			this.user.password = '';
			globalThis.Vue.nextTick(function () {
				self.setupSubmit();
				if (val == 'join') {
					try {
						grecaptcha.render('grecaptcha');
					} catch (error) {
						//likely it is already rendered.
					}
				}
			})
		}
	},
	computed: {
		'restricted': function () { return +(this.collection && +this.collection.isRestricted) },
		'computedTitle': function () {
			let toContinue = OPHELPERS.getURLParameters().has('prevUrl');
			if (this.title) {
				return this.title;
			} else {
				switch (this.myMode) {
					case 'join':
						return toContinue ? 'Join OpenProcessing to continue' : 'Join Creative Coders on OpenProcessing';
					case 'signin':
						return toContinue ? 'Sign in to continue' : 'Sign in';
					case 'existing':
						return 'Choose an account to continue';
					default:
						break;
				}
			}

		},
		'collectionSubheader': function () {
			switch (this.myMode) {
				case 'join':
					return 'Create an account to join';
					break;
				case 'signin':
					return 'Sign in to join';
					break;
				case 'existing':
					return 'Choose an account to join';
					break;

				default:
					break;
			}
		},
		'buttonLabel': function () {
			switch (this.myMode) {
				case 'join':
					return 'Join';
				case 'signin':
					return 'Sign in';
				case 'existing':
					return 'Continue as ' + this.sessionUser.fullname;
				default:
					break;
			}
		},
		'formURL': function () {
			switch (this.myMode) {
				case 'join':
					return this.collection ? `/home/joinSubmit_ajax/${this.privateCode}` : '/home/joinSubmit_ajax';
				case 'signin':
					return this.collection ? `/home/signinSubmit_ajax/${this.privateCode}` : '/home/signinSubmit_ajax';
				case 'existing':
					//submit to the void if not joining a class. It is a non-use-case.
					return this.collection ? `/class/${this.collection.collectionID}/join_ajax` : '/';
				default:
					break;
			}
		}
	},
	methods: {
		'updateMyMode': function (val) {
			if (val == 'existing' || (val == 'auto' && +sessionUser.userID > 0)) {
				this.sessionUser = window.sessionUser;
				this.myMode = 'existing';
			} else if (val == 'auto') {
				this.myMode = 'signin';
			} else {
				this.myMode = val; //signin or join
			}
		},
		'loadCaptcha': function () {
			OP.loadCaptcha();
		},
		'setupSubmit': function () {

			let $submitButton = $(this.$el).find('.submitButton');
			let self = this;
			var options = {
				dataType: 'json',
				beforeSubmit: function () {
					self.errorMessage = false;
					$submitButton.button('loading').addClass('loading');
				},
				submit: function () {
					return false
				},
				success: function (response) {
					if (response.success === true) {

						$('html').removeClass('guest');
						$submitButton.removeClass('loading').addClass('btn-success').button('success');
						OP.syncObject(response.object, sessionUser);
						self.$nextTick(function () {
							if (typeof self.callback == 'function') {
								AUTH.hideJoinModal();
								AUTH.setupNavForSignedinUser();
								window.setTimeout(self.callback, 400);
							} else {
								if (sessionUser.prevUrl && sessionUser.prevUrl != null) {
									location.href = sessionUser.prevUrl;
								} else {
									location.href = '/user/' + response.object.userID;
								}
							}
						});
					}
				},
				error: function (response) {
					if (response.status == 200) {
						//all okay actually, just redirect to home.
						//happens when user is already logged in, and click continue
						location.href = '/';
						return;
					}

					$submitButton.removeClass('loading').addClass('btn-error');
					self.errorMessage = OPHELPERS.getResponseMessage(response);
				},
				complete: function (response) {
					if (!$submitButton.hasClass('btn-success')) {
						$submitButton.button('reset').removeClass('loading btn-error');
					}
					window.setTimeout(function () {
						$submitButton.removeClass('btn-success btn-error loading').button('reset');
					}, 2000);
				}

			};
			$(this.$el).ajaxForm(options);
		}
	},
	beforeMount: function () {
		this.updateMyMode(this.mode);
	},
	mounted: function () {
		// clog(this.collection.isRestricted);
		this.setupSubmit();
		let $el = $(this.$el);
		$el.show();
		window.setTimeout(function () {
			$el.addClass('in');
			$el.find('input[name="fullname"], input[name="username"]').focus(); //only one or the other is visible at a time
		}, 200);
		this.loadCaptcha();
	},
	template: `
		<form id="joinForm" :action="formURL" method="POST">
			<div v-if="+canClose" class="icon icon_close visible-xs"></div>
			<div v-if="collection">
				<h3 class="bariol" v-text="collectionSubheader"></h3>
				<h1 class="bariol">{{collection.title}}</h1>
				<p id="teacherList">by <strong>{{ collection.teacherNames}}</strong></p>
			</div>
			<div v-else>
				<h1 class="bariol">{{computedTitle}}</h1>
				<p class="description" v-if="description" v-html="description"></p>
			</div>
			<div v-if="myMode == 'join'">
				Already have an account?
				<a href="javascript:;" @click="myMode='signin'">Sign in.</a>
				<p>&nbsp;</p>

			</div>
			<div v-if="myMode == 'signin'">
				Don't have an account yet?
				<a href="javascript:;" @click="myMode='join'">Join OpenProcessing</a>
				<p>&nbsp;</p>

			</div>
			<input type="hidden" :value="restricted" name="restricted"></input>  
			<div v-if="myMode == 'existing'" class="userCard">
				<input type="hidden" name="privateCode" :value="this.privateCode"/>
				<op-user-li :userid="sessionUser.userID" :avatar="sessionUser.avatar"></op-user-li>
				<div>
					<span class="grey">Currently signed in as</span><br/>
					<strong>{{sessionUser.fullname}}</strong>
				</div>
			</div>
			<div v-else>
				<op-input v-if="myMode == 'join' && restricted" label="Username" description="Do not use your real name" max=35 min=2 autocomplete="username" name="username" v-model="user.username" required></op-input>
				
				<op-input v-if="myMode == 'join' && !restricted" label="Name" max=42 min=2 autocomplete="name" name="fullname" v-model="user.fullname" required></op-input>
				
				<op-input v-if="myMode == 'signin'" label="Email or Username" max=60 min=2 autocomplete="username" name="username" v-model="user.username" required></op-input>
				
				<op-input v-if="myMode == 'join' &&  !restricted" type="email" label="Email" max=60 min=4 autocomplete="email" name="email" v-model="user.email" required></op-input>
				
				<div class="relative">
					<op-input label="Password" type="text" :password-hidden="true" max=64 min=2 :autocomplete="mode == 'join'? 'new-password':'password'" name="password" v-model="user.password" required :show-counter="false" ></op-input>
					<div v-if="myMode !== 'join' && !restricted" class="recoverLink">
						<a href="/home/recover" target="_blank" class="text-right small">forgot?</a>
					</div>
				</div>
				
				<op-toggle id="rememberMeContainer" label="Stay Signed In" v-model="user.rememberMe" name="remember"></op-toggle>

				<div v-if="myMode == 'join'" id="captchaContainer">
					<div  id="grecaptcha" class="g-recaptcha" :data-sitekey="captchaKey" data-size="normal" style="transform:scale(1.18);-webkit-transform:scale(1.18);transform-origin:0 0;-webkit-transform-origin:0 0; margin-bottom:15px"></div>
				</div>
				
				<p class="small" v-if="myMode == 'join'">
					<br /> By clicking Join, you agree to the
					<a href="/home/tos/" target="_blank">Terms of Service</a>.
				</p>
			</div>
				
			<div class="buttons">
				<div v-if="errorMessage" id="joinModal_errorMessage" class="errorMessage">{{errorMessage}}</div>
				<p><button id="joinModal_submitButton" type="submit"  class="btn btn-primary submitButton">{{buttonLabel}}</button></p>
				<p v-if="myMode == 'existing'" class="text-center"><a href="javascript:;" @click="myMode='signin'">Sign in with another account</a></p>
			</div>

		</form>`
})
globalThis.Vue.component('op-clipboard', {
	props: {
		'content': {
			default: ''
		},
		'disabled': {
			default: false
		},
		'copy-label': {
			default: null,
			type: [String, Function, Element, null]
		}
	},
	data: function () {
		return {
			'justCopied': false,
			'myLabel': this.copyLabel
		}
	},
	name: 'OPclipboard',
	computed: {},
	watch: {
		'content': function () {
			this.flashText();
		}
	},
	methods: {
		'copyToClipboard': function () {
			let copyContent = $(this.$el).find('.copyContent');
			let $temp = $("<input type='text'></input>");

			$(this.$el).append($temp);
			$temp.val(copyContent.text()).select();
			document.execCommand("copy");
			$temp.remove();
			//flash text
			this.justCopied = true;
			this.updateLabel();
			this.flashText();
			return false;
		},
		'flashText': function () {
			let self = this;
			let copyLink = $(this.$el).find('.copyLink');
			let copyContent = $(this.$el).find('.copyContent');

			copyLink.text(copyContent.text());
			copyContent.addClass('flash');
			window.setTimeout(function () {
				copyContent.removeClass('flash');
			}, 100);
			window.setTimeout(function () {
				self.justCopied = false;
			}, 3000);
		},
		'updateLabel': function () {
			if (this.copyLabel == null) return;
			if (typeof this.copyLabel == "function") {
				this.myLabel = $(this.copyLabel());
			} else {
				this.myLabel = $(this.copyLabel);
			}
			let lbl = this.myLabel;
			let prevContent = lbl.html();
			lbl.text(this.$t('general.copiedToClipboard'));
			window.setTimeout(function () {
				lbl.html(prevContent);
			}, 3000);
		}
	},
	template: `<div class="OPclipboard">
					<div :class="{'relative':true, 'justCopied': justCopied, 'disabled': disabled}">
						<pre class="copyContent"><slot></slot></pre>
						<a href="javascript:;" @click="copyToClipboard" class="icon icon_duplicate_small_white"></a>
					</div>
				</div>`
})
globalThis.Vue.component('op-toggle', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {},
		'label': {},
		'disabled': {
			default: false
		},
		'value': {},
		'dchecked': {},
		'dunchecked': {},
		'description': {},
		'name': {
			default: false
		},
		'tabindex': {
			default: null
		}
	},
	name: 'OPtoggle',
	computed: {
		myID: function () {
			return this.inputID ?? 'op-toggle-' + Math.random();
		},
		myDescription: function () {
			return this.description ?? (this.value ? this.dchecked : this.dunchecked)
		}
	},
	template: `<div class="formItem OPtoggleContainer"> 
						<div class="formTop">
							<label :for = "myID" :class="{'disabled': disabled == true }" > {{label}} </label> 
							<input :disabled="disabled == true" :id = "myID" :name = "name?name: myID"
								:class = "'OPtoggle ' + inputClass"
								type = "checkbox"
								:checked = "+value"
								:tabindex = "tabindex"
								@change = "$emit('change', $event.target.checked)"
								@input = "$emit('input', $event.target.checked)"
								/>
						</div>
						<div class="description" v-if="myDescription" v-html="myDescription"></div>
						<slot></slot>
					</div>`
})
globalThis.Vue.component('op-palette', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {},
		'label': {},
		'disabled': {
			default: false
		},
		'value': {
			type: Array,
			default: []
		},
		'options': {
			type: Array,
			default: []
		},
		'description': {},
		'name': {
			default: false
		}
	},
	data: function () {
		return {
			'index': -1,
			'myKey': this.value.join('')
		}
	},

	methods: {
		'changePalette': function () {
			let self = this;
			//check if string versions match (cause objects won't be equal)
			if (this.index == -1 && (this.value.join('') == this.options[0].join(''))) {
				//skip 0
				this.index = 1 % this.options.length;

			} else {
				this.index = (this.index + 1) % this.options.length;
			}
			this.myValue = this.options[this.index];
			this.$nextTick(function () {
				self.myKey = self.value.join('');
			})
		}
	},
	name: 'OPpalette',
	computed: {
		'myValue': {
			get() { return this.value },
			set(val) {
				this.$emit('change', this.label, val);
			}
		},
		myID: function () {
			return this.inputID === false ? 'op-palette-' + Math.random() : this.inputID;
		},
	},
	template: `<div class="formItem"> 
					<div class="formTop">
						<label> {{label}} 
						</label> 
						<div @click="changePalette" class="OPpalette pointer" :key="myKey">
							<div v-for="c in myValue" :key="c" class="OPpaletteColor" :style="'background-color:'+ c"></div>
						</div>
					</div>
					<div class="description" v-if="description" v-html="description"></div>
				</div>`
})
globalThis.Vue.component('op-color', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {},
		'label': {},
		'disabled': {
			default: false
		},
		'value': {},
		'description': {},
		'name': {
			default: false
		}
	},
	name: 'OPcolor',
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-color-' + Math.random() : this.inputID;
		}
	},
	template: `<div><div class="formItem"> 
						<div class="formTop">
							<label :for = "myID" > {{label}} 
								<div class="OPcolorHandle" :style="'background-color:'+ value" ></div>
							</label> 
							<input :disabled="disabled == true" :id = "myID" :name = "name?name: myID"
								:class = "'OPcolor ' + inputClass"
								type = "color"
								v-bind:value="value"
								v-on:input="$emit('input', $event.target.value)"
								v-on:change="$emit('change', $event.target.value)"
								/>
						</div>
						<div class="description" v-if="description" v-html="description"></div>
					</div></div>`
})
globalThis.Vue.component('op-action', {
	props: {
		'inputID': Number,
		'icon': String,
		'label': String,
		'description': String,
		'action': {
			type: [Function, Boolean],
			default: false
		},
		'iconPosition': {
			//puts the icon left or right side of the label
			type: String,
			default: 'left'
		},
		'href': String,
		'newWindow': {
			type: Boolean,
			default: false
		}
	},
	name: 'op-action',
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-action-' + Math.random() : this.inputID;
		},
		myAction: function () {
			let self = this;
			return (self.action) ? self.action : function () {
				if (self.newWindow) {
					window.open(
						self.href,
						'_blank'
					);
				} else {
					window.location.href = self.href
				}
			};
		}
	},
	template: `<div class="OPaction">
					<div class="formItem"> 
						<div>
							<label :for = "myID" @click="myAction" :class="iconPosition"><span :class="'icon pretext ' + icon"></span> {{label}} </label>
						</div>
						<div class="description text-left" v-html="description"></div>
					</div>
				</div>`
})
globalThis.Vue.component('op-slider', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'label': {
			default: ''
		},
		'name': {
			default: false
		},
		'value': {
			default: ''
		},
		'max': {
			default: 100
		},
		'min': {
			default: 0
		},
		'step': {
			default: 1
		},
		'description': {
			default: ''
		},
		'showValue': {
			default: false
		}
	},
	name: 'op-slider',
	data: function () {
		return {
			'randomKey': Math.random()
		}
	},
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-slider-' + Math.random() : this.inputID;
		},
		inputValue: {
			get() {
				return this.value;
			},
			set(val) {
				val = this.validateValue(val);
				this.$emit('input', val);
			}
		}
	},
	methods: {
		validateValue: function (val) {
			let pval = val;
			//validate first
			// let val = +$event.target.value;
			if (isNaN(val)) { //if not a number
				val = this.value; //reset it back
			}
			val = val % this.step ? val - (val % this.step) : val;
			val = val < this.min ? this.min : val;
			val = val > this.max ? this.max : val;
			if (val != pval) {
				this.$nextTick(() => {
					// refresh key to force update input
					this.randomKey = Math.random();
				});
			}
			return val;
		}
	},
	template: `<div class="formItem OPsliderContainer"> 
					<div class="labelContainer formTop">
						<label :for = "myID"> {{label}} </label> 
						<div class="text-right flex">
							<input v-if="showValue" :key="randomKey" :class="'OPsliderText '+inputClass" type="number" :max="max"
							:min="min" :step="step" 
							:value="inputValue"
							@change="inputValue = $event.target.value"
							>
							<input :id = "myID"
								:class = "'OPslider ' + inputClass"
								:name = "name? name: myID"
								type = "range"
								:max="max"
								:min="min"
								:step="step"
								v-model="inputValue"
								/>
							
						</div>
					</div>
					<div class="description text-right" v-html="description"></div>
				</div>
				`
})
globalThis.Vue.component('op-datepicker', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'label': {
			default: ''
		},
		'name': {
			default: false
		},
		'value': {
			default: null
		},
		'description': {
			default: ''
		},
		'required': {
			default: false
		}
	},
	name: 'op-datepicker',
	data: function () {
		return {
		}
	},
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-input-' + Math.random() : this.inputID;
		}
	},
	methods: {
		showDatePicker: function () {

		},
		hideDatePicker: function () {

		}
	},
	beforeMount: function () {

	},
	template: `<div class="formItem"> 
					<div class="labelContainer">
						<label :for = "myID" class="anchoredBottom"> {{label}} </label> 
						<input v-model="c.deadlineString" @blur="hideDatePicker" @click="showDatePicker" type="text" readonly="readonly" />
						<div class="datePickerContainer"></div>
						</div>
					<div class="description text-right" v-html="description" :counter="counter"></div>
				</div>
				`
})
globalThis.Vue.component('op-input', {
	props: {
		'input-id': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'label': {
			default: ''
		},
		'name': {
			default: false
		},
		'type': {
			default: 'text'
		},
		'value': {
			default: ''
		},
		'max': {
			default: 10000
		},
		'min': {
			default: 0
		},
		'lpignore': {
			default: true
		},
		'description': {
			default: ''
		},
		'classes': {
			default: ''
		},
		'required': {
			default: false
		},
		'autocomplete': {
			default: false
		},
		'placeholder': {
			default: false
		},
		'disabled': {
			default: false
		}, 'tabindex': {
			default: null
		},
		'passwordHidden': null, //true or false enables it.
		'showCounter': true
	},
	name: 'op-input',
	data: function () {
		return {
			charLength: false,
			myPasswordHidden: this.passwordHidden
		}
	},
	watch: {
		'passwordHidden': function (val) {
			this.myPasswordHidden = this.passwordHidden;
		}
	},
	computed: {
		myClasses: function () {
			return this.classes + ' formItem' + (this.disabled ? ' disabled' : '');
		},
		myType: function () {
			switch (this.myPasswordHidden) {
				case true:
					return 'password';
					break;
				case 'true':
					return 'password';
					break;
				case false:
					return 'text';
					break;
				case 'false':
					return 'text';
					break;
				default:
					return this.type;
					break;
			}
		},
		myID: function () {
			return this.inputId === false ? 'op-input-' + Math.random() : this.inputId;
		},
		counter: function () {
			if (this.max - this.charLength < 15) {
				return ` ${this.charLength}/${this.max} `;
			} else {
				return false;
			}
		}
	},
	methods: {
		checkCharLimit: function (e) {
			if (e && e.target) {
				this.charLength = e.target.value.length;
			}
		}
	},
	template: `<div :class="myClasses"> 
					<div class="labelContainer">
						<label :for = "myID" class="anchoredBottom"> {{label}} </label> 
						<input :id = "myID"
							:class = "'OPinput ' + (passwordHidden != null ? 'hasPasswordToggle ':'') + inputClass"
							:name = "name? name: myID"
							:type = "myType"
							:maxlength="max"
							:minlength="min"
							:required="required"
							:placeholder="placeholder? placeholder: null"
							:disabled="disabled"
							:autocomplete="autocomplete"
							:tabindex="tabindex"
							v-bind:value="value"
							v-on:input="$emit('input', $event.target.value)"
							@keyup = "checkCharLimit($event)"
							@change = "checkCharLimit($event)"
							/>
							<div v-if="myPasswordHidden != null" :class="{'icon passwordHiddenToggle pointer':1, 'icon_visible': myPasswordHidden, 'icon_hidden': !myPasswordHidden}" @click="myPasswordHidden = !myPasswordHidden"></div>
						</div>
					<div class="description text-right" v-html="description" :counter="showCounter? counter: false"></div>
				</div>
				`
})
globalThis.Vue.component('op-number', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'label': {
			default: ''
		},
		'name': {
			default: false
		},
		'type': {
			default: 'number'
		},
		'value': {
			default: 0
		},
		'max': {
			default: null
		},
		'min': {
			default: null
		},
		'description': {
			default: ''
		},
		'required': {
			default: false
		},
		'placeholder': {
			default: false
		},
		'disabled': {
			default: false
		}
	},
	name: 'op-number',
	data: function () {
		return {
			charLength: false
		}
	},
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-input-' + Math.random() : this.inputID;
		}
	},
	methods: {
	},
	beforeMount: function () {

	},
	template: `<div class="formItem"> 
					<div class="labelContainer">
						<label :for = "myID" class="anchoredBottom"> {{label}} </label> 
						<input :id = "myID"
							:class = "'OPinput ' + inputClass"
							:name = "name? name: myID"
							type = "number"
							:max="max ? max: null"
							:min="min ? min: null"
							:required="required"
							:disabled="disabled"
							:placeholder="placeholder? placeholder: null"
							v-bind:value="value"
							v-on:input="$emit('input', $event.target.value)"
							/>
						</div>
					<div class="description text-right" v-html="description"></div>
				</div>
				`
})
globalThis.Vue.component('op-text', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'label': {
			default: ''
		},
		'name': {
			default: false
		},
		'max': {
			default: 10000
		},
		'min': {
			default: 0
		},
		'value': {
			default: ''
		},
		'placeholder': {
			default: null
		},
		'description': {
			default: ''
		},
		'disabled': {
			default: false
		}
	},
	name: 'op-text',
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-text-' + Math.random() : this.inputID;
		}
	},
	template: `<div class="OPtext formItem"> 
					<div class="formTop">
						<label :for = "myID"> {{label}} </label> 
						<input :id = "myID"
							:class = "'OPtext ' + inputClass"
							:name = "name? name: myID"
							type = "text.OPC"
							:maxlength="max"
							:minlength="min"
							:placeholder="placeholder"
							:disabled="disabled"
							v-bind:value="value"
							v-on:input="$emit('input', $event.target.value)"
							v-on:change="$emit('change', $event.target.value)"
							/>
						</div>
					<div class="description text-right" v-html="description"></div>
				</div>
				`
})
globalThis.Vue.component('op-select', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'label': {
			default: false
		},
		'options': {
			default: {}
		},
		'value': '' //used by v-model
		,
		'selected': {
			default: 0 //index of default selected item
		},
		'name': {
			default: false
		},
		'description': {
			default: ''
		},
		'disabled': {
			type: Array,
			default: function () { return [] }
		}
	},
	name: 'op-select',
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-select-' + Math.random() : this.inputID;
		}
	},
	beforeMount: function () {

	},
	template: `<div class="formItem"> 
					<div class="labelContainer">
						<label v-if="label" class="anchoredBottom"> {{label}} </label> 
						<select 
							:class = "'OPselect ' + inputClass"
							:name = "name? name: myID" type="radio"
							:id="myID"
							:value="value"
							@change="$emit('input', $event.target.value)">
							<option disabled value="">Select one</option>
							<option v-for="option in options" :value="option"
								:disabled="disabled.includes(option)">
								{{ option }}
							</option>
						</select>
					</div>
					<div class="description text-right" v-html="description"></div>
				</div>
				`
})
globalThis.Vue.component('op-radio', {
	props: {
		'inputID': {
			default: false
		},
		'inputClass': {
			default: ''
		},
		'classes': {
			default: ''
		},
		'label': {
			default: false
		},
		'options': {
			default: {}
		},
		'value': '' //used by v-model
		,
		'selected': {
			default: 0 //index of default selected item
		},
		'name': {
			default: false
		},
		'saving': {
			type: Boolean,
			default: false
		},
		'description': {
			default: ''
		},
		'disabled': {
			type: [Array, Boolean],
			default: function () { return [] }
		}
	},
	name: 'op-radio',
	computed: {
		myID: function () {
			return this.inputID === false ? 'op-radio-' + Math.random() : this.inputID;
		}
	},
	beforeMount: function () {

	},
	template: `<div class="formItem OPradio"> 
					<div class="labelContainer">
						<label v-if="label" :class="{'disabled':disabled===true}"> {{label}} </label>
					</div>
					<div v-show="saving" class="icon icon_loader_sm_dark pretext"></div>
					<div class="btn-group">
						<label v-for="(val, key) in options" :key="val" :class="{'btn':1 , 'btn-primary':1 , 'active': val == value, 'disabled': (disabled===true || (Array.isArray(disabled) && disabled.includes(val)))}">
							<input :class = "'OPinput ' + inputClass" 
							:name = "name? name: myID" type="radio" 
							:id="myID + '-' +key" 
							:value="val" 
							:checked="val == value" 
							:disabled="(disabled===true || (Array.isArray(disabled) && disabled.includes(val)))"
							@change="$emit('input', val)"
							data-lpignore="true">
							{{key}}
						</label> 
					</div>
					<div class="description" v-html="description"></div>
				</div>
				`
})

globalThis.Vue.component('op-textarea', {
	props: {
		'label': {
			default: false
		},
		'value': {
			default: ''
		},
		'name': {
			default: false
		},
		'min': {
			default: 0
		},
		'max': {
			default: 10000
		},
		'description': {
			default: ''
		},
		'inputID': {
			default: false
		},
		'resizable': {
			default: false
		},
		'required': {
			default: false
		},
		'autoresize': {
			default: false
		},
		'allowNewLines': {
			default: true
		},
		'placeholder': {
			default: ''
		},
		'disabled': {
			default: false
		},
		'tabindex': {
			default: null
		},
		'inputClass': {
			default: ''
		}
	},
	name: 'op-textarea',
	mounted() {
		this.textarea = this.$el.getElementsByTagName('textarea')[0];
		this.sizer = this.$el.getElementsByClassName('textareaSizer')[0];
		this.$nextTick(function () {
			// Code that will run only after the
			// entire view has been re-rendered
			this.updateSize();
		})
	},
	data: function () {
		return {
			charLength: false
		}
	},
	computed: {
		myClass: function () {
			return this.inputClass + ' OPInput ' + (this.resizable ? ' resizable' : '') + (this.autoresize ? ' autoresize' : '')
		},
		myID: function () {
			return this.inputID === false ? 'op-textarea-' + Math.random() : this.inputID;
		},
		counter: function () {
			if (this.max - this.charLength < 15) {
				return ` ${this.charLength}/${this.max} `;
			} else {
				return false;
			}
		}
	},
	methods: {
		checkKey: function (e) {
			if (!this.allowNewLines && e.keyCode == 13) { //prevent default behavior
				e.preventDefault();
				return false;
			}

		},
		updateSize: function (e) {
			if (this.autoresize) {
				let val = this.textarea.value;
				//remove any new lines
				if (!this.allowNewLines) {
					val = val.replace(/\n/g, "");
				}
				this.sizer.textContent = val;
				this.textarea.value = val;
				// textarea.height(sizer.text(val).outerHeight());
			}
			this.checkCharLimit(e);

		},
		checkCharLimit: function (e) {
			if (e && e.target) {
				this.charLength = e.target.value.length;
			}
		},
		onInput: function(val){
			this.value = val;
			this.$emit('input', val);
		}
	},
	template: `<div class="formItem OPtextareaContainer"> 
					<div class="labelContainer">
						<label v-if="label" :for = "myID" class="anchoredTop"> {{label}} </label> 
						<div class="relative">
							<pre v-if="autoresize" class="textareaSizer"></pre>
							<textarea :id = "myID" :name = "name? name: myID"
								:placeholder = "placeholder"
								:class = "myClass"
								:maxlength="max" :required="required"
								:disabled="disabled" 
								:value="value"
								v-on:input="onInput($event.target.value)"
								@keydown="checkKey($event)"
								@keyup="updateSize($event)"
								@change="updateSize($event)"
								:tabindex="tabindex"
								></textarea>
						</div>
					</div>
					<div class="description text-right" v-html="description" :counter="counter"></div>
				</div>
				`
})
globalThis.Vue.component('op-list-toggle', {
	props: {
		'enabled': { type: Boolean, default: false },
		'user': { type: Boolean, default: false },
	},
	computed: {
		myIcon: function () {
			return this.enabled ? this.gridIcon : this.listIcon;
		},
		'listIcon': function () { return this.user ? 'icon_list_user_small' : 'icon_list_small' },
		'gridIcon': function () { return this.user ? 'icon_grid_user_small' : 'icon_grid_small' },
	},
	name: 'op-list-toggle',
	'template': `
		<span :class="'listToggle icon '+ myIcon" @click="$emit('click')"></span>
	`

});
globalThis.Vue.component('op-userlist', {
	props: {
		'list': {
			type: Array,
			required: true
		},
		'limit': {
			default: false
		},
		'invite_label': {
			default: 'Invite Students'
		},
		'join_label': {
			default: 'Join Class'
		},
		'invite': {
			type: [Function, Boolean],
			default: false
		},
		'join': {
			type: [Function, Boolean],
			default: false
		},
		'remove': {
			type: [Function, Boolean],
			default: false
		},
		'listView': {
			type: Boolean,
			default: false
		},
		'sortBy': {
			type: [String, null],
			default: null
		}
	},
	data: function () {
		return {
			myLimit: +this.limit
		}
	}

	,
	name: 'op-userlist',
	beforeMount() {
		this.myLimit = +this.limit;
	},
	methods: {
		sortMethod: function (a, b) {
			if (this.sortBy == null) {
				return 0;
			}
			if (typeof a[this.sortBy] == 'string' && typeof b[this.sortBy] == 'string') {
				return a[this.sortBy].localeCompare(b[this.sortBy]);
			} else {
				return a[this.sortBy] - b[this.sortBy];
			}
		}
	},
	computed: {
		'listLimited': function () {
			//remember to slice() the list so we don't modify the state, otherwise infinite render loop
			return this.myLimit > 0 ? this.list.slice(0, this.myLimit).sort(this.sortMethod) : this.list.slice().sort(this.sortMethod);
		},
		'seeMoreNumber': function () {
			return this.list.length - this.listLimited.length;
		}
	},
	watch: {
		'listView': function (val) {
			this.$nextTick(() => {
				this.listLimited.forEach(u => {
					// console.log(this.$refs['user' + u.userID][0]);
					if (this.$refs['user' + u.userID]) {
						this.$refs['user' + u.userID][0].positionLabel();
					}
				});
			});
		}
	},
	template: `
	<ul :class="{userList:1, noMembers: list.length == 0, listView: listView}">
		<li v-if="invite" class="userLi inviteMemberContainer" @click="invite">
			<a class="userThumbContainer" href="javascript:;">
				<div class="thumbContainer">
					<img class="userThumb" src="/assets/img/icons/icon_plus_red@2x.png" style="width: 15px; height: 15px"/> 
					</div>
			</a>
			<a class="userLabel" href="javascript:;" v-html="invite_label">
			</a>
		</li>
		<li v-if="join" class="userLi joinButtonContainer">
			<a id="joinButton" class="btn btn-primary" href="javascript:;" @click="join">{{join_label}}
			</a>
		</li>
		<op-user-li v-for="u in listLimited" :ref="'user'+u.userID" :class="{bounceIn: u.justJoined, bounceOut: u.justLeft}" :key="u.userID" :userid="u.userID" :fullname="u.fullname" :avatar="u.avatar?u.avatar : false" :plus="+u.membershipType > 0" :remove="remove" :removed="u.removed"></op-user-li>

		<li v-if="seeMoreNumber>0" class="seeMore userLi" :data-seemore="'+'+seeMoreNumber" @click="myLimit += 100"><img src="/assets/img/blank.png" class="ratioKeeper"></li>
	</ul>`
})
globalThis.Vue.component('op-avatar', {
	name: 'op-avatar',
	props: {
		'avatarOptions': {},
		'width': {},
		'height': {}
	},
	computed: {
		'thumbURL': function () {
			let options = typeof this.avatarOptions == 'string' ? JSON.parse(this.avatarOptions) : this.avatarOptions;
			let uri = 'https://avataaars.io/?avatarStyle=Transparent&';
			uri += $.param(options);
			/* for (const key in options) {
				if (Object.hasOwnProperty.call(options, key)) {
					uri += key+'='+options[key]+'&';
				}
			} */
			return uri;
		}
	},
	template: `
		<img :src="thumbURL" class="userThumb avatar" :width="width" :height="height"/>
	`
})
globalThis.Vue.component('op-user', {
	props: {
		'userid': {
			required: true
		},
		'fullname': {
			default: false
		},
		'plus': {
			default: false
		},
		'avatar': {
			default: false
		},
		'link': { //makes it a link to user profile page
			type: [String, Boolean],
			default: true
		},
	},
	name: 'op-user',
	computed: {
		'myAvatar': function () {
			return typeof this.avatar == 'string' ? JSON.parse(this.avatar) : this.avatar;
		},
		'profileURL': function () {
			if (typeof this.link == 'string') {
				return this.link;
			} else {
				return this.userid > 0 && this.link ? '/user/' + this.userid : 'javascript:;';
			}
		},
		'thumbURL': function () {
			return '/user/' + this.userid + '/thumbnail';
		},
		'firstName': function () {
			let splits = this.fullname ? this.fullname.split(' ') : [''];
			return splits[0];
		},
		'lastName': function () {
			let splits = this.fullname ? this.fullname.split(' ') : [''];
			return splits.length > 1 ? splits[1] : '';
		}
	},
	template: `
		<a class="userThumbContainer" :href="profileURL">
			<div v-if="fullname" class="userLabel">
				<span>{{firstName}}</span> 
				<span>{{lastName}}</span>
			</div>
			<div class="thumbContainer">
				<op-avatar class="userThumb" v-if="myAvatar" :avatar-options="myAvatar" :width="100" :height="100" />
				<img v-else :src="thumbURL" class="userThumb"/>
				<div v-if="plus" class="userThumbPlus"></div>
			</div>
		</a>
	`
})
globalThis.Vue.component('op-user-li', {
	props: {
		'userid': {
			required: true
		},
		'fullname': {
			default: false
		},
		'plus': {
			default: false
		},
		'avatar': {
			default: false
		},
		'removable': {
			default: false
		},
		'remove': {
			type: [Function, Boolean],
			default: false
		},
		'removed': {
			type: Boolean,
			default: false
		},
		'link': { //makes it a link to user profile page
			type: [String, Boolean],
			default: true
		},
	},
	data: function () {
		return {
			'labelLeft': false
		}
	},
	name: 'op-user-li',
	mounted: function () {
		this.positionLabel();
		//set up window resize listener
		window.addEventListener('resize', this.positionLabel);
	},
	methods: {
		positionLabel: function (listView) {
			if (listView) {
				this.labelLeft = false;
				return;
			}
			if (this.fullname) {
				let p = this.$el.parentNode;
				let label = this.$el.querySelector('.userLabel');
				// console.log(label, this.isOutside(p, label));
				if (this.isOutside(p, label)) {
					this.labelLeft = !this.labelLeft;
				}
			}
		},
		isOutside: function (parent, child) {
			var box1coords = parent.getBoundingClientRect();
			var box2coords = child.getBoundingClientRect();

			if (
				box2coords.top < box1coords.top ||
				box2coords.right > box1coords.right ||
				box2coords.bottom > box1coords.bottom ||
				box2coords.left < box1coords.left) {

				return true;
			}

			return false;

		}
	},
	computed: {
		'myAvatar': function () {
			return typeof this.avatar == 'string' ? JSON.parse(this.avatar) : this.avatar;
		},
		'profileURL': function () {
			return this.userid > 0 ? '/user/' + this.userid : 'javascript:;';
		},
		'thumbURL': function () {
			return this.userid < 0 ? '/assets/img/blank.png' : '/user/' + this.userid + '/thumbnail'; //this is used for placeholder users in various places, such as archived classes with 0 users.
		},
		'firstName': function () {
			let splits = this.fullname ? this.fullname.split(' ') : [''];
			return splits[0];
		},
		'lastName': function () {
			let splits = this.fullname ? this.fullname.split(' ') : [''];
			return splits.length > 1 ? splits[1] : '';
		}
	},
	template: `
	<li :class="{'userLi':true,'removed':removed, 'empty': userid<0}">
		<a class="userThumbContainer" :href="+link? profileURL: 'javascript:;'">
			<div class="thumbContainer">
				<op-avatar class="userThumb" v-if="myAvatar" :avatar-options="myAvatar" width="100" height="100" />
				<img v-else :src="thumbURL" class="userThumb" width="100%" height="100%"/>
				<div v-if="plus && !remove" class="userThumbPlus"></div>
			</div>
			<a v-if="remove && userid > 0" class="removeIcon icon icon_x_circle_dark" href="#" @click="remove(userid)"></a>
		</a>
		<a v-if="fullname" :class="{'userLabel':1, labelLeft}" :href="+link? profileURL: 'javascript:;'">
					<span>{{firstName}}</span>
					<span>{{lastName}}</span>
			</a>
	</li>`
})
globalThis.Vue.component('op-user-lg', {
	props: {
		'userid': {
			required: true
		},
		'plus': {
			default: false
		},
		'avatar': {
			default: false
		},
		'owner': {
			default: false
		},
		'forceCache': {
			default: false
		},
		'plusTippyText': {
			default: null
		}
	},
	name: 'op-user-lg',
	computed: {
		'myAvatar': function () {
			return (typeof this.avatar == 'string') ? JSON.parse(this.avatar) : this.avatar;
		},
		'profileURL': function () {
			return +this.userid > 0 ? '/user/' + this.userid : 'javascript:;';
		},
		'thumbURL': function () {
			return this.profileURL + '/thumbnail' + (this.forceCache ? '/false/true' : '');
		},
	},
	beforeMount: function () {
		this.plusLink = this.owner ? '/membership/edit' : +this.plus == 1 ? '/membership/' : '/teach/';
		this.plusText = this.plusTippyText;
		if (this.plusText == null) { //if empty, calculate
			if (this.owner) {
				switch (+this.plus) {
					case 1:
						this.plusLink = '/membership/edit'
						this.plusText = 'You are a Plus+ Member.';
						break;

					case 2:
						this.plusLink = '/membership/edit';
						this.plusText = 'You are a Professor Plus+ Member.';
						break;

					case 3:
						this.plusLink = null;
						this.plusText = 'You are a Plus+ Member through your school.';
						break;

					default:
						break;
				}
			} else {
				switch (+this.plus) {
					case 1:
						this.plusText = 'Plus+ Member';
						break;

					case 2:
						this.plusText = 'Professor Plus+ Member';
						break;

					case 3:
						this.plusText = 'Plus+ Member';
						break;

					default:
						break;
				}
			}
		}
	},
	template: `
			<a :href="profileURL"  class="userThumbContainer">
				<div class="thumbContainer">
					<op-avatar v-if="myAvatar" class="userThumb" :avatar-options="myAvatar" :width="200" :height="200" />
					<img v-else :src="thumbURL" class="userThumb"/>
					<a :href="plusLink" v-if="+plus" class="plusBadge" :content="plusText" v-tippy="{'arrow':'true','animation':'fade'}"></a>
				</div>
			</a>`
})

globalThis.Vue.component('searchbox', {
	props: ['id', 'placeholder', 'url'],
	name: 'searchbox',
	data: function () {
		return {
			value: '',
			expanded: false,
			submitting: false,
			controller: null
		}
	},
	methods: {
		search: function (input) {
			this.controller && this.controller.abort();
			this.controller = new AbortController();
			this.value = input;
			let url = `/api/search_smart?q=${encodeURI(input)}`;
			let self = this;
			return new Promise(resolve => {
				if (input.length < 3) {
					return resolve([])
				}
				if (axios) {
					//cancel previous request
					self.request = axios.get(url, {
						signal: self.controller.signal
					})
						.then(response => {
							response.data ? resolve(response.data) : resolve([]);
						})
						.catch(error => {
							if (error.code !== "ERR_CANCELED"){
								OP.logError(error);
							}
							resolve([]);
						});
				}
			});
		},
		getResultValue(result) {
			return result.title
		},
		handleSubmit(result) {
			if (this.submitting) { //prevent searchbox submitting multiple requests
				return;
			}
			this.submitting = true;
			// return;
			if (typeof result !== 'undefined') {
				// this.value = result;
				//if result is an result object
				switch (result.type) {
					case 'user':
						location.href = `/user/${result.resultID}`;
						break;
					case 'sketch':
						location.href = `/sketch/${result.resultID}`;
						break;
					case 'curation':
						location.href = `/curation/${result.resultID}`;
						break;
					case 'classroom':
						location.href = `/class/${result.resultID}`;
						break;

					default:
						break;
				}

			} else {
				//if result is pressing enter without selecting a result
				let str = $(this.$el).find('input').val();
				this.str = result;
				location.href = `/browse/?time=anytime&type=all&q=${encodeURI(str)}`;
			}
		},
		expand: function () {
			this.expanded = true;
		},
		collapse: function () {
			if (this.value.length == 0) {
				this.expanded = false;

			}
		},
		getResultClass: function (result) {
			let cl = "icon pretext ";
			switch (result.type) {
				case 'user':
					cl += 'icon_user_small';
					break;
				case 'sketch':
					cl += 'icon_sketch';
					break;
				case 'curation':
					cl += 'icon_curation';
					break;
				case 'classroom':
					cl += 'icon_classroom';
					break;

				default:
					break;
			}
			return cl;
		}
	},
	template: `<autocomplete :search="search" 
		placeholder="Search"
		:id = "id"
		:debounce-time="500"
		@submit="handleSubmit"
		:submit-on-enter="true"
		@keyup="e => {if (e.keyCode === 13) handleSubmit()}"
		:get-result-value="getResultValue"
		:class = "'searchbox ' + (expanded?'expanded':'')"
		@focus = "expand"
		@blur = "collapse"
		>
			<template #result="{ result, props }">
				<li	v-bind="props" class="autocomplete-result user-result">
					<span :class="getResultClass(result)"></span> {{ result.title }} <span class="grey" v-if="result.tagline">{{ result.type == "user"? '@':'' }}{{ result.tagline }}</span>
				</li>
			</template>
		</autocomplete>`
})

globalThis.Vue.component('sketch-private_url', {
	props: {
		'visualid': {
			required: true
		},
		'label': {
			default: 'Private URL'
		},
		'member': {
			required: true
		},
		'disabled': {
			default: false
		},
		'value': {
			default: false
		}
	},
	data: function () {
		return {
			'loading': false
		}
	},
	name: 'sketch-private_url',
	methods: {
		getLabelElement: function () {
			if (this.$el) {
				return this.$el.getElementsByClassName('myLabel')[0];
			} else {
				return null;
			}
		},
		createURL: function () {
			let self = this;
			self.loading = true;
			$.getJSON('/sketch/' + this.visualid + '/updatePrivateCode_ajax')
				.done(function (res) {
					window.setTimeout(function () {
						//update parent
						self.$emit('input', res.object);
					}, 1500) //give it some artificial delay to improve cognition.
				})
				.fail(function (response) {
					OP.showMessageModal(response.statusText);
				})
				.always(function () {
					window.setTimeout(function () {
						self.loading = false
					}, 1500)
				})
		}
	},
	computed: {
		'code': function () {
			return this.value;
		},
		'privateURL': function () {
			return 'oppr.org/s/' + (this.code ? this.code : 'XXXXXXXX');
		}
	},
	template: `
	<div :class="{'OPclipboardContainer':true, 'loading': loading}">
		<div class="labels">
			<label class="defaultCursor"><span class="icon icon_link_white pretext"></span><span class="myLabel">{{label}}</span></label>
			<div v-if="member && visualid > 0" v-show="!loading && !code" class=" text-right"><a href="javascript:;"
					@click="createURL">{{$t('sketch.privateURL-create')}}<span class="icon icon_refresh_small_red"></span></a></div>
			<div v-if="member && visualid > 0" v-show="!loading && code" class="text-right"><a href="javascript:;"
					@click="createURL"><span class="icon icon_refresh_small_red"></span></a></div>
			<div v-if="member && visualid > 0" v-show="loading" class=" text-right"><span
					class="icon icon_loader"></span></div>
		</div>
		<op-clipboard :disabled="disabled || !code || loading || visualid<1" :copy-label="getLabelElement">{{privateURL}}</op-clipboard>
		<div v-if="!member" class="description  text-right" v-html="$t('sketch.privateURL-joinPlus')"></div>
	</div>`
})
globalThis.Vue.component('sketch', {
	props: {
		'sketch': {
			type: Object,
			required: true
		},
		'userLink': { //makes username a link to user profile page
			default: false
		},
		'showLabel': {
			default: true
		}
	},
	data: function () {
		return {
			'imageLoaded': false,
			'hasImage': true,
		}
	},
	name: 'sketch',
	computed: {
		sketchURL: function () {
			return `/sketch/${this.sketch.visualID}`;
		},
		thumbURL: function () {
			if (!this.hasImage || (+this.sketch.active < 1)) {
				return '/assets/img/blank.png';
			}
			return OP.getSketchThumbURL(this.sketch);
		},
		userURL: function () {
			return `/user/${this.sketch.userID}`;
		}
	},
	template: `
	<div class="sketch">
		<a class="sketchThumbContainer" :href="sketchURL">
			<div class="sketchThumbOverflow"><img :src="thumbURL" @load='imageLoaded = true' @error='hasImage = false' :class="{ 'sketchThumb': true, 'imageLoading': !this.imageLoaded }">
			</div>
			<div class="sketchLabel" v-if="sketch.title && showLabel">
				<div class="sketchHeader">
					<span class="sketchTitle">{{sketch.title}}</span>
					<span v-if="sketch.fullname && userLink">$t('general.by') <a :href="userURL">{{sketch.fullname}}</a></span>
					<span v-if="sketch.fullname && !userLink">$t('general.by') {{sketch.fullname}}</span>
				</div>
			</div>
		</a>
	</div>`
});


globalThis.Vue.component('sketch-li', {
	props: {
		sketch: {
			type: Object
		},
		gram: {
			type: Boolean
		},
		observer: {
			default: null
		},
		actions: {
			type: Array,
			default: function () { return [] }
		}
	},
	data: function () {
		return {
			// 'sketch': this.sketch,
			// 'list': this.list,
			// 'inView': true, //this is disabled due  to  performance
			'imageLoaded': false,
			'hasImage': true,
			'showActions': false,
			'outOfViewport': false,
			'vueTippyOptions': {
				'theme': 'sketchActionsTooltip',
				'placement': 'top',
				'animation': 'fade',
				'delay': 200,
				arrow: true
			}

		}
	},
	name: 'sketch-li',
	methods: {
		getLocaleDateString: OPHELPERS.getLocaleDateString,
		hasActions: function (s) {
			return this.actions.length > 0;
		},
		toggleActions: function (s) {
			this.showActions = !this.showActions;
		},
		pinSketch: function () {
			let self = this;
			let s = this.sketch;
			s.prevPinState = s.pinnedOn;
			s.pinnedOn = this.isPinned ? null : new Date();
			self.$emit('sort');
			//update db
			$.getJSON('/sketch/' + s.visualID + '/pin_ajax/' + this.isPinned)
				.fail(
					function (response) {
						var message = (response.responseJSON) ? response.responseJSON.message : 'Problem while pinning the sketch.';
						OP.showMessageModal(message);
						s.pinnedOn = s.prevPinState;
						self.$emit('sort');
					})
		},
		deleteSketch: function () {
			this.$emit('delete', this.sketch);
		},
		approve: function () {
			this.$emit('approve', this.sketch);
		},
		move: function () {
			this.$emit('move', this.sketch, $(this.$el).find('.moveButton').get(0));
		},
		remove: function () {
			this.$emit('remove', this.sketch);
		},
		exit: function () {
			this.showActions = false;
		}
	},
	mounted() {
		try { //sometimes $el is not type of Element. not sure why.
			this.observer.observe(this.$el);
		} catch (e) {
			//ignore
		}

	},
	beforeMount() {
		this.sketch.pinnedOn = OPHELPERS.getLocaleDate(this.sketch.pinnedOn);
		let nv = this.sketch.numberOfViews;
		this.sketch.numberOfViews = nv >= 10000 ? Math.round(nv / 1000) + 'k' : nv;
	},
	computed: {
		sketchURL: function () {
			if (this.isSelectable) {
				return 'javascript:;'
			}
			if (this.sketch.approveTo && +this.sketch.status == 2 && this.actions.indexOf('approve') != -1) {
				return `/sketch/${this.sketch.visualID}/?approveTo=${this.sketch.approveTo}`;
			}
			return '/sketch/' + this.sketch.visualID;
		},
		isSelectable() {
			return this.$listeners && this.$listeners.select
		},
		isPinned: function () {
			return this.sketch.pinnedOn ? true : false;
		},
		thumbURL: function () {
			if (!this.hasImage || (+this.sketch.active < 1)) {
				return '/assets/img/blank.png';
			}
			return OP.getSketchThumbURL(this.sketch);
		},
		attrLabel: function () {
			let attrText = [];
			if (+this.sketch.status == 2) { //if waiting for approval, only show that data 
				attrText.push('Waiting Approval');
			} else {
				if (+this.sketch.isLate) attrText.push('Late');
				if (+this.sketch.isExample) attrText.push('Example');
				if (+this.sketch.isDraft) attrText.push('Draft');
				if (+this.sketch.isPjs == 0) attrText.push('Archived');
				if (+this.sketch.isPrivate == 1) attrText.push('Private');
				if (+this.sketch.isPrivate == 2) attrText.push('Class only');
				if (+this.sketch.isPrivate == 3) attrText.push('Teachers only');
				if (+this.sketch.parentID) attrText.push('Fork');
				if (+this.sketch.isTutorial) attrText.push('Tutorial');
			}
			if (attrText.length === 0) {
				return '';
			} else if (attrText.length > 1) {
				//shorten words
				attrText = $.map(attrText, function (f) {
					return f == "Late" ? f : f.substring(0, 2);
				});
			}
			return attrText.join('/');
		},

	},
	template: `<li :class="{'sketchLi': true, 'loading': sketch.loading,'pinned': isPinned, 'gram': gram, 'inactive': +sketch.active < 1}" @mouseleave="exit" @click="$emit('select')">
				<div :class="{'outOfViewport': outOfViewport && !gram}"></div>
				<div v-if="!outOfViewport || gram">
					<a class="sketchThumbContainer" :href="sketchURL">
						<div class="sketchThumbOverflow"><img :src="thumbURL" @load='imageLoaded = true' @error='hasImage = false' :class="{ 'sketchThumb': true, 'imageLoading': !this.imageLoaded }">
						<div class="attrLabel">{{attrLabel}}</div>
						</div>
						<div class="sketchLabel">
							<div class="sketchHeader">
								<span class="sketchTitle">{{sketch.title}}</span>
								<span v-if="sketch.fullname">by {{sketch.fullname}}</span>
							</div>
							<div class="sketchMeta">
								<span class="views">{{sketch.numberOfViews}}</span><span class="hearts">{{sketch.numberOfHearts}}</span><span class="comments">{{sketch.numberOfComments}}</span><span v-if="isPinned" class="pinned">Pinned</span>
							</div>
							
						</div>
					</a>
					<div v-if="hasActions()" :class="{'sketchActions':true, 'show': hasActions(), 'showAll':showActions}">
						<div class="viewActionsButton" @click="toggleActions"></div>

						<div v-if="actions.indexOf('approve')!=-1 && +sketch.status == 2" v-cloak v-tippy content="Approve Sketch"  class="approveButton" @click="approve"></div>

						<div v-if="actions.indexOf('submittedOn')!=-1" v-cloak  v-tippy :content="'Submitted on ' + getLocaleDateString(sketch.submittedOn)"  class="dateButton"></div>

						<div v-if="actions.indexOf('move')!=-1" v-cloak @click="move" class="moveButton"></div>

						<div v-if="actions.indexOf('pin')!=-1" v-cloak @click="pinSketch"  v-tippy :content="isPinned ? 'Unpin' : 'Pin to Top'"  class="pinButton"></div>

						<div v-if="actions.indexOf('delete')!=-1" v-cloak @click="deleteSketch" v-tippy content="Delete Sketch" class="removeButton"></div>
						<div v-if="actions.indexOf('remove')!=-1" v-cloak @click="remove" v-tippy content="Remove Sketch" class="removeButton"></div>
					</div>
				</div>
			</li>`
})
globalThis.Vue.component('sketchlist', {
	name: 'sketchlist',
	props: {
		list: {
			default: null,
			required: false
		},
		noSketchText: {
			type: String,
			default: 'No sketches found.'
		},
		gramLimit: {
			// define how many sketches will be displayed with gram view
			type: Number,
			default: 0
		},
		gramClass: {
			type: String,
			default: 'gram'
		},
		'loadUrl': {
			//an ajax call URL that accepts ../limit/offset for retrieval of objects
			type: [String, Boolean],
			default: false
		},
		'active': {
			//enables/disables scroll events etc.
			type: Boolean,
			default: true
		},
		'name': {
			type: [String, Boolean],
			default: false
		},
		'limit': {
			type: Number,
			default: 60
		},
		'total': {
			default: null
		},
		'offset': {
			//starting offset to load
			type: Number,
			default: 0
		},
		'max': {
			//max number of sketches to displayed
			type: Number,
			default: null
		},
		'listView': {
			type: Boolean,
			default: false
		},
		'sketchClass': {
			type: String,
			default: ''
		},
		'showPromo': {
			type: Boolean,
			default: false
		},
		'observeThumbnails': {
			type: Boolean,
			default: true
		}
	},
	data: function () {
		return {
			myList: [],
			loading: false,
			hasMore: true,
			firstLoadCompleted: false,
			observer: null
		}
	},
	beforeMount() {
		let self = this;
		if (this.list) { //if list is already provided, mark loaded.
			this.myList = this.list;
			this.firstLoadCompleted = true;
			this.loading = false;
			this.hasMore = this.list.length < this.total; //removes More button
		}
		if (!!window.IntersectionObserver && this.observeThumbnails) {
			let callback = (entries, observer) => {
				entries.forEach(entry => {
					if (!!entry.target.__vue__) {
						entry.target.__vue__.outOfViewport = !entry.isIntersecting;
					}
				});
			};
			this.observer = new IntersectionObserver(callback, {
				rootMargin: '1000px 0px 6000px 0px',
				threshold: 0
			});
		}
		//enforce max
		if (this.max) {
			self.myList = self.myList.slice(0, this.max);
		}
		if (this.myList.length == 0 && this.loadUrl) {
			//create list by loading
			this.loadMore();
		}
		if (this.max && (+this.myList.length >= +this.max)) {
			this.hasMore = false;
		}
	},
	methods: {
		enableForeverScroll: function () {
			//enable forever scroll
			var offsetToReload = 300;
			let self = this;
			let button = this.$el.getElementsByClassName('seeMoreButton')[0];
			$(document).on('scroll.sketchListForeverScroll' + self.name, function () {
				if (!self.loading && self.hasMore) {
					// console.log('foreverScroll', this);
					let rect = button.getBoundingClientRect();
					let closeToEnd = rect.bottom - offsetToReload <= (window.innerHeight || document.documentElement.clientHeight);
					if (closeToEnd) {
						self.loadMore();
					}
				}

			});
		},
		disableForeverScroll: function () {
			$(document).off('scroll.sketchListForeverScroll' + this.name);
		},
		loadMore: function (offset = false) {
			let self = this;
			let limit = self.limit;
			if (offset) { //if starting offset is provided, load all those first
				limit = offset;
			}
			let $btn = $(self.$el).find('.seeMoreButton').addClass('loading');

			self.loading = true;
			$.getJSON(self.loadUrl + limit + '/' + self.loaded)
				.done(function (response) {
					//array version is used in API
					let sketches = Array.isArray(response) ? response : response.object;
					//if number of sketches are less than expected, then there is no more

					sketches.forEach((s) => {
						s.pinnedOn = OPHELPERS.getLocaleDate(s.pinnedOn);
						s.loading = false;
						self.myList.push(s);
					});
					if (sketches.length < limit) {
						//disable forever scroll
						self.disableForeverScroll();
						self.hasMore = false;
					}
					//enforce max
					if (self.max) {
						self.myList = self.myList.slice(0, self.max);
						if (self.max <= self.myList.length) {
							self.disableForeverScroll();
							self.hasMore = false;
						}
					}

				})
				.always(function () {
					self.firstLoadCompleted = true;
					$btn.removeClass('loading');
					self.loading = false;
					self.$emit('load');
				})
		},
		sort: function () {
			this.myList.sort(function (a, b) {
				if (a.pinnedOn && b.pinnedOn) { //first order pinned ones at the top.
					return b.pinnedOn - a.pinnedOn;
				} else if (a.pinnedOn && !b.pinnedOn) { //first order pinned ones at the top.
					return -1;
				} else if (!a.pinnedOn && b.pinnedOn) { //first order pinned ones at the top.
					return 1;
				} else {
					return +a.visualID < +b.visualID ? 1 : -1
				}
			});
		},
		deleteSketch: function (s) {
			let self = this;
			let deleteModal = OP.setupModal('#deleteSketchModal', {
				'ajaxURL': '/sketch/' + s.visualID + '/delete_ajax',
				'ajaxDone': function (response) {
					var message = response.message;
					const index = self.myList.indexOf(s);
					if (index > -1) {
						// self.myList.splice(index, 1);
						globalThis.Vue.delete(self.myList, index);
					}
					deleteModal.modal('hide');
				},
				'ajaxFail': function (response) {
					let message = OPHELPERS.getResponseMessage(response);
					deleteModal.modal('hide');
					OP.showMessageModal(message);
				},
				'ajaxAlways': function (response) {
					deleteModal.find('.btn-primary').button('reset');
				}
			});
			deleteModal.modal('show');
		}
	},
	watch: {
		'list': function (val) {
			this.myList = val;
		},
		'offset': function (val) {
			if (val > 0) {
				this.loadMore(val);
			}
		},
		'loaded': function (val) {
			if (this.name) {
				OPHELPERS.updateURLParameter('o', this.loaded);
			}
		},
		'active': function (val) {
			if (val) {
				if (this.showPromo) {
					this.$nextTick(() => {
						let promo = $(this.$el).find('.promo');
						$('#sketchesContainer .sketchList li:nth-child(12)').after(promo);
						promo.removeClass('hide');
					})

				}
				if (this.loadUrl) {
					this.enableForeverScroll();
				}
			} else {
				this.disableForeverScroll();
			}
		}
	},
	computed: {
		select() { return this.$listeners && this.$listeners.select ? 'select' : null },
		loaded() { return this.myList && this.myList.length }
	},
	template: `<ul :class="{'listView': this.listView, 'sketchList showMeta': 1}">
					<div v-if="myList.length == 0 && !loading && firstLoadCompleted" v-html="noSketchText">
					</div>
					<div v-if="this.showPromo" class="promo row clearDiv hide">
						<div class="col-xs-4">
							<h1 class="playfair">Create. Code. <br/>Share. Loop.</h1>
						</div>
						<div class="col-xs-8 list">
							<p class="col-xs-8 clearDiv">
								Join Plus+ to unlock all features and <br/> support OpenProcessing for $39.99/year.

							</p>
							<div class="col-xs-4">
								<span class="icon icon_checkmark_green pretext"></span>
									Private Sketches
								<br/><span class="icon icon_checkmark_green pretext"></span>
									Private Short URLs
								
							</div>
							<div class="col-xs-4">
								<span class="icon icon_checkmark_green pretext"></span>
									Customized Embeds
								<br/><span class="icon icon_checkmark_green pretext"></span>
									1 GB File Space
								
							</div>
							<div class="col-xs-4">
								<a href="/membership/#pricing" class="btn btn-primary">Subscribe</a>
							</div>
						</div>
					</div>
					<div v-if="this.active">
						<sketch-li v-for="(s,i) in myList" :class="i<gramLimit? gramClass: sketchClass" :key="s.visualID"  :sketch="s" :gram="i<gramLimit"
						:observer="observer"
						:actions="s.actions"
						@sort="sort"
						@delete="deleteSketch"
						@[select]="$emit('select', s)"
						@remove="$emit('remove', s)"
						@approve="$emit('approve', s)"></sketch-li>
					</div>
					<div class="clearDiv">
						<button v-if="loadUrl && hasMore && firstLoadCompleted"  class="seeMoreButton btn btn-default" @click="loadMore()">See More</button>
					</div>
				</ul>`
})

globalThis.Vue.component('op-crayon', {
	props: ['crayon', 'image'],
	computed: {
		'thumbURL': function () {
			if (this.image) {
				return this.image;
			} else {
				return OP_ENVIRONMENT == 'localhost' ? `https://openprocessing-usercontent-test.s3.amazonaws.com/crayon/crayons/crayonThumbnail${this.crayon.crayonID}@2x.png` : `https://openprocessing-usercontent.s3.amazonaws.com/crayon/crayons/crayonThumbnail${this.crayon.crayonID}@2x.png`;
			}
		},
		'editionsAvailable': function () {
			return Math.max(0, this.crayon.editionsAvailable);
		}
	},
	methods: {
		'goToCrayon': function () {
			window.location.href = `/crayon/${this.crayon.crayonID}`;
		}
	},
	template: `
	<li class="crayonContainerLarge row">
		<div class="col-xs-12 col-sm-12 col-md-3">
			<div class="header">
				<div class="counter pointer text-right hidden-md ">{{crayon.counterID}}</div>
				<div class="headerMeta inlineBlock">
					<h3 class="playfair pointer" @click="goToCrayon">{{crayon.title}}</h3>
					<p>{{crayon.editionsMax}} Editions<br/>{{editionsAvailable}} Available</p>
				</div>
			</div>
			<div class="row">
				<div class="col-xs-12 col-xl-9">
					<p class="crayonDescription">{{crayon.description}}</p>
				</div>
			</div>
			<p v-if="!!crayon.isSoldOut">
				All editions are minted. See <a :href="'https://opensea.io/collection/crayon-codes-v1?search[query]='+crayon.title" target="_blank">OpenSea</a> for secondary sales.
			</p>
		</div>
		<div class="crayonImageContainer pointer col-xs-12 col-md-9 col-xl-8" @click="goToCrayon"><img class="crayonImage" :src="thumbURL"/></div>
	</li>`
});
globalThis.Vue.component('op-tag', {
	name: 'op-tag',
	props: ['tag'],
	computed: {
		'tagURL': function () {
			return `/browse/?time=anytime&type=tags&q=${this.tag}`
		}
	},
	template: `<a class="black OPtag" :href="tagURL">{{this.tag}}</a>`
});
globalThis.Vue.component('op-button', {
	name: 'op-button',
	props: {
		'buttonClass': {},
		'theme': {
			default: 'primary'
		},
		'extra': {
			type: Object, //a dictionary of functions
			default: { 'Secondary': function () { } }
		}
	},
	data: function () {
		return {
			showExtra: false
		}
	},
	methods: {
		clickExtra: function (k) {
			this.extra[k]();
			this.showExtra = false;
		},
		onBlur: function (e) {
			//if element is not a child element of the button, then hide extra
			if (!$(e.relatedTarget).closest('.OPbutton').length) {
				this.showExtra = false;
				return true;
			} else {
				return false;
			}
		}
	},
	computed: {
		myButtonClass: function () {
			return this.buttonClass ? this.buttonClass : 'btn btn-' + this.theme;
		},
		caretClass: function () {
			return 'caretButton ' + this.theme;
		}
	},
	template: `
	<div :class="{ 'OPbutton':1, [theme]:1}"  tabindex=1 @blur="onBlur($event)">
		<button :class="buttonClass" @click="$emit('click')"><slot></slot></button>
		<div :class="caretClass" @click="showExtra = !showExtra"></div>
		<div v-if="showExtra" class="extra">
			<button v-for="(f, k) in extra" @click="clickExtra(k)">{{k}}</button>
		</div>
	</div>`
});