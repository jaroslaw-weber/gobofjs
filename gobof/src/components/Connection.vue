<template>
  <div>
    <div class="columns">
      <div class="column">
        <div>
          <input class="input" :value="address" type="text" @input="wsupdate">
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
export default {
  data: () => {
    return {
      wsstatus: "not connected :(",
      wsstatuscolor: "red"
    };
  },
  props: ["status", "address"],
  watch: {
    wsupdate: function() {
      //    console.log("wsupdate");
      try {
        /*ws = new WebSocket(this.wsaddress);
        this.wsstatus = "connecting...";
        this.wsstatuscolor = "orange";
        ws.onerror = () => {
          if (ws.readyState == 1) {
            this.error = "failed to connect to websocket server";
          }
          this.error = "connection error. connection state: " + ws.readyState;
        };

        ws.onopen = () => {
          this.wsstatus = "connected! :)";
          this.wsstatuscolor = "green";
        };
        ws.onclose = e => {
          var err = "Close Code: " + e.code + ", Close Reason: " + e.reason;
          this.error = err;
          console.log(e);
          this.wsstatus = "not connected :(";
          this.wsstatuscolor = "red";
        };
        ws.onmessage = function(e) {
          var server_message = e.data;
          alert(server_message);
          return false;
        };
        */
      } catch (e) {
        this.error = e;
      }
    }
  }
};
</script>