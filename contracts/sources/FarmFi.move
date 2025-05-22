#[allow(unused_field, lint(coin_field))]
module contracts::FarmFi;

use sui::sui::SUI;
use sui::coin::{Coin};
// use sui::balance::{Self, Balance};
use sui::event;

use std::string::String;

use contracts::config;
use contracts::lock::{Self, Locked, Key};
use contracts::config::error_NotFarmerOrder;
// use contracts::Product::Product;

public enum Status has store, drop, copy{
    Pending,
    Completed,
    Cancelled,
    //add more types based on Lydia's Overthinking nature
}


public struct OrderCreated has store{
    id: UID,
    buyer: address,
    recipient: address,
    }

public struct Product has store, drop{
    offchain_id: String,
    price: u64,
    farmer: address
}

//expand to accomodate unlock key
public struct Order<T: key+store> has store, key{
    id: UID,
    farmer: address,
    buyer: address,
    product: Product,
    status: Status,
    escrow: Option<Coin<T>>,
    // exchange_key: ID,
}

///creates the order on the blockchain, buyer sends create request
public fun create_order<T>(
    // product: Product, have to pass in the individual fields
    offchain_id: String,
    price: u64,
    farmer: address,
    buyer_payment: Coin<T>,
    exchange_key: ID,
    ctx: &mut TxContext
): ID{
    //check cases
    assert!(buyer_payment.value() == price, config::error_PriceMismatch());
    assert!(farmer != ctx.sender(), config::error_InvalidSelfTrade());

    let product = Product{
        offchain_id,
        price,
        farmer,
    };

    let order = Order{
        id: object::new(ctx),
        farmer: product.farmer,
        buyer:  ctx.sender(),
        product,
        status: Status::Pending,
        escrow: option::some(buyer_payment),
        };
    //emitted event for off-chain sync
    let order_address = object::uid_to_address(&order.id);
    event::emit(OrderCreated { order_id: order_address});  
    transfer::share_object(order); // Make order publicly accessible
    order_address
}

//completes an order and releases escrow to the farmer
public fun complete_order<T: store+key>(order: &mut Order<T>, ctx: &mut TxContext){
    assert!(order.status == Status::Pending, config::error_OrderNotPending());
    assert!(order.farmer == ctx.sender(), config::error_NotFarmerOrder());
    // assert!(order.farmer == signer::address_of(farmer), config::error_NotFarmerOrder());

    let v_u = order.escrow.value();
    let escrow_funds = order.escrow.split<SUI>(v_u, ctx);
    let recipient: address = order.farmer;
    transfer::public_transfer(escrow_funds, recipient);

    order.status = Status::Completed;
}

// ///Cancels an order and returns escrow to the buyer
// public entry fun cancel_order(order: &mut Order, buyer: &signer){
//     assert!(order.status == Status::Pending, ORDERNOTPENDING);
//     assert!(order.buyer == signer::address_of(buyer), NOTBUYERORDER);

//     let escrow_funds = order.escrow.extract();
//     let recipient = signer::address_of(buyer);
//     transfer::public_transfer(escrow_funds, recipient);

//     order.status = Status::Cancelled;
// }