const wd = require('wd');

const serverConfig = {
  host: 'localhost',
  port: 4723
};
const driver = wd.promiseChainRemote(serverConfig);
const desired = {
  'appium-version': '1.6.4',
  'platformName': 'iOS',
  'automationName': 'XCUITest',
  'deviceName': 'iPhone Simulator',
  'app': 'ios/build/Build/Products/Release-iphonesimulator/ZulipMobile.app',
  'fullReset': 'false',
  'noReset': true,
};
driver.init(desired);
driver.waitForElementByClassName('XCUIElementTypeStaticText', 6000000);
