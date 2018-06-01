
class PromiseKeeper {

  constructor(limit) {
    this.limit = limit;
    // this.map = new WeakMap();
    this.freeCbfn = null;
    this.finishCbfn = null;
    this.errorCbfn = null;
    this.STATES = {
      ACTIVE: 0,
      FINISHED: 1,
      ERROR: 2
    };
    this.state = this.STATES.ACTIVE;
    this.pendingCount = 0;
  }

  __keep(promise) {
    if (this.state !== this.STATES.ACTIVE) {
      throw new Error("Unable to keep promise when state is not ACTIVE");
    }
    this.pendingCount += 1;
    promise.then(() => {
      if (this.state !== this.STATES.ACTIVE) return;
      if (this.pendingCount <= 0) return;
      this.pendingCount -= 1;
      this.freeCbfn(newPromise => {
        if (newPromise) {
          this.__keep(newPromise);
          return;
        }
        if (this.pendingCount === 0) {
          this.state = this.STATES.FINISHED;
          this.finishCbfn();
        }
      });
    }).catch(ex => {
      this.state = this.STATES.ERROR;
      this.errorCbfn();
    });
  }

  onFree(cbfn) {
    this.freeCbfn = cbfn;
  }

  onFinish(cbfn) {
    this.finishCbfn = cbfn;
  }

  onError(cbfn) {
    this.errorCbfn = cbfn;
  }

  start() {
    for (let i = 0; i < this.limit; i += 1) {
      this.freeCbfn(newPromise => {
        if (!newPromise) return;
        this.__keep(newPromise)
      });
    }
  }

}