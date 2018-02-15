import bus from 'src/bus';

const showBetDetailModal = function () {
  bus.$emit('show-bet-details-modal');
};

export default {
  items: [
    {
      name: 'Games',
      url: '/components',
      icon: 'icon-game-controller',
      children: [
        {
          name: 'Dice',
          url: '/dice',
          icon: 'icon-game-controller'
        },
        {
          name: 'Blackjack',
          url: '/blackjack',
          icon: 'icon-game-controller',
          isComingSoon: true
        },
        {
          name: 'Roulette',
          url: '/roulette',
          icon: 'icon-game-controller',
          isComingSoon: true
        }
      ]
    },
    {
      name: 'All Bets',
      url: '/all-bets',
      icon: 'fa fa-history'
    },
    {
      name: 'Stats',
      url: '/stats',
      icon: 'icon-chart'
    },
    {
      name: 'Bet Lookup',
      icon: 'fa fa-search',
      func: showBetDetailModal
    },
   /*  {
      name: 'Promotions',
      url: '/promotions',
      icon: 'icon-diamond'
    }, */
    {
      name: 'Affiliates',
      url: '/affiliates',
      icon: 'fa fa-users'
    },
    {
      name: 'Provably Fair',
      url: '/provably-fair',
      icon: 'fa fa-balance-scale'
    },
    {
      name: 'Support',
      url: '/support',
      icon: 'fa fa-envelope'
    }
  ]
};
