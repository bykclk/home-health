/**
 * Config plugin: declare the Google SDK transitive pods with modular headers.
 *
 * GoogleSignIn pulls in AppCheckCore (a Swift pod) which depends on
 * GoogleUtilities and RecaptchaInterop; those C pods don't define modules, so
 * importing them from Swift while building as static libraries fails unless
 * they generate module maps. Declaring them with :modular_headers => true fixes
 * the `pod install` error.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const POD_LINES = [
  "  pod 'GoogleUtilities', :modular_headers => true",
  "  pod 'RecaptchaInterop', :modular_headers => true",
];

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (!contents.includes("pod 'GoogleUtilities', :modular_headers")) {
        contents = contents.replace(
          /(target ['"][^'"]+['"] do\n)/,
          `$1${POD_LINES.join('\n')}\n`
        );
        fs.writeFileSync(podfilePath, contents);
      }
      return cfg;
    },
  ]);
};
