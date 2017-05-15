from appium import webdriver
import os
import unittest


class LoginTests(unittest.TestCase):
    """Login/intitial with server tests."""

    def setUp(self):
        """Try to Setup the iOS emulator."""
        self.driver = webdriver.Remote(
            command_executor='http://127.0.0.1:4723/wd/hub',
            desired_capabilities={
                'platformName':  'iOS',
                'app': os.path.expanduser
                ('../ios/build/Build/Products/Release-iphonesimulator/ZulipMobile.app'),
                'platformName': 'iOS',
                'deviceName':    'iPhone 6',
                'automationName': 'XCUITest',
                'fullReset': 'false',
                'noReset': True,
            })
        self._validURL = "http://localhost:9991"
        self._inValidURL = "http://invalid:9991"
        self._validEmail = "iago@zulip.com"
        # TODO(): find a valid mail automatically
        self._validInvalidEmail = "invalid@zulip.com"

    def test_connect_server_invalid(self):
        """Test a bad server URL connection."""
        server_field = self.driver.find_element_by_class_name('XCUIElementTypeTextField')
        if server_field.text != 'Server URL':
            raise Exception('Could not location the Server URL input')
        server_field.send_keys(self._inValidURL)
        enter_btn = self.driver.find_element_by_accessibility_id("Enter")
        enter_btn.click()
        error = self.driver.find_elements_by_class_name('XCUIElementTypeStaticText')[2].text
        self.assertEqual(error, "Network request failed")

    def test_connect_server_valid(self):
        """Test a successful server connection."""
        server_field = self.driver.find_element_by_class_name("XCUIElementTypeTextField")
        if server_field.text != 'Server URL':
            raise Exception('Could not location the Server URL input')
        server_field.send_keys(self._validURL)
        enter_btn = self.driver.find_element_by_accessibility_id("Enter")
        enter_btn.click()
        sign_in_field = self.driver.find_elements_by_class_name("XCUIElementTypeStaticText")[0]
        self.assertEqual(sign_in_field.text, "Sign in")

    def test_login_dev_valid(self):
        """Test a successful login."""
        server_field = self.driver.find_element_by_class_name("XCUIElementTypeTextField")
        if server_field.text != 'Server URL':
            raise Exception('Could not location the Server URL input')
        server_field.send_keys(self._validURL)
        enter_btn = self.driver.find_element_by_accessibility_id("Enter")
        enter_btn.click()
        self.driver.find_element_by_accessibility_id("Sign in with dev account").click()
        self.driver.find_element_by_accessibility_id(self._validEmail).click()
        home_field = self.driver.find_elements_by_class_name("XCUIElementTypeStaticText")[0]
        self.assertEqual(home_field.text, "Home")
