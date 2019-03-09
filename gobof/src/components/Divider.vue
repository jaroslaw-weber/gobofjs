<template>
  <div class="is-divider" v-bind:data-content="text"></div>
</template>

<script>
export default {
  data: () => {return {}},
  props: ["text"]
};
</script>