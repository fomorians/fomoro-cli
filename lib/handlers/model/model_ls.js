var exceptions = require('../../exceptions');
var config = require('../../config');
var utils = require('../../utils');

module.exports = function() {
  utils.postJSON(config.host + config.model_list_endpoint, {}, function(err, res, body) {
    if (err) {
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else if (res.statusCode !== 200) {
      err = exceptions.fromResponse(res, body);
      console.error(exceptions.getUserMessage(err));
      process.exit(1);
    } else {
      var header = ['Model', 'Environment', 'Repo', 'Description'];
      var items = body['Items'].map(function(model) {
        console.log(model)
        return [
          model['ModelId'],
          model['Environment'],
          model['Repo'],
          model['Description'] || 'N/A'
        ];
      });
      var table = utils.table(items, header);
      console.log(table.toString());
    }
  });
};
