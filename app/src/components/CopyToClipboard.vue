<template>
  <div class="copy-to-clipboard">
    <div class="copy-text form-control" v-bind:class="{'copy-invisible': !copyVisible}">
      {{ text }}
    </div>
    <button
      v-if="copyVisible"
      v-bind:disabled="typeof text === 'undefined' || text.toString().length === 0"
      class="btn"
      v-bind:class="{'btn-success': copyText === 'Copied!', 'btn-danger': copyText === 'Error!', 'btn-default': copyText === 'Copy'}"
      v-on:click="copyToClipboard">
      {{ copyText }}
    </button>
  </div>
</template>

<style>
  .copy-to-clipboard {
    max-width: 100%;
    overflow: hidden;
    position: relative;
  }
  .copy-to-clipboard .copy-text.form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    overflow: hidden;
    padding-right: 78px;
    width: 100%;
  }
  .copy-to-clipboard .copy-text.form-control.copy-invisible {
    padding-right: 15px;
  }
  .copy-to-clipboard .btn {
    position: absolute;
    top: 0;
    right: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
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
        const textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        let msg;
        try {
          const successful = document.execCommand('copy');
          msg = successful ? 'Copied!' : 'Error!';
          return msg;
        } catch (err) {
          msg = 'Error!';
        }
        document.body.removeChild(textArea);
        return msg;
      },
      copyToClipboard () {
        this.copyText = this.copyTextToClipboard(this.text);
        this.resetCopyText();
      }
    }
  };
</script>
