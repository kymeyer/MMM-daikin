/* global Module */

/* Magic Mirror
 * Module: MMM-Daikin
 *
 * By Kyrill Meyer
 * MIT Licensed.
 */
 
 Module.register('MMM-Daikin', {
	defaults: {
		ipAddress: '192.168.178.20', //default Adress
		updateInterval: 30 * 1000, // 1 minute
		animationSpeed: 1 * 1000, // 1 seconds
    renderouttemp: true, // whether to show outside-Temperature
	},

	requiresVersion: '2.1.0',

	start() {
		const self = this;

		self.loaded = false;
		self.stats = {};

		self.sendSocketNotification('START', self.config);
		Log.info('Starting module: ' + self.name);
	},

	getDom() {
		const self = this;

		if (self.error) {
			return self.renderError();
		}

		if (!self.loaded) {
			return self.renderLoading();
		}

		return self.renderStats();
	},

	renderError() {
		const self = this;

		let wrapper = document.createElement('div');
		wrapper.className = 'dimmed light small';
		wrapper.innerHTML = self.error;
		return wrapper;
	},

	renderLoading() {
		const self = this;

		let wrapper = document.createElement('div');
		wrapper.className = 'dimmed light small';
		wrapper.innerHTML = self.translate('LOADING');

		return wrapper;
	},

	renderStats() {
		const self = this;

		let wrapper = document.createElement('table');
		wrapper.className = 'small';
		wrapper.innerHTML = `
			<tr>
        ${self.renderName()}
        ${self.renderPower()}
        ${self.renderTemp()}
      </tr>
      <tr>
				${self.renderMode()}
        ${self.renderFan()}
        ${self.renderInTemp()}
        ${self.renderTargetTemp()}
				
			</tr>
		`;

		return wrapper;
	},

	renderName() {
		return `<td class="name">${this.stats.name}</td>`;
	},
  
  renderTemp() {
    const self = this;
		let outtempHtml = `
				<td class="bin title dimmed">
					<i class="fas fa-sign-out-alt"></i> ${this.stats.outtemp} °
				</td>
			`;
  if (self.config.renderouttemp) return outtempHtml;
  return;
	},
  
  renderPower() {
		const self = this;

		let statusHtml = `
				<td class="bin title dimmed">
					<i class="fas fa-toggle-off"></i> ${self.translate('OFF')}
				</td>
			`;
		if (self.stats.power) {
			statusHtml = `
				<td class="bin title bright">
					<i class="fas fa-toggle-on"></i> ${self.translate('ON')}
				</td>
			`;
		}


		return statusHtml;
	},
  
   renderMode() {
		const self = this;

		let modeHtml = "";
    switch (self.stats.mode) {
			case 0:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-font"></i> ${self.translate('AUTO')}
				</td>
        `;
				break;
      case 1:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-font"></i> ${self.translate('AUTO')} 
				</td>
        `;
				break;
      case 7:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-font"></i> ${self.translate('AUTO')}
				</td>
        `;
			break;
      case 2:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-tint"></i> ${self.translate('DEHUM')} 
				</td>
        `;
				break;
      case 3:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-asterisk"></i> ${self.translate('COOL')} 
				</td>
        `;
			break;
      case 4:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-sun-o"></i> ${self.translate('HEAT')} 
				</td>
        `;
			break;
      case 6:
				modeHtml = `
        <td class="bin title dimmed">
					<i class="fa fa-retweet"></i> ${self.translate('FAN')}
				</td>
        `;
			break;
		}          
		return modeHtml;
	},
  
  renderInTemp() {
    const self = this;
    
			let intempHtml = `
				<td class="bin title bright">
					<i class="fas fa-thermometer-half"></i> ${self.stats.intemp}°
				</td>
			`;

		return intempHtml;
  },
  
  renderTargetTemp() {
    const self = this;
    
      let targettempHtml ="";
      if (self.stats.mode != 6 && self.stats.mode != 2)
			targettempHtml = `
				<td class="bin title bright">
					<i class="fas fa-share-square"></i> ${self.stats.targettemp}°
				</td>
			`;

		return targettempHtml;
  },
  
  renderFan() {
    const self = this;
    
			let fanHtml = `
				<td class="bin title bright">
					<i class="fas fa-wind"></i> ${self.stats.fanrate}
				</td>
			`;

		return fanHtml;
  },


	socketNotificationReceived(notification, payload) {
		const self = this;

		switch (notification) {
			case 'STATS':
				self.loaded = true;
				self.stats = payload;
				break;
			case 'ERROR':
				self.error = payload;
				break;
		}

		this.updateDom(self.config.animationSpeed);
	},

	getScripts() {
		return [];
	},

	getTranslations() {
		return {
			en: 'translations/en.json',
			de: 'translations/de.json',
		};
	},
});
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 