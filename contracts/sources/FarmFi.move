module contracts::FarmFi;

//imports
use std::string::String;

use sui::tx_context;
use sui::coin;
use sui::balance;
use sui::address;

//types
public struct Product has key, store{
    id: u64,
    farmer: address,
    price: u64,
    available: bool
}

public struct Order has key, store{
    id: u64,
    farmer: address,
    buyer: address,
    price: u64,
    status: u8 //0 = pending, 1 = complete, 2 = canceled
}

public fun list_product(
        farmer: signer, 
        product_id: u64, 
        price: u64
    ): Product {
        Product {
            id: product_id,
            farmer: signer::address_of(&farmer),
            price,
            available: true
        }
    }

public fun place_order(
        buyer: signer, 
        farmer: signer::Address, 
        product_id: u64, 
        price: u64
    ): Order {
        Order {
            id: product_id,  // Simplified, ideally generate a new unique ID
            buyer: signer::address_of(&buyer),
            farmer,
            price,
            status: 0
        }
    }

public fun complete_order(order: &mut Order) {
        order.status = 1;
    }

public fun cancel_order(order: &mut Order) {
    order.status = 2;
}
