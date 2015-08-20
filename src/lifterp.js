"use strict"

var oldtoJSON = ERP.prototype.toJSON;

var _trampoline = function(p) {
  return (typeof p === 'function') ? _trampoline(p()) : p
}

var evalCPSFn = function(f, k) {
  var args = Array.prototype.slice.call(arguments, 2);
  return _trampoline(f.apply(this, [null, k, ''].concat(args)));
}

module.exports = function(env) {

  ERP.prototype.toJSON = function() {
    var basicJSON = oldtoJSON.bind(this)().erp;
    var extendedJSON = {erp: basicJSON.concat([{preImageERP: this.preImageERP}])}
    this.toJSON = function() {return extendedJSON};
    return extendedJSON;
  }

  ERP.prototype.lift = function(liftFn) {
    if (this.support === undefined)
      throw "Can only lift countably finite distributions";
    var preImageERP = {};
    var cc = this;
    var liftedDist = _.chain(this.support([]))
        .map(function(support) {             // get lifted values
          var liftedSupport;
          evalCPSFn(liftFn, function(s, v) {liftedSupport = v;}, support);
          return {
            k: JSON.stringify(liftedSupport),
            liftedSupport: liftedSupport,
            support: support,
            score: cc.score([], support)
          };})
        .groupBy('k')                        // group by lifted support
        .mapObject(function(eqClass, label){ // aggregate within class
          var subPs = [], subVs = [];
          var aggScore = _.reduce(eqClass,
                                  function(acc, val) {
                                    subVs.push(val.support);
                                    subPs.push(val.score);
                                    return util.logsumexp([acc, val.score]);
                                  },
                                  -Infinity);
          preImageERP[label] = {vs: subVs, ps: subPs}; // compute sub-distribution
          return {val: eqClass[0].liftedSupport, prob: aggScore}})
        .value();
    var liftedERP = makeMarginalERP(liftedDist);
    liftedERP.preImageERP = preImageERP;
    return liftedERP;
  }

  /// what was done to make sub-stuff directly marginalizable
  // subERP[JSON.stringify(val.support)] = {val: val.support, prob: val.score};
  // preImageERP[label] = subERP; // compute sub-distribution

  return {
  };
};
