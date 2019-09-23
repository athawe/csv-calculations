<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>CSV Scrapper</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        href="https://github.com/athawe"
        color="blue lighten-2"
        text
      >
        Source
      </v-btn>
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
