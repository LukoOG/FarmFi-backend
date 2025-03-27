module contracts::config;

//CONSTANT VALUE DEFINITIONS
//E.G To export coin value
const COIN_VALUE: u64 = 1000;

public fun coin_value(): u64 { COIN_VALUE }

//CONST TYPES


//User roles
// public struct Buyer has key, store{
//     id: 
// }

// public struct Farmer has key, store{
//     ();
// };

// public struct Logistics has key, store{
//     ();
// };