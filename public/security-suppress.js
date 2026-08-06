(function() {
  try {
    // Disable Next.js DevTools overlay completely
    window.__NEXT_DEVTOOLS__ = { disabled: true };
    window.__NEXT_DISABLE_DEVTOOLS__ = true;

    // Filter out React console.error messages that trigger DevTools
    var originalError = console.error.bind(console);
    var blockedPatterns = [
      'Invalid values for props',
      'Hydration failed because',
      'React is not defined',
      'cannot appear as a descendant of',
      'expected a string or number',
      'has no matching hydration',
    ];
    console.error = function() {
      var msg = Array.prototype.slice.call(arguments).join(' ');
      for (var i = 0; i < blockedPatterns.length; i++) {
        if (msg.indexOf(blockedPatterns[i]) !== -1) return;
      }
      originalError.apply(console, arguments);
    };

    // Also suppress error events at the window level
    window.addEventListener('error', function(e) {
      var blocked = [
        'Invalid values for props',
        'Hydration failed',
        'has no matching hydration',
      ];
      if (blocked.some(function(p) { return (e.message || '').indexOf(p) !== -1; })) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    }, true);
  } catch(e) {}
})();
