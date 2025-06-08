#[allow(unused_field, lint(self_transfer, coin_field))]
module contracts::FarmFi;

use sui::coin::{Coin};
use sui::event;

use std::string::String;

use contracts::config;

public enum Status has store, drop, copy{
    Pending,
    Completed,
    Cancelled,
    //add more types based on Lydia's Overthinking nature
}

public struct OrderCreated has copy, drop{order_address: address}

//expand to accomodate unlock key
public struct Order<phantom T> has store, key{
    id: UID,
    buyer: address,
    paymentDetails: vector<FarmerPaymentDetail>,
    offchain_id: String,
    status: Status,
    escrow: Option<Coin<T>>,
}

//will remove after learning to properly serialize vector of structs from TS sdk
public struct FarmerPaymentDetail has drop, store {
    farmer: address,
    paymentAmount: u64,
}

///creates the order on the blockchain, buyer sends create request
public fun create_order<T:key+store>(
    offchain_id: String,
    // paymentDetails: vector<config::FarmerPaymentDetail>,
    farmers: vector<address>,
    payments: vector<u64>,
    buyer_payment: Coin<T>,
    totalPrice: u64,
    ctx: &mut TxContext
):address{
    //check cases
    let len = vector::length(&farmers);
    assert!(len == vector::length(&payments), config::error_PriceMismatch());

    let mut paymentDetails = vector[];
    let mut i = 0;
    let mut total = 0;
    while(i < len){
        let farmer = *vector::borrow(&farmers, i);
        let payment = *vector::borrow(&payments, i);

        // assert!(paymentDetails.borrow(i).get_farmer() != ctx.sender(), config::error_InvalidSelfTrade());
        // total = paymentDetails.borrow(i).get_payment() + total;
        assert!(farmer != ctx.sender(), config::error_InvalidSelfTrade());
        total = payment + total;
        
        let detail = FarmerPaymentDetail {
            farmer,
            paymentAmount: payment,
        };
        vector::push_back(&mut paymentDetails, detail);

        i = i + 1;

        // if(i == paymentDetails.length()){
        //     break
        // }
    };

    assert!(total == totalPrice, config::error_PriceMismatch());

    let buyer = ctx.sender();

    let order = Order{
        id: object::new(ctx),
        buyer: buyer,
        paymentDetails,
        offchain_id,
        status: Status::Pending,
        escrow: option::some(buyer_payment),
    };
    //emitted event for off-chain sync
    let order_address = object::uid_to_address(&order.id);
    event::emit(OrderCreated {  order_address });
    transfer::transfer(order, buyer);
    order_address
}

//completes an order and releases escrow to the farmer
// public fun complete_order<T: store+key>(order: &mut Order<T>, ctx: &mut TxContext){
//     assert!(order.status == Status::Pending, config::error_OrderNotPending());
//     assert!(order.farmer == ctx.sender(), config::error_NotFarmerOrder());
//     // assert!(order.farmer == signer::address_of(farmer), config::error_NotFarmerOrder());

//     // let v_u = order.escrow.value();
//     // let escrow_funds = order.escrow.split<SUI>(v_u, ctx);
//     let escrow_funds = option::extract(&mut order.escrow);
//     //loop through farmers, and transfer
//     let mut i = 0
//     loop{
//         order.paymentDetails.borrow(i).get_farmer()
//         if(i == order.paymentDetails.length()){
//             break
//         }
//     transfer::public_transfer(escrow_funds, recipient);
//     }

//     order.status = Status::Completed;
// }

// ///Cancels an order and returns escrow to the buyer
// public entry fun cancel_order(order: &mut Order, buyer: &signer){
//     assert!(order.status == Status::Pending, ORDERNOTPENDING);
//     assert!(order.buyer == signer::address_of(buyer), NOTBUYERORDER);

//     let escrow_funds = order.escrow.extract();
//     let recipient = signer::address_of(buyer);
//     transfer::public_transfer(escrow_funds, recipient);

//     order.status = Status::Cancelled;
// }