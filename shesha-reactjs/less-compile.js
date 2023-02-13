const lessCompiler = require('less-compiler');

module.exports = (function name() {
  lessCompiler.fromFile('./src/styles/index.less', {}, function (err, css) {
    if (err) {
      console.log('lessCompiler err :>> ', err);
    } else {
      console.log('lessCompiler css :>> ', css);
    }
  });
})();
