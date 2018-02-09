import BigNumber from 'bignumber.js';
import toastr from 'toastr';

export const diceBet = function (target) {
  let betAmount = new BigNumber(this.betAmount);

  if (!this.isAuthenticated) {
    toastr.error('You must login to make a bet');
    return;
  }

  if (betAmount.gt(this.balance) || this.balance === 0) {
    toastr.error('Balance too low');
    return;
  }

  // TODO: Ignoring betProfit <  0.00000001 check here, we might do it in backend from config

  if (betAmount.lt(this.minBetAmount)) {
    toastr.error(`Minimum ${this.currency.name} bet is ${this.minBetAmount}`);
    return;
  }

  if (!this.isPayoutValid || !this.isChanceValid) {
    toastr.error('Invalid payout or chance');
    return;
  }

  if (this.isBettingDisabled) {
    return;
  }

  if ([0, 1].indexOf(target) === -1) {
    toastr.error('Invalid bet target');
    return;
  }

  betAmount = betAmount
    .times(new BigNumber(10).pow(this.currency.scale))
    .dividedToIntegerBy(1)
    .toString();

  this.$store.dispatch('diceBet', {betAmount, currency: this.activeCurrency, target, chance: this.chance});
};

export const updateTargets = function () {
  let c;

  try {
    c = new BigNumber(this.chance);
    if (c.isNaN()) {
      c = new BigNumber(0.0001);
    }
  } catch (e) {
    c = new BigNumber(0.0001);
  }

  this.hiTarget = new BigNumber(99.9999)
    .minus(c)
    .toFixed(4);
  this.loTarget = new BigNumber(c)
    .toFixed(4);
};

export const updateChance = function () {
  try {
    const fc = new BigNumber(this.chance);

    if (fc.isNaN()) {
      this.isChanceValid = false;
    } else if (fc.lt(0.0001)) {
      this.payout = 0;
      this.isPayoutValid = false;
      this.isChanceValid = false;
    } else {
      if (fc.gt(98.99)) {
        this.isPayoutValid = false;
        this.isChanceValid = false;
      } else {
        this.isPayoutValid = true;
        this.isChanceValid = true;
        this.showPayoutWarning = false;
      }
      this.payout = new BigNumber(99)
        .dividedBy(fc)
        .toFixed(8);
    }
  } catch (e) {
    this.isChanceValid = false;
  }

  this.updateProfit();
  this.updateTargets();
};

export const updatePayout = function () {
  try {
    const fp = new BigNumber(this.payout);

    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }

    if (fp.isNaN()) {
      this.isPayoutValid = false;
    } else if (fp.dividedToIntegerBy(1).eq(0)) {
      this.chance = 0;
      this.isPayoutValid = false;
      this.isChanceValid = false;
    } else {
      if (fp.lt(1.00010102) || fp.gt(990000)) {
        this.isPayoutValid = false;
        this.isChanceValid = false;
      } else {
        this.isPayoutValid = true;
        this.isChanceValid = true;
      }

      this.chance = new BigNumber(99)
        .dividedBy(fp)
        .toFixed(4, BigNumber.ROUND_DOWN);

      const calculatedPayout = new BigNumber(99)
        .dividedBy(this.chance);

      if (!calculatedPayout.eq(fp) && calculatedPayout.gte(1.00010102) && calculatedPayout.lte(990000)) {
        this.showPayoutWarning = 3;
        this.timerId = window.setTimeout(() => {
          this.payout = calculatedPayout.toFixed(8, BigNumber.ROUND_DOWN);
          this.showPayoutWarning = false;
        }, 3000);
      } else {
        this.showPayoutWarning = false;
      }
    }
  } catch (e) {
    this.payout = '';
    this.isPayoutValid = false;
  }

  this.updateProfit();
  this.updateTargets();
};

export const onBlurChance = function () {
  const invalidateChanceAndPayout = () => {
    this.chance = 0;
    this.payout = 0;
    this.isPayoutValid = false;
    this.isPayoutValid = false;
  };

  try {
    const fc = new BigNumber(this.chance);
    if (fc.isNaN() || fc.lt(0.0001)) {
      invalidateChanceAndPayout();
    }
  } catch (e) {
    invalidateChanceAndPayout();
  }
};

