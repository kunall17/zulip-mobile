import wd from 'wd';

const options = {
  validEmail: 'iago@zulip.com',
  inValidEmail: 'invalid@zulip.com',
  validServer: 'http://localhost:9991/',
  inValidServer: 'http://invalid:9991'
};

describe('Setup the IOS simulator', () => {
  let driver;
  beforeAll(() => {
    const serverConfig = {
      host: 'localhost',
      port: 4723
    };

    driver = wd.remote(serverConfig);
  });


  test('Test to connect to the URL', () => {
   // driver.sleep(2000);
    const textField = driver.waitForElementByClassName('XCUIElementTypeTextField');
    textField.sendKeys(options.validServer);
    driver.waitForElementByAccessibilityId('Enter').click();
    expect(driver.waitForElementByClassName('XCUIElementTypeStaticText').text()).toEqual('Sign in');
  });

  driver.resetApp();

  test('Test to sign in using the dev auth backend', () => {
    // driver.sleep(2000);
    driver.elementByClassName('XCUIElementTypeTextField').sendKeys(options.validServer);
    driver.elementByAccessibilityId('Enter').click();
// driver.elementByClassName('XCUIElementTypeStaticText').text().should.eventually.equal('Sign in');
    driver.elementByAccessibilityId('Sign in with dev account').click();
    driver.sleep(3000);
    driver.waitForElementByAccessibilityId(options.validEmail).click();
    driver.sleep(5000);
    expect(driver.waitForElementsByClassName('XCUIElementTypeStaticText')[0].text())
      .toEqual('Home');
  });
});
