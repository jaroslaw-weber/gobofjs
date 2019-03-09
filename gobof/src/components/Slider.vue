<template>
  <div class="field">
    <label class="label">{{label}}</label>
    <p class="help">{{help}}</p>
    <div class="control">
      <input
        class="slider has-output"
        :step="step"
        :min="min"
        :max="max"
        type="range"
        :value="value"
        @input="$emit('input', $event.target.value)"
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