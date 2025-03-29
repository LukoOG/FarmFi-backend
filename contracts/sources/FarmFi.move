#[allow(unused_field, lint(coin_field))]
module contracts::FarmFi;

use sui::sui::SUI;
use sui::coin::{Coin};
// use sui::balance::{Self, Balance};

use sui::event;

use std::string::String;

use contracts::config;
// use contracts::Product::Product;

public enum Status has store, drop, copy{
    Pending,
    Completed,
    Cancelled,
    //add more types based on Lydia's Overthinking nature
}


public struct OrderCreated has copy, drop{order_id: address}

public struct Product has store, drop{
    offchain_id: String,
    price: u64,
    farmer: address
}

public struct Order has key{
    id: UID,
    farmer: address,
    buyer: address,
    product: Product,
    status: Status,
    escrow: Coin<SUI>
}

///creates the order on the blockchain
public fun create_order(
    // product: Product, gats pass in the individual fields
    offchain_id: String,
    price: u64,
    farmer: address,
    buyer_payment: Coin<SUI>,
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
        escrow: buyer_payment,
        };
    //emitted event for off-chain sync
    let order_address = object::uid_to_address(&order.id);
    event::emit(OrderCreated { order_id: order_address});  
    transfer::share_object(order); // Make order publicly accessible
    order_address
}

//completes an order and releases escrow to the farmer
public fun complete_order(order: &mut Order, ctx: &mut TxContext){
    assert!(order.status == Status::Pending, config::error_OrderNotPending());
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