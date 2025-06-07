module contracts::config;

//CONSTANT VALUE DEFINITIONS
//E.G To export coin value
const COIN_VALUE: u64 = 1000;

public fun coin_value(): u64 { COIN_VALUE }

//constants
const EOrderNotCompleted: u64 = 0;
const EOrderNotPending: u64 = 1;
const ENotFarmerOrder: u64 = 2;
const ENotBuyerOrder: u64 = 3;
const EPriceMismatch: u64 = 4;
const EInvalidSelfTrade: u64 = 5;

//export functons
public fun error_OrderNotCompleted():u64 {EOrderNotCompleted}
public fun error_OrderNotPending():u64 {EOrderNotPending}
public fun error_NotFarmerOrder():u64 {ENotFarmerOrder}
public fun error_NotBuyerOrder():u64 {ENotBuyerOrder}
public fun error_PriceMismatch():u64 {EPriceMismatch}
public fun error_InvalidSelfTrade():u64 {EInvalidSelfTrade}

//structs
public struct FarmerPaymentDetail has drop, store {
    farmer: address,
    paymentAmount: u64,
}

public fun get_farmer(paymentDetail: &FarmerPaymentDetail):address { paymentDetail.farmer }
public fun get_payment(paymentDetail: &FarmerPaymentDetail):u64 { paymentDetail.paymentAmount }