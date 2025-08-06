// Simple test to verify component creation
console.log("Starting component test...");

// Simulate loading the scripts in order
require('./js/icons.js');
console.log("iconLibrary available:", typeof window \!== 'undefined' && typeof window.iconLibrary \!== 'undefined');

require('./js/lang.js');  
console.log("languageManager available:", typeof window \!== 'undefined' && typeof window.languageManager \!== 'undefined');

console.log("Component test complete.");
EOF < /dev/null
