/* Magic Mirror
 * Node Helper: MMM-Daikin
 *
 * By Kyrill Meyer
 * MIT Licensed.
 */


const DaikinAC = require("daikin-controller");
const Log = require("logger");
const NodeHelper = require("node_helper");


module.exports = NodeHelper.create({
	
  start() {
		const self = this;
		self.stats = {};
    self.config = [];
    Log.log(`Starting node helper: ${this.name}`); 
	},

	socketNotificationReceived(notification, payload) {
		const self = this;
    
    if (notification === "START") {
      self.config = payload;
    }
    
    if (notification === "MMM_DAIKIN_GETSTATS") {
			self.handleStartNotification(payload);
		}
	},

	handleStartNotification(payload) {
		const self = this;

    var options = {}; 

    var daikin =  new DaikinAC.DaikinAC(payload.ipAddress, options, function(err) {
      if (err) {
        Log.error("MMM-Daikin: Could not connect to A/C at "+payload.ipAddress+": "+err);
        Object.assign(self.stats, {
          ipAddress: payload.ipAddress,
          lasterror: err,
       });
        self.sendSocketNotification("MMM_DAIKIN_ERROR", self.stats);
      }
      else {
        Log.log("MMM-Daikin: Connection established to A/C at "+payload.ipAddress+"("+daikin.currentCommonBasicInfo.name+")...");

        daikin.setUpdate(self.config.updateInterval, function(err) {
          if (err) {
            Log.error("MMM-Daikin: Could not get details for A/C at "+payload.ipAddress+"("+daikin.currentCommonBasicInfo.name+"): "+err);
          }
          else {
            Object.assign(self.stats, {
              ipAddress: payload.ipAddress,
              name: daikin.currentCommonBasicInfo.name,
              power: daikin.currentACControlInfo.power,
              mode: daikin.currentACControlInfo.mode,
              fandir: daikin.currentACControlInfo.fanDirection,
              intemp: daikin.currentACSensorInfo.indoorTemperature,
              outtemp: daikin.currentACSensorInfo.outdoorTemperature,  
              targettemp: daikin.currentACControlInfo.targetTemperature,
              fanrate: daikin.currentACControlInfo.fanRate,
           });
           //Log.log("MMM-Daikin: Stats for A/C at "+payload.ipAddress+"("+daikin.currentCommonBasicInfo.name+")..."+JSON.stringify(self.stats));
           self.sendSocketNotification('MMM_DAIKIN_STATS', self.stats);
          }
        });
      }
      
    });
  }
});