export const onBlurPayout = function () {
  const setValidPayout = () => {
    const fc = new BigNumber(this.chance);

    if (fc.gt(0.0001) && fc.lt(98.99)) {
      this.isPayoutValid = true;
      this.payout = new BigNumber(99)
        .dividedBy(fc)
        .toFixed(8, BigNumber.ROUND_DOWN);
    } else {
      this.isPayoutValid = false;
      this.payout = 0;
    }
  };

  try {
    const fp = new BigNumber(this.payout);

    if (fp.isNaN()) {
      setValidPayout();
    }
  } catch (e) {
    setValidPayout();
  }
};

export const updateProfit = function () {
  try {
    const betAmount = new BigNumber(this.betAmount);
    const payout = new BigNumber(this.payout);

    if (betAmount.isNaN() || !this.isPayoutValid || !this.isChanceValid) {
      this.betProfit = 0;
    } else if (payout.gt(0)) {
      const p = betAmount.times(payout).minus(betAmount);

      this.betProfit = p.toFixed(this.currency.scale);
    } else {
      this.betProfit = 0;
    }
  } catch (e) {
    this.betProfit = 0;
  }
};

export const updateBetAmount = function () {
  try {
    const betProfit = new BigNumber(this.betProfit);
    const payout = new BigNumber(this.payout);

    if (betProfit.isNaN() || !this.isPayoutValid || !this.isChanceValid) {
      this.betAmount = 0;
    } else if (betProfit.gt(0)) {
      let p = betProfit.dividedBy(new BigNumber(payout).minus(1));

      if (p.gt(this.balance)) {
        p = new BigNumber(this.balance);
      }

      this.betAmount = p.toFixed(this.currency.scale);
    } else {
      this.betAmount = 0;
    }
  } catch (e) {
    this.betAmount = 0;
  }
};

export const halvedBetAmount = function () {
  let betAmount = new BigNumber(this.betAmount).dividedBy(2);

  if (betAmount.lt(this.minBetAmount)) {
    betAmount = new BigNumber(this.minBetAmount);
  }

  this.betAmount = betAmount.toFixed(this.currency.scale);
  this.updateProfit();
};

export const doubleBetAmount = function () {
  let betAmount = new BigNumber(this.betAmount).times(2);

  if (betAmount.gt(this.balance)) {
    betAmount = new BigNumber(this.balance);
  }

  this.betAmount = betAmount.toFixed(this.currency.scale, BigNumber.ROUND_DOWN);
  this.updateProfit();
};

export const setMinBetAmount = function () {
  let s = new BigNumber(this.minBetAmount);
  if (new BigNumber(this.payout).lt(2)) {
    const payoutInverseMultiplier = new BigNumber(1).dividedBy(new BigNumber(this.payout).minus(1));
    s = s.times(payoutInverseMultiplier.dividedToIntegerBy(1));

    if (payoutInverseMultiplier.mod(1).gt(0) && payoutInverseMultiplier.mod(1).lt(0.5)) {
      s = s.add(this.minBetAmount);
    }
  }

  this.betAmount = s.toFixed(this.currency.scale);
  this.updateProfit();
};

export const setMaxBetAmount = function () {
  let b = new BigNumber(this.balance);
  let p = b.times(this.payout).minus(b);

  console.log(p.toString());
  console.log(this.maxWin);

  if (p.isNaN() || p.lt(0)) {
    p = new BigNumber(0);
  }

  if (p.gt(this.maxWin)) {
    p = new BigNumber(this.maxWin);

    b = p.dividedBy(new BigNumber(this.payout).minus(1));

    if (b.gt(this.balance)) {
      b = new BigNumber(this.balance);
    }
  }

  this.betAmount = b.toFixed(8, BigNumber.ROUND_DOWN);
  this.updateProfit();
};

export const maxBetAmountClicked = function () {
  if (this.showMaxBetWarning) {
    this.$root.$emit('bv::show::modal', 'maxBetModal');
  } else {
    this.setMaxBetAmount();
  }
};

export const activateShortcuts = function () {
  this.shortcutsEnabled = !this.shortcutsEnabled;
};

export const keyUp = function (e) {
  if (this.shortcutsEnabled) {
    const {key} = e;
    if (key === 'h') {
      this.diceBet(0);
    } else if (key === 'l') {
      this.diceBet(1);
    } else if (key === 'z') {
      this.setMinBetAmount();
    } else if (key === 'x') {
      this.halvedBetAmount();
    } else if (key === 'c') {
      this.doubleBetAmount();
    } else if (key === 'b') {
      this.maxBetAmountClicked();
    }
  }
};
