<template>
  <div class="home animated fadeIn" style='overflow:hidden'>
    <div>
      <Carousel />
    </div>
    <div class='game-section'>
      <div class="home-row game-cards">
        <router-link to='/dice' class="card-container">
          <b-card header="DICE">
            <div class='game-image dice'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </router-link>
        <a href="javascript:void(0)" class="card-container">
          <b-card header="BLACKJACK">
            <div class='game-image game-image--coming-soon blackjack'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </a>
        <div class='break-sm'></div>
        <a href="javascript:void(0)" class="card-container">
          <b-card header="ROULETTE">
            <div class='game-image game-image--coming-soon roulette'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </a>
        <div class='break-lg'></div>
        <router-link to='poker' class="card-container">
          <b-card header="POKER">
            <div class='game-image dice'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import bCard from 'bootstrap-vue/es/components/card/card';

  import Carousel from './Carousel';

  export default {
    name: 'home',
    components: {
      'b-card': bCard,

      Carousel
    }
  };
</script>
