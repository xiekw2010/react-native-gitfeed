'use strict';

const Platform = require('Platform');
const Parse = require('parse/react-native');

async function currentInstallation() {
  const installationId = await Parse._getInstallationId();
  return new Parse.Installation({
    installationId,
    appName: 'gitfeed',
    deviceType: Platform.OS,
    // TODO: Get this information from the app itself
    appIdentifier: Platform.OS === 'ios' ? 'com.bonyiyan.gitfeed' : 'com.bonyiyan.gitfeed',
  });
}

async function updateInstallation(updates) {
  const installation = await currentInstallation();
  await installation.save(updates);
}

module.exports = { currentInstallation, updateInstallation };
