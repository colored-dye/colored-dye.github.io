document.querySelectorAll('pre > code').forEach(function (codeBlock) {
  var flag = true;
  if (codeBlock.children[0].className == 'lnt') {
    flag = false;
  }
  var button = document.createElement('button');
  // button.className = 'copy-code-button';
  button.className = 'highlight-copy-btn';
  button.type = 'button';
  button.innerText = 'Copy';

  var pre = codeBlock.parentNode;
  if (flag) {
    // if (pre.parentNode.classList.contains('highlight')) {
    // var highlight = pre.parentNode;
    var highlight = pre.parentNode;
    while (highlight.className != 'highlight') {
      highlight = highlight.parentNode;
    }
    var has_button = false;
    if (highlight.lastChild.className == 'highlight-copy-btn')
        has_button = true;
    if (has_button == false)
      highlight.appendChild(button);
    // } else {
    //   pre.parentNode.insertBefore(button, pre);
    // }
  }
});
function addCopyButtons(clipboard) {
  document.querySelectorAll('pre > code').forEach(function (codeBlock) {
    var flag = true;
    if (codeBlock.children[0].className == 'lnt') {
      flag = false;
    }
    var button = document.createElement('button');
    // button.className = 'copy-code-button';
    button.className = 'highlight-copy-btn';
    button.type = 'button';
    button.innerText = 'Copy';

    button.addEventListener('click', function () {
      clipboard.writeText(codeBlock.innerText).then(function () {
        /* Chrome doesn't seem to blur automatically,
           leaving the button in a focused state. */
        button.blur();

        button.innerText = 'Copied!';

        setTimeout(function () {
          button.innerText = 'Copy';
        }, 2000);
      }, function (error) {
        button.innerText = 'Error';
      });
    });

    if (flag) {
      var pre = codeBlock.parentNode;
      // if (pre.parentNode.classList.contains('highlight')) {
      // var highlight = pre.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
      // var highlight = pre;
      // highlight.parentNode.insertBefore(button, highlight);
      var highlight = pre.parentNode;
      while (highlight.className != 'highlight') {
        highlight = highlight.parentNode;
      }
      var has_button = false;
      if (highlight.lastChild.className == 'highlight-copy-btn')
        has_button = true;
      if (has_button == false)
        highlight.appendChild(button);
      // } else {
      //   pre.parentNode.insertBefore(button, pre);
      // }
    }
  });
}
if (navigator && navigator.clipboard) {
  addCopyButtons(navigator.clipboard);
} else {
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js';
  script.integrity = 'sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=';
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    addCopyButtons(clipboard);
  };

  document.body.appendChild(script);
}
