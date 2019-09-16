<template>
  <v-file-input
    v-model="textInput"
    :label="label"
    show-size
    @change="loadTextFromFile"
  />
</template>

<script>
  export default {
    name: 'FileReader',
    props: {
      label: {
        type: String,
        default: '',
      },
    },
    data: () => ({
      textInput: null,
    }),
    methods: {
      loadTextFromFile () {
        const reader = new FileReader()
        reader.onload = e => this.$emit('load', e.target.result)
        reader.readAsText(this.textInput)
      },
    },
  }
</script>

<style scoped>

</style>
