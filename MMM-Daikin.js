/* global Module */

/* Magic Mirror
 * Module: MMM-Daikin
 *
 * By Kyrill Meyer
 * MIT Licensed.
 */
 
 Module.register('MMM-Daikin', {
	defaults: {
		devices: [
			{
				ipAddress: '192.168.178.20',
				renderouttemp: true,
                useGetToPost: false,
            },
		],
		updateInterval: 1 * 5 * 1000, // 1 minute
		animationSpeed: 1 * 1000, // 1 seconds
	},

	icons: {
        "status-off": "fa-toggle-off",
        "status-on": "fa-toggle-on",
        "mode-fan": "fa-retweet",
        "mode-heat": "fa-sun",
        "mode-cool": "fa-snowflake",
        "mode-auto": "fa-font",
        "mode-dehumidify": "fa-droplet-slash",
        "fan-speed": "fa-fan",
        "outdoor-temp": "fa-cloud-sun",
        "indoor-temp": "fa-thermometer-half",
        "target-temp": "fa-crosshairs",
		"dir-stopped": "fa-arrow-down-up-across-line",
		"dir-vertical": "fa-arrows-up-down",
		"dir-horizontal": "fa-arrows-left-right",
		"dir-both": "fa-arrows-up-down-left-right",
    },

	fanRateValue: {
        "A": "AUTO",
        "B": "FAN_SILENCE",
        "3": "FAN_LVL_1",
        "4": "FAN_LVL_2",
		"5": "FAN_LVL_3",
		"6": "FAN_LVL_4",
		"8": "FAN_LVL_5",
    },

	start() {
		Log.log(`Starting module: ${this.name}`);
		const self = this;

		self.loaded = false;
		self.sendSocketNotification('START', self.config);
		self.devices = {};

		self.config.devices.forEach((device, index) => {
			if (!device.ipAddress) {
				Log.error('MMM-Daikin: Missing device IP address in config found at index: ' + index);
				self.error = 'Missing device IP address in config';
			}
			if (!self.devices[device.ipAddress]) {
				self.devices[device.ipAddress] = { loaded: false, error: false, ipAddress: device.ipAddress, stats: {} };
			}	
		});

		self.getDaikinStats();

		setInterval(() => {
        	self.getDaikinStats();
        }, self.config.updateInterval);

		
    },
		
	getDaikinStats() {
		const self = this;
		for (let deviceId in self.devices) {
			if (self.devices[deviceId].loaded === false) {
				Log.log("MMM-Daikin: requesting stats for device: " + deviceId);
				self.sendSocketNotification('MMM_DAIKIN_GETSTATS', self.devices[deviceId]);
			}
		}
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
		for (let deviceId in self.devices) {
			if (self.devices[deviceId].loaded) {

				let firstRow = self.renderLoadedDeviceFirstRow(self.devices[deviceId]);
				wrapper.appendChild(firstRow);
				

				wrapper.appendChild(self.renderLoadedDeviceSecondRow(self.devices[deviceId]));
			}
			else {
				let waitingRow = self.renderWaitingForDevice(deviceId);
				wrapper.appendChild(waitingRow);
			}
		}

		return wrapper;
	},

	renderWaitingForDevice(deviceId) {
		const self = this;

		let wrapper = document.createElement('tr');
		wrapper.className = 'xsmall';
		wrapper.innerHTML = `
			<td class="loading xsmall">AC@${deviceId}</td>
			<td ></td>
			<td colspan="3" class="dimmed light xsmall">${this.translate("COLLECTING")}</td>
		`;
		return wrapper;

	},

	renderLoadedDeviceFirstRow(device) {
		const self = this;

		let wrapper = document.createElement('tr');
		wrapper.className = 'xsmall';
		wrapper.innerHTML = `
			<td class="name xsmall" rowspan="2">${device.stats.name}</td>
			<td></td>
			${self.renderPower(device.stats.power)}
			${self.renderItem("indoor-temp", `${device.stats.intemp}°`)}
			${self.renderItem("outdoor-temp", `${device.stats.outtemp}°`)}
		`;
		return wrapper;
	},

	renderLoadedDeviceSecondRow(device) {
		const self = this;

		let wrapper = document.createElement('tr');
		wrapper.className = 'xsmall noborder';
		wrapper.innerHTML = `
			
			${self.renderMode(device.stats.mode, device.stats.power)}
			${self.renderItem("fan-speed", self.translate(self.fanRateValue[device.stats.fanrate]), !device.stats.power)}
			${self.renderFanDir(device.stats.fandir, device.stats.power)}
			${self.renderItem("target-temp", `${device.stats.targettemp}°`, !device.stats.power)}
		`;
		return wrapper;
	},

	renderItem (iconToUse, value, dimmed) {
        return `
              <td class="bin title xsmall ${dimmed ? "dimmed" : "bright"}">
                  <i class="fas ${this.icons[iconToUse]}"></i> ${value}
              </td>
          `;
    },

	renderPower(power) {
		return power ? this.renderItem("status-on", this.translate("ON"), false) : this.renderItem("status-off", this.translate("OFF"), true);
	},

	renderMode(mode, power) {
		switch (mode) {
			case 0:
				return this.renderItem("mode-auto", this.translate("AUTO"), !power);
			case 1:
				return this.renderItem("mode-auto", this.translate("AUTO"), !power);
			case 7:
				return this.renderItem("mode-auto", this.translate("AUTO"), !power);
			case 2:
				return this.renderItem("mode-dehumidify", this.translate("DEHUM'"), !power);
			case 3:
				return this.renderItem("mode-cool", this.translate("COOL"), !power);
			case 4:
				return this.renderItem("mode-heat", this.translate("HEAT"), !power);
			case 6:
				return this.renderItem("mode-fan", this.translate("FAN"), !power);
		}
	},

	renderFanDir(fandir, power) {
		switch (fandir) {
			case 0:
				return this.renderItem("dir-stopped", this.translate("OFF"), !power);
			case 1:
				return this.renderItem("dir-vertical", "V", !power);
			case 2:
				return this.renderItem("dir-horizontal", "H", !power);
			case 3:
				return this.renderItem("dir-both", "H/V", !power);
		}
	},


	socketNotificationReceived(notification, payload) {

		self = this;
		switch (notification) {
			case 'MMM_DAIKIN_STATS':
				this.loaded = true;
				let deviceId = payload.ipAddress;
				self.devices[deviceId].stats = payload;
				self.devices[deviceId].error = false;
				self.devices[deviceId].loaded = true;
				break;
			case 'MMM_DAIKIN_ERROR':
				let deviceIdError = payload.ipAddress;
				self.devices[deviceIdError].error = true;
				self.devices[deviceIdError].stats = payload;
				break;
		}

		if (this.loaded) {
			this.updateDom(self.config.animationSpeed);
		}
	},

	getScripts() {
		return [];
	},

	getStyles: function() {
        return [ "MMM-Daikin.css" ];
    },

	getTranslations() {
		return {
			en: 'translations/en.json',
			de: 'translations/de.json',
		};
	},
});
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 