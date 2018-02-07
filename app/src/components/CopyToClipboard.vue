<template>
  <div class="copy-to-clipboard">
    <div class="copy-text form-control" v-bind:class="{'copy-invisible': !copyVisible}">
      {{ text }}
    </div>
    <button
      v-if="copyVisible"
      v-bind:disabled="typeof text === 'undefined' || text.toString().length === 0"
      class="btn"
      v-bind:class="{'btn-success': copyText === 'Copied!', 'btn-danger': copyText === 'Error!', 'btn-dark': copyText === 'Copy'}"
      v-on:click="copyToClipboard">
      {{ copyText }}
    </button>
    <textarea ref="textarea" v-model="text">
    </textarea>
  </div>
</template>

<style lang="scss">
  .copy-to-clipboard {
    max-width: 100%;
    overflow: hidden;
    position: relative;

    textarea {
      box-shadow: none;
      outline: none;
      border: none;
      width: 2px;
      height: 2px;
      background: transparent;
      position: fixed;
      top: 0;
      left: 0;
    }

    .copy-text.form-control {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      overflow: hidden;
      padding-right: 78px;
      width: 100%;
    }

    .copy-text.form-control.copy-invisible {
      padding-right: 15px;
    }

    .btn {
      position: absolute;
      top: 0;
      right: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
</style>
<script>
  export default {
    data: () => ({
      copyText: 'Copy'
    }),
    props: {
      text: {
        type: [String, Number],
        default: ''
      },
      copyVisible: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      resetCopyText () {
        setTimeout(() => {
          this.copyText = 'Copy';
        }, 3000);
      },
      copyTextToClipboard (text) {
        let msg;
        try {
          // console.log(this.$refs.textarea);
          this.$refs.textarea.select();
          const successful = document.execCommand('copy');
          msg = successful ? 'Copied!' : 'Error!';
        } catch (err) {
          msg = 'Error!';
        }
        return msg;
      },
      copyToClipboard () {
        this.copyText = this.copyTextToClipboard(this.text);
        this.resetCopyText();
      }
    }
  };
</script>
