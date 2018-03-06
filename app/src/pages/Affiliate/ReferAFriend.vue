<template>
  <b-row>
    <b-col cols="12">
      Refer a friend and start making money with BetKing! Share the url below:
      <br>
      <CopyToClipboard :text="url" />
      See
      <a href="https://betking.io/refer-a-friend" target="_blank">refer a friend</a>
      page for more details.
    </b-col>
  </b-row>
</template>

<script>
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import CopyToClipboard from 'components/CopyToClipboard';

  import {mapGetters} from 'vuex';

  export default {
    name: 'ReferAFriend',
    components: {
      'b-row': bRow,
      'b-col': bCol,
      CopyToClipboard,
    },
    computed: {
      ...mapGetters({
        username: 'username'
      }),
      url () {
        return `${window.location.origin}?ref=u:${this.username}`;
      }
    }
  };
</script>
