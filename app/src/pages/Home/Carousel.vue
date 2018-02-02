<template>
  <b-carousel id="carousel1"
              style="overflow hidden;"
              controls
              indicators
              background="#ababab"
              :interval="4000">
    <b-carousel-slide class="carousel-item" role="list"
      v-for="carousel of carousels" :key="carousel.id"
      :style="{
        backgroundImage: ($mq === 'mobile' && carousel.imageMobile)
          ? `url('${carousel.imageMobile}')`
          : `url('${carousel.image}')` }">

      <h3>
        {{ carousel.heading }}
        <br>
        <small style='color:#eb1c24;'>{{ carousel.subHeading }}</small>
        <div class='bottom'>
          <button class='btn-danger btn padded btn-md'>
            {{ carousel.button.text }}
          </button>
        </div>
      </h3>

    </b-carousel-slide>
  </b-carousel>
</template>

<style lang="scss" scoped>
  .carousel-item {
    height: 400px;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>


<script>
  import bCarousel from 'bootstrap-vue/es/components/carousel/carousel';
  import bCarouselSlide from 'bootstrap-vue/es/components/carousel/carousel-slide';

  /**
   * imageMobile is optional
   * TODO: button.link integration. Would we have external links too (outside vue app)?
   */
  const carouselConfig = [{
    id: '1',
    image: 'static/img/home/slide.png',
    imageMobile: '/static/img/home/slide_mobile.png',
    heading: '50 BITCOIN',
    subHeading: 'PROGRESSIVE JACKPOT',
    button: {
      text: 'PLAY NOW',
      link: '/'
    }
  }, {
    id: '2',
    image: 'static/img/home/slide.png',
    heading: '50 BITCOIN',
    subHeading: 'PROGRESSIVE JACKPOT',
    button: {
      text: 'PLAY NOW',
      link: '/'
    }
  }, {
    id: '3',
    image: 'static/img/home/slide.png',
    heading: '50 BITCOIN',
    subHeading: 'PROGRESSIVE JACKPOT',
    button: {
      text: 'PLAY NOW',
      link: '/'
    }
  }];

  export default {
    name: 'Carousel',
    data: () => ({
      carousels: []
    }),
    components: {
      'b-carousel': bCarousel,
      'b-carousel-slide': bCarouselSlide
    },
    mounted () {
      this.createConfig();
    },
    methods: {
      createConfig () {
        /* Any custom functions to be attached to buttons should be done here */
        this.carousels = carouselConfig;
      }
    }
  };
</script>
