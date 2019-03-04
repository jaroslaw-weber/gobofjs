<template>
  <div class="field">
    <label class="label">{{label}}</label>
    <p class="help">{{help}}</p>
    <div class="control">
      <input
        class="slider has-output"
        v-bind:step="step"
        v-bind:min="min"
        v-bind:max="max"
        type="range"
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
      >
      <output>{{value}}</output>
    </div>
  </div>
</template>

<script>
export default {
  data: () => {return {}},
  props: ["value", "label", "help", "step", "min", "max"]
};
</script>