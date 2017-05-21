import wd from 'wd';

require('./setup');

const options = {
  validEmail: 'iago@zulip.com',
  inValidEmail: 'invalid@zulip.com',
  validServer: 'http://localhost:9991/',
  inValidServer: 'http://invalid:9991'
};


describe('iOS Integration testing', function () {
  this.timeout(300000);
  let driver;
  before(() => {
    const serverConfig = {
      host: 'localhost',
      port: 4723
    };

    driver = wd.promiseChainRemote(serverConfig);

    const desired = {
      'appium-version': '1.6.4',
      'platformName': 'iOS',
      'automationName': 'XCUITest',
      'deviceName': 'iPhone Simulator',
      'app': 'ios/build/Build/Products/Release-iphonesimulator/ZulipMobile.app',
      'fullReset': 'false',
      'noReset': true,
    };
    return driver.init(desired);
  });

  afterEach(async () => {
    await driver.refresh();
  });

  it('Test to connect to the URL', () => driver
      .sleep(2000)
      .elementByClassName('XCUIElementTypeTextField')
        .sendKeys(options.validServer)
      .elementByAccessibilityId('Enter')
      .click()
      .waitForElementByClassName('XCUIElementTypeStaticText')
        .text().should.eventually.equal('Sign in'));

  it('Test to sign in using the dev auth backend', () => driver
      .sleep(2000)
      .elementByClassName('XCUIElementTypeTextField')
        .sendKeys(options.validServer)
      .elementByAccessibilityId('Enter')
        .click()
      .elementByClassName('XCUIElementTypeStaticText')
        .text().should.eventually.equal('Sign in')
      .elementByAccessibilityId('Sign in with dev account')
        .click()
      .sleep(3000)
      .waitForElementByAccessibilityId(options.validEmail)
        .click()
      .sleep(5000)
      .waitForElementsByClassName('XCUIElementTypeStaticText')[0]
        .text().should.eventually.equal('Home'));
});
