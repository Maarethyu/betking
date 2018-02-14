<template>
  <div class="text-center connection-warning" v-if="showConnectionWarning">
    <template v-if="showWarning && !shouldAskToReload">
      <span class="text-red" v-if="timer / 1000 > 1">
        Unable to connect to server. Retrying in {{ timer / 1000 }} seconds.
        <a class="connect-link" href="#" v-on:click.prevent="retryNow">Retry Now</a>
      </span>
      <span class="text-green" v-if="timer / 1000 <= 1">Reconnecting...</span>
    </template>
    <template v-if="shouldAskToReload">
      <span class="text-red">Unable to connect to server. Please <a class="connect-link" href="#" v-on:click.prevent="reload">reload</a> the page</span>
    </template>
    <template v-if="isReconnected">
      <span class="text-green">Connected!</span>
    </template>
  </div>
</template>

<style type="text/css">
  .connect-link {
    text-decoration: underline;
  }
  .connection-warning {
    padding: 10px 0;
  }
</style>

<script type="text/javascript">
  import {mapGetters} from 'vuex';

  export default {
    name: 'SocketConnector',
    data: () => ({
      showWarning: false,
      timer: 0,
      shouldAskToReload: false,
      isReconnected: false,
      interval: null,
      reconnectionTimeout: null,
      attemptConnectionTimeout: null
    }),
    computed: {
      ...mapGetters({
        reconnectionCount: 'reconnectionCount',
        isSocketConnected: 'isSocketConnected',
        isAuthenticated: 'isAuthenticated',
        webSocket: 'webSocket'
      }),
      showConnectionWarning () {
        return (this.showWarning || this.shouldAskToReload || this.isReconnected) && this.timer > 1000;
      }
    },
    mounted () {
      this.setSocketWarningState();
      this.restartSocketConnection();
    },
    watch: {
      reconnectionCount: function (count) { // eslint-disable-line object-shorthand
        this.setSocketWarningState();
      },
      isSocketConnected: function (isSocketConnected) { // eslint-disable-line object-shorthand
        this.setSocketWarningState();
      },
      isAuthenticated: function () { // eslint-disable-line object-shorthand
        this.restartSocketConnection();
      }
    },
    methods: {
      restartSocketConnection () {
        if (!this.webSocket) {
          this.$store.dispatch('setupSocket');
        } else {
          this.$store.dispatch('restartSocket');
        }
      },
      setSocketWarningState () {
        const count = this.reconnectionCount;
        if (count >= 0 && count < 4 && !this.isSocketConnected) {
          this.startConnectionTimer();
        }
        if (count >= 4 && !this.isSocketConnected) {
          this.askToReload();
        }
        if (this.isSocketConnected) {
          this.connected();
        }
      },
      connected () {
        this.clearTimer();
        this.clearAttemptConnectionTimeout();
        this.clearReconnnectionTimeout();

        this.showWarning = false;
        this.shouldAskToReload = false;

        if (this.reconnectionCount !== 0) {
          this.isReconnected = true;

          this.reconnectionTimeout = setTimeout(() => {
            this.$store.dispatch('setSocketReconnectionCount', 0);
            this.isReconnected = false;
          }, 3000);
        }
      },
      startConnectionTimer () {
        this.clearTimer();
        this.clearAttemptConnectionTimeout();
        this.clearReconnnectionTimeout();

        this.showWarning = true;
        this.timer = this.reconnectionCount * 10 * 1000;

        this.interval = setInterval(() => {
          this.timer -= 1000;
        }, 1000);

        this.attemptConnectionTimeout = setTimeout(() => {
          this.restartSocketConnection();
        }, this.timer);
      },
      askToReload () {
        this.clearTimer();
        this.clearAttemptConnectionTimeout();
        this.clearReconnnectionTimeout();

        this.shouldAskToReload = true;
      },
      reload () {
        window.location.reload();
      },
      retryNow () {
        this.clearTimer();
        this.clearAttemptConnectionTimeout();
        this.clearReconnnectionTimeout();

        this.timer = 0;
        this.$store.dispatch('setSocketReconnectionCount', 0);
        this.restartSocketConnection();
      },
      clearTimer () {
        clearInterval(this.interval);
        this.timer = 0;
      },
      clearAttemptConnectionTimeout () {
        clearTimeout(this.attemptConnectionTimeout);
      },
      clearReconnnectionTimeout () {
        clearTimeout(this.reconnectionTimeout);
        this.isReconnected = false;
      }
    }
  };
</script>
