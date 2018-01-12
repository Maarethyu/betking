<template>
  <div>
    <h1>Index</h1>
    <table v-if="isAuthenticated">
      <tbody>
        <tr>
          <td>Id:</td>
          <td>{{profile.id}}</td>
        </tr>
        <tr>
          <td>Username:</td>
          <td>{{profile.username}}</td>
        </tr>
        <tr>
          <td>email:</td>
          <td>{{profile.email}}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'Index',
  computed: mapGetters({
    profile: 'profile',
    isAuthenticated: 'isAuthenticated'
  })
};
</script>
