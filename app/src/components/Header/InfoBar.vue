<template>
  <div class="infoBar">
      <div class="infoBar-item">
        <span class='d-none d-sm-inline logged-in' style='display:inline-block;position:relative;top:-4px;margin-right:4px;'>LEVEL: 42</span>
        <div class='level-bar logged-in'>
          <div class='level-progress' style='width:100%;background:linear-gradient(90deg, #86d379, #86d379 45%, transparent 45%, transparent)'>
            <span style='width:100%;text-align:center;' class='d-none d-sm-inline-block'>45,000 / 100,000 EXP</span>
            <span style='width:100%;text-align:center;' class='d-inline-block d-sm-none'>LVL 42 - 45,000</span>
          </div>
        </div>
        <b-badge pill variant="danger" class='logged-in'>?</b-badge>
      </div>

    <div class="ml-auto d-none d-lg-none d-xl-inline">
      <p class="infoBar-item">
        <span style="color:red;">Online: </span>123
      </p>
      <p class="infoBar-item">
        <span style="color:red;">Bets:</span> 123,456,789
      </p>
      <p class="infoBar-item">
        <span style="color:red;">Won last 24 hours:</span> 123.12 BTC
      </p>
    </div>
    <div class='logged-in nudge-info'></div>
    <div class="ml-auto">
      <button style='padding:2px 6px 0 0' class="navbar-toggler aside-menu-toggler" type="button">
        <span class="icon-bulb"></span>
      </button>
      <button style='padding:2px 6px 0 0' class="navbar-toggler aside-menu-toggler" type="button" @click="asideToggle">
        <span class="icon-bubble"></span>
      </button>
    </div>

  </div>
</template>

<script>
import bBadge from 'bootstrap-vue/es/components/badge/badge';

export default {
  components: {
    'b-badge': bBadge
  },
  methods: {
    asideToggle (e) {
      e.preventDefault();
      document.body.classList.toggle('aside-menu-hidden');
    }
  }
};
</script>
