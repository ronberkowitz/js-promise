class Promise {
  constructor(func) {
      /* 
      func is a function that receives a resolve function as a paremeter. the resolve function should be called 
      with any value wished to resolve the promise.         

      The promise's initial status is 'pending', it runs the function received as a parameter and executes the "resolve" method
      when the function given calls it. 
      */
      this.func = func;
      this.status = 'pending';
      this.value = null;

      this.callbacksQueue = [];
      this.func(value => this.resolve(value));
  }

  resolve(value) {
      /* 
      when the promise resolves, it's status changes to "resolves" and the value returns to the value it was resolves with.
      also, all the callback functions assigned to the promise are being run (sent to the event queue).
      */

      this.status = 'resolved';
      this.value = value

      // when resolving, send all the resolve cbs to the event queue
      this.callbacksQueue.forEach(cb => cb());
      // after calling each callback, remove them from the queue
      this.callbacksQueue = [];
  }

  then(callback) {
      /* 
      "then" method ALWAYS returns a promise. that's because we want to enable promise chaining.

      if the current promise is pending, we add the resolvement of the returned promise to the end of the callbacks queue,
      so it will be resolved once this promise is resolved. 

      if the current promise is resolved, we immediately resolve the returned promise with the value returned by the cb given.
      */
      return new Promise(resolve => {

          const runCallback = () => {
              let cbReturnValue = callback(this.value);
              // if the return value of the callback is a promise, resolve our promise 
              // when the returned promise resolves so we won't have nested promises.
              if (cbReturnValue instanceof Promise) { (cbReturnValue.then(result => resolve(result))) }
              else {resolve(cbReturnValue)}
          }

          switch (this.status) {
              case 'pending':
                  /*
                  if the current promise is pending, return a promise that will be resolved after the current promise resolves.
                  all the callback tasks will run after the current promise resolves, and we add a task to the queue that resolves
                  the promise we return with the value returned by the callback function given, and the current promise's value 
                  as a paremeter
                  */
                  this.callbacksQueue.push(() => runCallback())
                  break;
              case 'resolved':
                  /* if the current promise is resolved - return a new promise resolved by the return value of the callback function
                  with the current promise's value given as a parameter
                  */
                  runCallback()
                  break;
          }
      })
  }
}


console.log("first print");

new Promise((resolve) =>
setTimeout(() => {
  resolve("first result");
}, 3000)
)
.then((result) => {
  const newResult = `${result} - 1`;
  console.log("second result", newResult);
  return newResult;
})
.then((result) => {
  return new Promise((resolve) => {
    resolve(`${result} - 2`);
  });
})
.then((result) => {
  console.log("final result", result);
});
