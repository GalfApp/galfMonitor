#!/bin/bash

echo " > Start...";
echo " > removing platforms...";
rm -rf platforms;
echo " > removing plugins...";
rm -rf plugins;

echo " > Adding Android platform...";
ionic platform add android;
echo " > Adding iOS platform...";
ionic platform add ios;

echo " > Installing plugins...";

echo " > Installing Keyboard plugin...";
ionic plugin add com.ionic.keyboard
echo " > Installing Console plugin...";
ionic plugin add org.apache.cordova.console
echo " > Installing Device plugin...";
cordova plugin add org.apache.cordova.device
echo " > Installing whitelist plugin...";
cordova plugin add cordova-plugin-whitelist
echo " > Installing Toast plugin...";
cordova plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git
echo " > Installing Network plugin..."
cordova plugin add cordova-plugin-network-information
echo " > Installing Progress Indicator plugin..."
cordova plugin add https://github.com/pbernasconi/cordova-progressIndicator.git

echo " > Done!";
