"use strict";

var fs = require('fs');
var path = require('path');
var ProtoBuf = require("protobufjs");
var _ = require('lodash');
var exceptions = require('./exceptions');

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

function verifyOpsExist(graphNodes, configOps) {
  return _.chain(configOps).reduce(function(invalidOps, opName) {
    if (!graphNodes[opName]) {
      invalidOps[opName] = true;
    }
    return invalidOps;
  }, {}).keys().value();
}

exports.validateModel = function(modelConfig) {
  var rootPath = path.resolve(__dirname, '..', 'proto/');
  var filePath = 'tensorflow/core/framework/graph.proto';
  var builder = ProtoBuf.loadProtoFile({ root: rootPath, file: filePath });
  var root = builder.build();
  var modelDef = fs.readFileSync(modelConfig.file);
  var graph = root.tensorflow.GraphDef.decode(modelDef);

  var configOps = gatherConfigOps(modelConfig);
  var graphOps = gatherGraphNodes(graph.node);
  var invalidOps = verifyOpsExist(graphOps, configOps);

  if (invalidOps.length > 0) {
    throw new exceptions.InvalidOpsException('found invalid operations in the model config', invalidOps);
  }
};
