## ERP modifiers for Webppl

Provides the following modifiers and modifications to ERPs in
[WebPPL](http://webppl.org/)

#### `lift`

Method for erps to enable projection for countably finite distributions.

The function to lift is provided from the webppl code; which is cps-ed and
transformed, and hence must be evaluated appropriately to extract the return
value.

Also provides an augmented serializer for ERPs such that `preImageERP` is also
serialized when `JSON.stringify` or the ERP's `toJSON` method is called.

###### Example:

~~~~ js
var erpA = categoricalERP([0.2, 0.3, 0.4, 0.1],   // probabilities
                          [  1,   2,   9,  10]);  // values
var lifter = function(s) {
  return (sum(mapN(idF, s + 1)) > 3) ? 'A' : 'B'; // test sum from 0 -> n
};
var erpB = erpA.lift(lifter);                     // perform lifting
erpB.print()                                      // print lifted ERP
erpB.preImageERP                                  // show equivalence classes
// => ERP :
//        "A" : 0.5
//        "B" : 0.49999999999999994

//    * Program return value:

//    { '"B"':
//       { vs: [ 1, 2 ],
//         ps: [ -1.6094379124341003, -1.2039728043259361 ] },
//      '"A"':
//       { vs: [ 9, 10 ],
//         ps: [ -0.916290731874155, -2.3025850929940455 ] } }
~~~~
