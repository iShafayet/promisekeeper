
const chai = require('chai');
const expect = chai.expect;

const { mapList } = require('./../promisekeeper');

describe('mapList', () => {

  describe('Basic Usage', () => {

    it('Simple Test with promises', testDoneFn => {
      mapList(2, (new Array(6)).fill(100), (item) => {
        return new Promise((accept, reject) => {
          setTimeout(accept, item);
        });
      }).then(() => testDoneFn());
    });

    it('Simple Test with asunc functions', testDoneFn => {
      mapList(2, (new Array(6)).fill(100), async (item) => {
        await new Promise((accept, reject) => {
          setTimeout(accept, item);
        });
        return;
      }).then(() => testDoneFn());
    });

    it('Timing Test (it should take 300+ ms)', testDoneFn => {
      let stamp = (new Date()).getTime();
      mapList(2, (new Array(6)).fill(100), (item) => {
        return new Promise((accept, reject) => {
          setTimeout(accept, item);
        });
      }).then(() => {
        let now = (new Date()).getTime();
        expect(now - stamp).to.be.greaterThan(300);
        testDoneFn();
      });
    });

    it('Timing Test (it should take 3 times longer than Promise.all)', testDoneFn => {
      const array = (new Array(6)).fill(100);
      const fn = (item) => {
        return new Promise((accept, reject) => {
          setTimeout(accept, item);
        });
      };

      let promiseAllTime;
      let stamp2 = (new Date()).getTime();
      Promise.all(array.map(item => fn(item))).then(() => {
        let now = (new Date()).getTime();
        promiseAllTime = now - stamp2;

        let stamp = (new Date()).getTime();
        mapList(2, array, fn).then(() => {
          let now = (new Date()).getTime();
          expect(now - stamp).to.be.closeTo((promiseAllTime * 3), 50);
          testDoneFn();
        });
      });
    });

    it('Error should stop propagation', testDoneFn => {
      mapList(1, (new Array(6)).fill(100), async (item, index) => {
        await new Promise((accept, reject) => {
          if (index === 2) {
            return reject(new Error("Test"));
          }
          accept();
        });
        return;
      }).then(() => {
        // throw new Error("This code should never be executed");
      }).catch(ex => {
        expect(ex.message).to.equal("Test");
        testDoneFn();
      });
    });


  });

});