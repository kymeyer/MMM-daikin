# MMM-Daikin

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/). It pulls data from a Daikin Air Conditioner device and displays them on the mirror.
The Daikin Device needs to be equipped with a Daikin Wifi controller with integrated wifi module.


![Alt text](/screenshots/daikin.png?raw=true "Screenshot")

## Installation

1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/kymeyer/MMM-daikin.git`. A new folder will appear navigate into it.
2. Execute `npm install` to install the node dependencies.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
  modules: [
    {
      module: 'MMM-Daikin',
      position: 'top_right',
      config: {
          ipAddress: '192.168.178.20',
     }
    },
  ],
};

```

## Configuration options

| Option           | Description                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `ipAddress`      | _Required_ Local IP address of the Daikin Device.                                                                         |
| `updateInterval` | _Optional_ How often the content will be fetched. <br><br>**Type:** `int`(milliseconds) <br>Default 30000 (1/2 minute)    |
| `animationSpeed` | _Optional_ Speed of the update animation. <br><br>**Type:** `int`(milliseconds) <br>Default 1000 milliseconds (1 second)  |
| `animationSpeed` | _Optional_ Show the outside temperature <br><br>**Type:** `bool` <br>Default: true                                        |

## Known Issues

- Startup may take some time, please be patient for first data to be received

## Dependencies

- [daikin-controller](https://github.com/Apollon77/daikin-controller) (installed via `npm install`)