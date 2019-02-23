<template>
  <div class="field">
    <label class="label">tracker</label>
    <div class="control">
      <label class="radio">
        <input type="radio" name="answer" value="1" v-model.number="id">
        head
      </label>
      <label class="radio">
        <input type="radio" name="answer" value="2" v-model.number="id">
        right hand
      </label>
      <label class="radio">
        <input type="radio" name="answer" value="3" v-model.number="id">
        left hand
      </label>
    </div>
  </div>
</template>

<script>
module.exports = {
  data: function() {},
  props: ["value"]
};
</script>