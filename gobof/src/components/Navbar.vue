<template>
  <nav
    :class="['navbar', 'is-active: showMenu']"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <a
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbar"
        :class="{'is-active': showMenu }"
        @click="toggleMenu()"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{'is-active': showMenu }">
      <div class="navbar-start">
        <a class="navbar-item" @click="$emit('navbar', 'home')">Home</a>
        <a class="navbar-item" @click="$emit('navbar', 'webcam')">Webcam & Tracker</a>
        <a class="navbar-item" @click="$emit('navbar', 'color')">Color</a>
        <a class="navbar-item" @click="$emit('navbar', 'performance')">Performance</a>
        <a class="navbar-item" @click="$emit('navbar', 'connection')">Connection</a>
        <a class="navbar-item" @click="$emit('navbar', 'offset')">Offset</a>
        <a class="navbar-item" @click="$emit('navbar', 'sensitivity')">Sensitivity</a>
        <a class="navbar-item" @click="$emit('navbar', 'other')">Other</a>
        <a class="navbar-item" @click="$emit('save', '')">Save</a>
        <a class="navbar-item" @click="$emit('load', '')">Load</a>
        <p id="fps" class="navbar-item" v-bind:style="{color:fpscolor}"></p>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data: () => {
    return {
      showMenu: false
    };
  },
  props: ["selection"],
  methods: {
    toggleMenu: function() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>