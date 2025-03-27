module contracts::Order;

use sui::sui::SUI;
use sui::coin::{Coin, TreasuryCap};

use contracts::config;

//constants
const ORDERNOTCOMPLETED: u8 = 0;
const ORDERNOTPENDING: u8 = 3;
const NOTFARMERORDER: u8 = 1;
const NOTBUYERORDER: u8 = 2;

public enum Status has key, store{
    Pending,
    Completed,
    Cancelled,
    //add more types based on Lydia's Overthinking nature
}

public struct Order has key, store{
    id: UID,
    farmer: address,
    buyer: address,
    product: Product,
    price: u64,
    status: Status,
    escrow: Option<Coin<SUI>>
}

///creates the order on the blockchain
public entry fun create_order<T>(
    buyer: &signer,
    farmer: address,
    price: u64,
    treasure: &mut TreasuryCap<T>,
    ctx: &mut TxContext

): Order{
    let escrow = Coin::split(Coin::mnt(treasure, price, ctx), price); //lock the funds
    Order{
        id: Object::new(ctx),
        farmer,
        buyer: signer::address_of(buyer),
        price,
        status: Status::Pending,
        escrow: Some(escrow),
        }
}

///completes an order and releases escrow to the farmer
public entry fun complete_order(order: &mut Order, farmer: &signer){
    assert!(order::state == Status::Pending, ORDERNOTCOMPLETED);
    assert!(order.farmer == signer::address_of(farmer), NOTFARMERORDER);

    let escrow_funds = option::take(&mut order.escrow);
    Coin::join(escrow_funds, farmer);

    order.status = Status::Completed;
};

///Cancels an order and returns escrow to the buyer
public entry fun cancel_order(order: &mut Order, buyer: &signer){
    assert!(order::status == Status::Pending, ORDERNOTPENDING);
    assert!(order.buyer == signer::address_of(buyer), NOTBUYERORDER);

    let escrow_funds = option::take(&mut order.escrow);
    Coin::join(escrow_funds, buyer);

    order.status = Status.Cancelled;
}
