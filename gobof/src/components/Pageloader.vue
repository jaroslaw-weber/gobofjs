<template>
  <div v-bind:class="pageloaderClass">
    <span class="title">loading...</span>
  </div>
</template>

<script>
export default {
  data: () => {return {}},
  props: ["isLoading"],
  computed: {
    pageloaderClass: () => {
      //if(this.error!="") return "pageloader";
      //if (this.isLoading) return "pageloader is-active";
      return "pageloader";
    }
  }
};
</script>