<template>
  <div class="box" v-if="error!=''">
    <p>error: {{ userFriendlyError }}</p>
    <br>
    <button class="button" v-on:click="error=''">Hide Error</button>
  </div>
</template>