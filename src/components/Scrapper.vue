<template>
  <v-container fluid>
    <v-row>
      <v-col
        cols="12"
        sm="8"
        offset-sm="2"
      >
        <div>Explanation</div>
        <form enctype="multipart/form-data">
          <file-reader
            id="inventoryReader"
            label="Upload Inventory CSV"
            @load="inventoryCSV = $event"
          />
          <file-reader
            id="salesReader"
            label="Upload Sales Report CSV"
            @load="salesCSV = $event"
          />
          <v-btn @click="runConversion">
            Calculate
          </v-btn>
        </form>
      </v-col>
    </v-row>
    <v-row
      v-if="output !== null"
    >
      <v-col
        cols="12"
        sm="8"
        offset-sm="2"
      >
        <download-csv
          id="downloadImg"
          :data="output"
          :labels="labels"
          name="ResultData.csv"
        >
          Download CSV
          <v-icon>mdi-clipboard-text</v-icon>
        </download-csv>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import csv from 'csvtojson'
  import currency from 'currency.js'
  import FileReader from './FileReader'

  export default {
    name: 'Scrapper',
    components: {
      FileReader,
    },
    data: () => ({
      inventoryCSV: null,
      salesCSV: null,
      output: null,
      labels: {
        'item': 'Item Code',
        'description': 'Description',
        'revenue': 'Revenue',
      },
    }),
    methods: {
      async runConversion () {
        let inventory = await csv().fromString(this.inventoryCSV)
        let sales = await csv().fromString(this.salesCSV)
        const inventoryCost = inventory.map((entry) => {
          const costVal = entry['Cost Value']
          return {
            itemC: entry.Item,
            cost: currency(costVal),
          }
        })
        const result = sales.map((entry) => {
          if (entry.Qty !== '') {
            return {
              itemCode: entry['Item Code'],
              description: entry.Description,
              qty: parseInt(entry.Qty),
            }
          }
          return {}
        })
        this.output = result.map(sale => {
          if (sale.itemCode) {
            let index = inventoryCost.findIndex(cost => {
              return cost.itemC === sale.itemCode
            })
            if (index !== -1) {
              return {
                item: sale.itemCode,
                description: sale.description,
                revenue: currency(
                  sale.qty * inventoryCost[index].cost, {
                    formatWithSymbol: true,
                    separator: ',',
                  })
                  .format(),
              }
            }
          }
          return {}
        }).filter(entry => entry !== {})
      },
    },
  }
</script>

<style scoped>

</style>
