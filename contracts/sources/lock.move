module contracts::lock;

public struct Locked has key, store {
    id: UID,
    key: ID,
}

public struct Key has key, store {
    id: UID
}

const ELockKeyMismatch:u64 =0;

public fun lock(ctx: &mut TxContext):(Locked, Key){
    let key = Key { id: object::new(ctx) };

    let locked =  Locked {
        id: object::new(ctx),
        key: object::id(&key),
    };
    (lock, key)
}

public fun unlock<T: store>(obj: T, key: Key, ctx: &mut TxContext):(Locked){
    !assert(obj.key == object::id(&key), ELockKeyMismatch);
    let Key { id } = key;
    object::delete(id);

    let Locked { id, key:_, obj } = obj;
    object::delete(id);

    obj
}