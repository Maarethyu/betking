<template>
  <div>
    <br />
    <b-row>
      <b-col sm="12" md="6">
        Withdrawal Fee
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12" md="8">
        <div v-if="!fetchingRecommendedFee">
          <div v-if="mode === modes.AUTO">
            <b-form-select
              v-model="selectedType"
              :options="options"
              @input="onChangeType"
            />
          </div>
          <div v-else>
            <b-form-group :invalid-feedback="recommendedFeeWarning" :state="isAmountInRecommendedRange">
              <b-form-input
                v-model="fee"
                @input="onChangeFee"
              />
            </b-form-group>
          </div>
          <b-form-text v-if="mode !== modes.AUTO">satoshis/byte</b-form-text>
        </div>
      </b-col>
      <b-col sm="12" md="4">
        <div>{{cost}}</div>
        <a
          v-if="mode === modes.AUTO"
          href="javascript:void(0)"
          v-on:click="updateMode(modes.CUSTOM)">
          Customize fee
        </a>
        <a
          v-if="mode !== modes.AUTO"
          href="javascript:void(0)"
          v-on:click="updateMode(modes.AUTO)">
          Cancel
        </a>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
  import bFormText from 'bootstrap-vue/es/components/form/form-text';
  import {formatBigAmount} from 'src/helpers';
  import {mapGetters} from 'vuex';

  import api from 'src/api';

  export default {
    name: 'SetWithdrawalFee',
    components: {
      'b-form-group': bFormGroup,
      'b-form-input': bFormInput,
      'b-row': bRow,
      'b-col': bCol,
      'b-form-select': bFormSelect,
      'b-form-text': bFormText
    },
    data: () => ({
      recommendedFee: {},
      fetchingRecommendedFee: false,
      modes: {AUTO: 'AUTO', CUSTOM: 'CUSTOM'},
      mode: 'AUTO',
      selectedType: 0,
      options: [
        {value: 0, text: 'Regular (within next hour)'},
        {value: 1, text: 'Priority (fastest)'}
      ],
      fee: null
    }),
    computed: {
      ...mapGetters({currencies: 'currencies'}),
      cost () {
        if (this.fee) {
          return this.formatBigAmount(this.fee * 226, 0);
        }
        return 0;
      },
      recommendedFeeWarning () {
        if (this.fee > this.recommendedFee.fastestFee) {
          return `Recommended maximum fee is ${this.recommendedFee.fastestFee}`;
        } else if (this.fee < this.recommendedFee.hourFee) {
          return `Recommended minumum fee is ${this.recommendedFee.hourFee}`;
        } else {
          return '';
        }
      },
      isAmountInRecommendedRange () {
        if (!this.fee) return null;
        return this.fee >= this.recommendedFee.hourFee && this.fee <= this.recommendedFee.fastestFee;
      }
    },
    mounted () {
      this.fetchingRecommendedFee = true;
      api.fetchRecommendedFee().then(({data}) => {
        this.recommendedFee = data && data.recommendedFee;
        this.fee = this.recommendedFee.hourFee;
        this.fetchingRecommendedFee = false;
        this.$emit('onFeeChange', this.fee);
      });
    },
    methods: {
      formatBigAmount,
      onChangeType (type) {
        if (type === 0) {
          this.onChangeFee(this.recommendedFee.hourFee);
        } else {
          this.onChangeFee(this.recommendedFee.fastestFee);
        }
      },
      onChangeFee (fee) {
        this.fee = fee;
        this.$emit('onFeeChange', fee);
      },
      updateMode (mode) {
        this.mode = mode;
        if (mode === this.modes.AUTO) {
          this.fee = this.recommendedFee.hourFee;
          this.selectedType = 0;
        }
      }
    }
  };
</script>
