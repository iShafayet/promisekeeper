# promisekeeper
An industrial grade native promise scheduling library. Automatically limit number of promises running in parallel. 

> Because unmanaged promises at scale are a disaster you don't even consider until you face it.

## A case in point

```js
Promise.all(userList.map(user => {
  return sendPolicyUpgradeMail(user);
})).then(() => {
  res.send("All Done");
});
```
There is nothing wrong with the above code. Nothing until your `userList` is at the scale of `10,000,000`. Imagine all the calls to `sendPolicyUpgradeMail` occuring simultaneously. Your RAM is going to be overflowed pretty soon, especially if you're doing any kind of template rendering inside that method. Same is true for database calls and most i/o.

Of course, ideally you would have these implemented in another microservice but even then, your promises will take up memory at the very least linearly to your `list`. That's where **PromiseKeeper** comes into play. It manages your promises automatically. Instead of the above code, you write - 

```js
PromiseKeeper.mapList(10000, userList, (user) => {
  return sendPolicyUpgradeMail(user);
}).then(() => {
  res.send("All Done");
});
```

Above call to `PromiseKeeper.mapList` will ensure that there's at most `10000` (or any number you specify). As soon as a promise is resolved, a new one will take it's place. Once all the promises are resolved, `PromiseKeeper.mapList` behaves exactly the same way as `Promise.all` (as in, it returns a promise).

## How about async functions?

Async functions work just fine as well.

```js
const myfunc = async () => {
  await PromiseKeeper.mapList(10000, userList, async (user) => {
    await sendPolicyUpgradeMail(user);
  });
}
```

## How to use?

Install with `npm i promisekeeper`.

Require with `const PromiseKeeper = require('promisekeeper');`

## What if I'm not using `Array.map`

There is a lower level class `PromiseKeeper.PromiseKeeper`. It can be used to manage other kind of bulk promises. Documentation on that is coming soon.

## LICENSE

[MIT](LICENSE)

