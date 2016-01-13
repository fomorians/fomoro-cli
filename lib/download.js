var zlib = require('zlib');
var Spinner = require('cli-spinner').Spinner;

module.exports = function(srcstream, dststream) {
  var spinner = new Spinner('Downloading... %s');
  spinner.setSpinnerString(5);
  spinner.setSpinnerDelay(100);
  spinner.start();

  var gunzip = zlib.createGunzip();
  srcstream.pipe(gunzip).pipe(dststream);

  dststream.on('end', function() {
    spinner.stop();
  });
};
