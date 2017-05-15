## Installation for the appium testing dependencies

To install appium execute from the root folder of zulip-mobile
```
cd int-test
brew install libimobiledevice --HEAD
brew install carthage
brew install node
npm install -g appium
npm install wd
npm install -g ios-deploy
gem install xcpretty  # optional
pip install virtualenv
virtualenv venv
. venv/bin/activate
```
Inside virtualenv env

```
pip install Appium-Python-Client
pip install pytest
pip uninstall selenium
pip install selenium==3.3.1
```
(Currently there is a bug with selenium 3.4.1 working with Appium-Python-Client therefore we need 3.3.1 specifically with `send_keys` for a input field )

## Running the integration tests

Run the appium with
```
appium
```
Now copy the UDID of the simulator created and always run the appium server with

```
appium --udid {UDID ID}
```
Example = `appium --udid A08112E1-96AC-4E3A-8165-DAE88264983C`

This forces the appium to use this simulator everytime, therefore preventing new simulators for being created on every test's

After running appium
Run
```
py.test tests/login.py
```
(Inside virtual env)
