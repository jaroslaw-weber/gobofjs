<template>
  <div>
    <div class="columns">
      <div class="column">
        <div>
          <input class="input" :value="address" type="text" @input="$emit('input', $event.target.value)">
        </div>
      </div>
    </div>
  </div>
</template>



<script>
export default {
  props: [ "address"],
    
  
};
</script>