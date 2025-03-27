module contracts::FarmFi;

//imports
use std::string::String;
use contracts::Product{Self, Product}

//
use sui::tx_context;
use sui::coin;
use sui::balance;
use sui::address;

//package imports
use contracts::config{Self, Buyer};


public fun list_product(
        farmer: signer, 
        product_id: u64, 
        price: u64
    ): Product {
        Product {
            id: product_id,
            farmer: address::address_of(&farmer),
            price,
            available: true
        }
    }

public fun place_order(
        buyer: signer, 
        farmer: address, 
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
