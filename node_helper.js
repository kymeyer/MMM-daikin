/* Magic Mirror
 * Node Helper: MMM-Daikin
 *
 * By Kyrill Meyer
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const DaikinAC = require('daikin-controller');

const REQUIRED_FIELDS = ['ipAddress'];
const DAIKIN_STATS = ['bin', 'name', 'batPct', 'cleanMissionStatus'];

module.exports = NodeHelper.create({
	start: function() {
		const self = this;

		self.started = false;
		self.config = [];
		self.stats = {};
    console.log ("MMM-Daikin NodeHelper created...");
    
	},

	socketNotificationReceived: function(notification, payload) {
		const self = this;
    //console.log ("MMM-Daikin socketNotificationReceived");
    
		switch (notification) {
			case 'START':
				self.handleStartNotification(payload);
		}
	},

	handleStartNotification: function(payload) {
		const self = this;
    console.log ("MMM-Daikin handleStartNotification");

	//	if (self.started) {
	//		return;
	//	}

		self.config = payload;
    self.started = true;
    
    self.updateStats();

    
    },
    
    updateStats: function() {
		const self = this;
    
    var options = {'logger': console.log}; // optional logger method to get debug logging
    
    var daikin =  new DaikinAC.DaikinAC(
     self.config.ipAddress,
     options,
     function(err_gen) {
    // daikin.currentCommonBasicInfo - contains automatically requested basic device data
    // daikin.currentACModelInfo - contains automatically requested device model data
    if (err_gen) {
        //console.error(err_gen);
        //self.sendSocketNotification('ERROR', err_gen);
        //err_gen = null;
        self.scheduleUpdate();
    }
    else {
        //console.log("BASIC: "+JSON.stringify(daikin.currentCommonBasicInfo));
        self.started = true;
        daikin.setUpdate(self.config.updateInterval, function(err) {
            // catch error
            if (err) {
              //console.error(err);
              //self.sendSocketNotification('ERROR', err);
              daikin.stopUpdate();
              self.scheduleUpdate();
            }
            else {
              console.log(JSON.stringify(daikin.currentACControlInfo));
              console.log(JSON.stringify(daikin.currentACSensorInfo));
              Object.assign(self.stats, {
				        name: daikin.currentCommonBasicInfo.name,
                power: daikin.currentACControlInfo.power,
                mode: daikin.currentACControlInfo.mode,
                intemp: daikin.currentACSensorInfo.indoorTemperature,
                outtemp: daikin.currentACSensorInfo.outdoorTemperature,  
                targettemp: daikin.currentACControlInfo.targetTemperature,
                fanrate: daikin.currentACControlInfo.fanRate,
			       });
             //console.log("MMM-DAIKIN: Sending STATS...");
             self.sendSocketNotification('STATS', self.stats);
            }        
        });
    }
    });
	}, 
  
  scheduleUpdate() {
		const self = this;
    setTimeout(function(){ self.updateStats(); }, self.config.updateInterval);
	},

});