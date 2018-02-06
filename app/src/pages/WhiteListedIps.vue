<template>
  <b-row>
    <b-col cols="10" offset="1">
    <h1>Whitelisted IPs</h1>

      <b-table
        id="whitelisted-ips-table"
        stacked="sm"
        :items="getWhitelistedIpAddresses"
        :fields="fields"
        :show-empty="true"
        :no-provider-sorting="true"
        :foot-clone="true"
        ref="table"
        empty-text="You don't have any whitelisted ips"
        responsive striped small outlined hover>

        <template slot="+" slot-scope="row">
          <b-button size="sm" variant="danger"  @click="deleteIp(row.item.ip_address)">
            Remove
          </b-button>
        </template>

        <template slot="FOOT_ip_address" slot-scope="data">
          <b-form-input size="sm" v-model="newIp" placeholder="IP Address" :state="newIp && !errors.ip" />
          <b-form-invalid-feedback>{{errors.ip}}</b-form-invalid-feedback>
        </template>

        <template slot="FOOT_+" slot-scope="data">
          <b-button size="sm" variant="default"  @click="addIp(newIp)" :disabled="newIp === null || !newIp">
            Add
          </b-button>
          <b-button size="sm" variant="default"  @click="addIp()">
            Add Current
          </b-button>
        </template>

      </b-table>
    </b-col>
  </b-row>
</template>

<script>
  import bTable from 'bootstrap-vue/es/components/table/table';
  import bRow from 'bootstrap-vue/es/components/layout/row';
  import bCol from 'bootstrap-vue/es/components/layout/col';
  import bButton from 'bootstrap-vue/es/components/button/button';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bFormInvalidFeedback from 'bootstrap-vue/es/components/form/form-invalid-feedback';

  import api from 'src/api';
  import {mapGetters} from 'vuex';
  import toastr from 'toastr';

  export default {
    name: 'WhitelistedIps',
    components: {
      'b-table': bTable,
      'b-row': bRow,
      'b-col': bCol,
      'b-button': bButton,
      'b-form-input': bFormInput,
      'b-form-invalid-feedback': bFormInvalidFeedback
    },
    data: () => ({
      errors: '',
      newIp: '',
      otp: '',
      fields: ['ip_address', '+']
    }),
    mounted () {
      this.getWhitelistedIpAddresses();
    },
    computed: mapGetters({
      is2faEnabled: 'is2faEnabled'
    }),
    methods: {
      refreshTable () {
        this.$refs.table.refresh();
        this.errors = {};
        this.newIp = '';
      },
      getWhitelistedIpAddresses () {
        return api.getWhitelistedIpAddresses()
        .then(response => {
          return response.data.ips;
        })
        .catch(error => {
          console.error(error);
          return [];
        });
      },
      deleteIp (ip) {
        if (this.is2faEnabled) {
          // TODO: Write a proper vue component for modal
          this.otp = prompt('Enter the otp');
        }
        api.deleteIp(ip, this.otp)
          .then(response => {
            toastr.success('IP removed from whitelist');
            this.refreshTable();
          })
          .catch(error => {
            this.showErrors(error.response);
          });
      },
      addIp (ip) {
        api.addIp(ip)
          .then(response => {
            toastr.success('IP added to whitelist');
            this.refreshTable();
          })
          .catch(error => {
            this.showErrors(error.response);
          });
      },
      showErrors (response) {
        if (response && response.status === 400) {
          const newErrors = {};

          response.data.errors && response.data.errors.forEach(error => {
            newErrors[error.param] = newErrors[error.param]
              ? `${newErrors[error.param]} / ${error.msg}` : error.msg;
          });

          if (response.data.error) {
            newErrors.ip = response.data.error;
          }

          this.errors = newErrors;
        }
      }
    }
  };
</script>
