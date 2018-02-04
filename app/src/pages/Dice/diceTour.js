export const template = `
  <div class='popover tour'>
    <div class='arrow'></div>
    <h3 class='popover-title'></h3>
    <div class='popover-content'></div>
    <div class='popover-navigation'>
        <button class='btn btn-default' data-role='prev'>« Prev</button>
        <button class='btn btn-default' data-role='next'>Next »</button>
        <button class='btn btn-default' data-role='end'>End demo</button>
    </div>
  </div>`;

export const createSteps = function () {
  return [{
    element: '#currency-dropdown',
    title: 'Your balance',
    content: 'Your balance is shown here. You can also click the balance button to switch currencies',
    backdrop: true,
    placement: 'right'
  }, {
    element: '#dice-fg-betamount',
    title: 'Bet Amount',
    content: 'You can set your bet amount here',
    backdrop: true,
    placement: 'left'
  }, {
    element: '#bet-amount-controls',
    title: 'Bet Amount Controls',
    content: 'These controls help you to change your bet amount easily',
    backdrop: true,
    placement: 'bottom'
  }, {
    element: '#dice-fg-betprofit',
    title: 'Bet Profit',
    content: 'Once you set your bet amount, you can see your expected profit based on current chance',
    backdrop: true,
    placement: 'right'
  }, {
    element: '#dice-fg-chance',
    title: 'Chance',
    content: 'You can change your chance of winning here',
    backdrop: true,
    placement: 'left'
  }, {
    element: '#dice-fg-payout',
    title: 'Payout',
    content: 'Your payout is based on chance selected. Payout is <span class="red-text">99 / chance</span>',
    backdrop: true,
    placement: 'right'
  }, {
    element: '#dice-bet-buttons',
    title: 'Place your bet!',
    content: `Choose one: <br />
      <span class="red-text">Lo</span> – if you think the next roll will be smaller than the target number, displayed on the button.
      <br/>
      <span class="red-text">Hi</span> – if you think the next roll will be greater than the target number.`,
    backdrop: true,
    placement: 'bottom'
  }];
};
