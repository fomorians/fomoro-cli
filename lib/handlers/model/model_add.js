var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

module.exports = function() {
  var model = utils.readConfig();

  console.log(`Creating model "${model.name}"...`);
  var req = utils.postJSON(config.host + config.model_add_endpoint, model, (err, res, body) => {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      console.log(`Successfully created model "${model.name}".`);
    }
  });
};
