var fs = require('fs');
var path = require('path');
var ProtoBuf = require("protobufjs");
var _ = require('lodash');

function gatherConfigOps(modelConfig) {
  if (!modelConfig.options) {
    return [];
  }

  var groups = [
    "train_feed_dict",
    "validation_feed_dict",
    "test_feed_dict",
    "train_ops",
    "validation_ops",
    "test_ops"
  ];

  var ops = {};

  groups.forEach(groupName => {
    var group = modelConfig.options[groupName];
    if (group) {
      _.each(group, (opName, opKey) => ops[opName] = true);
    }
  });

  return _.keys(ops);
}

function gatherGraphNodes(graphNodes) {
  return graphNodes.reduce((nodes, node, i) => {
    nodes[node.name] = node;
    return nodes;
  }, {});
}

function checkExists(graphNodes, configOps) {
  return _.every(configOps, function(opName) {
    if (graphNodes[opName]) {
      return true;
    }
    console.error(`Failed to find ${opName} in the graph.`);
    return false;
  });
}

exports.validateModel = function(modelConfig) {
  try {
    var rootPath = path.resolve(__dirname, '..', 'proto/');
    var filePath = 'tensorflow/core/framework/graph.proto';
    var builder = ProtoBuf.loadProtoFile({ root: rootPath, file: filePath });
    var root = builder.build();
    var model = fs.readFileSync(modelConfig.file);
    var graph = root.tensorflow.GraphDef.decode(model);

    var configOps = gatherConfigOps(modelConfig);
    var graphOps = gatherGraphNodes(graph.node);
    return checkExists(graphOps, configOps);
  } catch (err) {
    console.error(err.message);
  }
};
