// metro.config.js
// Required for expo-router and platform-specific extensions (.native.ts / .web.ts)
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
