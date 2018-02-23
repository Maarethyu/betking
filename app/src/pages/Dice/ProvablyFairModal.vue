<template>
  <b-modal size="lg" id="diceProvablyFairModal" ref="modal" hide-footer lazy>
    <template slot="modal-header-close"><i class="fa fa-close"/></template>
    <template slot="modal-title">Provably Fair</template>

    <b-row>
      <b-col cols="12">
        <p>For details on what provably fair means and how to verify your rolls <a href="https://betking.io/provably-fair" target="_blank">click here</a></p>
      </b-col>
    </b-row>

    <template v-if="isAuthenticated">
      <br/>
      <b-row align-v="center" align-h="start">
        <b-col cols="4">Server Seed Hash</b-col>
        <b-col cols="8">
          <CopyToClipboard :text="serverSeedHash"></CopyToClipboard>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="4">Client Seed</b-col>
        <b-col cols="4">
          <CopyToClipboard v-if="!isClientSeedEditable" :text="clientSeed" :copyVisible="false"></CopyToClipboard>
          <b-form-input v-else type="text" id="new-client-seed" @change="formatClientSeed"
            v-model="clientSeedText" placeholder="New client seed" :state="isClientSeedTextValid" />
        </b-col>
        <b-col cols="4">
          <b-button v-if="!isClientSeedEditable" variant="danger" size="sm" @click="isClientSeedEditable = true">Change</b-button>
          <b-button v-else variant="success" size="sm" @click="editClientSeed" :disabled="!isClientSeedTextValid">Save</b-button>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="4">Nonce</b-col>
        <b-col cols="4">
          <CopyToClipboard :text="nonce" :copyVisible="false"></CopyToClipboard>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="4">Previous Server Seed</b-col>
        <b-col cols="8">
          <CopyToClipboard :text="previousServerSeed"></CopyToClipboard>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="4">Previous Server Seed Hash</b-col>
        <b-col cols="8">
          <CopyToClipboard :text="previousServerSeedHash"></CopyToClipboard>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="4">Previous Client Seed</b-col>
        <b-col cols="8">
          <CopyToClipboard :text="previousClientSeed"></CopyToClipboard>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="4">Previous Nonce</b-col>
        <b-col cols="8">
          <CopyToClipboard :text="previousNonce"></CopyToClipboard>
        </b-col>
      </b-row>

      <br/>
      <b-row>
        <b-col cols="12" class="text-center">
          <b-button @click="generateNewServerSeed" variant="primary">Generate New</b-button>
        </b-col>
      </b-row>
    </template>


    <b-button variant="default" class="pull-right" @click="closeModal">OK</b-button>
  </b-modal>
</template>

<style lang="scss">
  #diceProvablyFairModal {
    .copy-to-clipboard {
      min-height: 35px;
      .copy-text {
        min-height: 35px;
      }
    }
  }
</style>

<script>
  import bModal from 'components/modal/modal';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

  import CopyToClipboard from 'components/CopyToClipboard';
  import {getRandomAlphanumeric} from 'src/helpers';

  import {mapGetters} from 'vuex';

  export default {
    name: 'ProvablyFairModal',
    components: {
      'b-modal': bModal,
      'b-row': bRow,
      'b-col': bCol,
      'b-button': bButton,
      'b-form-input': bFormInput,
      CopyToClipboard
    },
    data: () => ({
      isClientSeedEditable: false,
      clientSeedText: ''
    }),
    computed: {
      ...mapGetters({
        isAuthenticated: 'isAuthenticated',
        clientSeed: 'diceClientSeed',
        serverSeedHash: 'diceServerSeedHash',
        nonce: 'diceNonce',
        previousServerSeed: 'previousDiceServerSeed',
        previousServerSeedHash: 'previousDiceServerSeedHash',
        previousClientSeed: 'previousDiceClientSeed',
        previousNonce: 'previousDiceNonce'
      }),
      isClientSeedTextValid () {
        const alphaNumRegex = /^[a-z0-9]+$/i;
        return this.clientSeedText &&
          alphaNumRegex.test(this.clientSeedText) &&
          this.clientSeedText.length > 0 &&
          this.clientSeedText.length <= 25;
      }
    },
    watch: {
      clientSeed (newVal) {
        this.clientSeedText = newVal;
      }
    },
    methods: {
      closeModal () {
        this.$refs.modal.hide();
      },
      editClientSeed () {
        this.$store.dispatch('setNewDiceClientSeed', this.clientSeedText);
        this.isClientSeedEditable = false;
      },
      formatClientSeed (value) {
        this.clientSeedText = value.replace(/[^0-9a-z]/gi, '').slice(0, 25);
      },
      generateNewServerSeed () {
        this.$store.dispatch('generateNewDiceSeed', getRandomAlphanumeric(20));
      }
    }
  };
</script>
