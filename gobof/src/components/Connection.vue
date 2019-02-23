<template>
  <div>
    <div class="columns">
      <div class="column">
        <div>
          <input class="input" v-model="wsaddress" type="text" @input="wsupdate">
        </div>
        <br>
        <div>
          <p v-bind:style="{color:wsstatuscolor}">{{wsstatus}}</p>
        </div>
      </div>

      <div class="column">
        <button class="button is-primary" v-on:click="wsupdate()" :disabled="!wasmloaded">connect</button>
      </div>
    </div>
  </div>
</template>



<script>
module.exports = {
  data: function() {},
  props: ["wsstatus", "wsstatuscolor", "wsaddress", "wsupdate"]
};
</script>