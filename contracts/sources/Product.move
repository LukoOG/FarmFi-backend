module contracts::Product;

use std::string::String;

public enum Category has key, store{
    Staple,
    Cash,
    Others,
}

public struct Product has key, store{
    id: UID,
    name: String,
    farmer: address,
    price: u64,
    weight: u64,
    category: Category, 
    available: bool
}

