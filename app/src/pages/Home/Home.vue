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
        <router-link to='blackjack' class="card-container">
          <b-card header="BLACKJACK">
            <div class='game-image blackjack'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </router-link>
        <div class='break-sm'></div>
        <router-link to='roulette' class="card-container">
          <b-card header="ROULETTE">
            <div class='game-image roulette'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </router-link>
        <div class='break-lg'></div>
        <router-link to='slots' class="card-container">
          <b-card header="SLOTS">
            <div class='game-image blackjack'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </router-link>
        <div class='break-sm'></div>
        <router-link to='craps' class="card-container">
          <b-card header="CRAPS">
            <div class='game-image roulette'></div>
            <div class='card-footer'>Play exclusive dice lorem consectetuer adi scing elit</div>
          </b-card>
        </router-link>
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
