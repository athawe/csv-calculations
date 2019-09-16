<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>CSV scrapper</span>
      </v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-content>
      <scrapper />
    </v-content>
  </v-app>
</template>

<script>
  import Scrapper from './components/Scrapper'

  export default {
    name: 'App',
    components: {
      Scrapper,
    },
    data: () => ({
    //
    }),
  }
</script>
