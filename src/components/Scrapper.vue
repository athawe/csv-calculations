<template>
  <v-container fluid>
    <v-row>
      <v-col
        cols="12"
        sm="8"
        offset-sm="2"
      >
        <div class="body-2">
          <span class="green--text subtitle-1">Profitz</span> makes generating your company data from CSV records a quick and easy process.
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        offset-sm="1"
        sm="5"
      >
        <v-card class="fill-height">
          <v-card-title class="green--text headline">
            Usage
          </v-card-title>
          <v-card-text class="body-2">
            For calculating your profits, please upload files with the following characteristics:
            <ul>
              <li>Identify products codes with 'Item' or 'Item Code'</li>
              <li>Product names with 'Name' or 'Description'</li>
              <li>Sold products with 'Quantity' or 'Qty'</li>
              <li>Profit margin per product with 'Cost Value' or 'Profit'</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        sm="5"
      >
        <form enctype="multipart/form-data">
          <v-card
            class="pa-2 pa-sm-4 fill-height"
          >
            <v-card-text
              class="pt-0"
            >
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
            </v-card-text>
            <v-card-actions>
              <v-row align="center">
                <v-col
                  class="text-center"
                  cols="12"
                >
                  <v-btn
                    color="primary"
                    large
                    block
                    @click="runConversion"
                  >
                    Calculate
                  </v-btn>
                </v-col>
                <v-col
                  v-if="output !== null"
                  class="text-center pb-0"
                  cols="12"
                >
                  <download-csv
                    id="downloadImg"
                    :data="output"
                    :labels="labels"
                    name="ResultData.csv"
                  >
                    <v-btn
                      color="success"
                      large
                      block
                    >
                      Download CSV
                      <v-icon>mdi-clipboard-text</v-icon>
                    </v-btn>
                  </download-csv>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </form>
      </v-col>
      <v-col
        cols="0"
        sm="1"
      />
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
        const inventory = await csv().fromString(this.inventoryCSV)
        const sales = await csv().fromString(this.salesCSV)
        const inventoryCost = inventory.map((entry) => {
          return {
            itemC: entry['Item'] ? entry['Item'] : entry['Item Code'],
            cost: currency(entry['Cost Value'] ? entry['Cost Value'] : entry['Profit']),
          }
        })
        const result = sales.map((entry) => {
          const quantity = entry['Qty'] ? entry['Qty'] : entry['Quantity']
          if (quantity !== '') {
            return {
              itemCode: entry['Item'] ? entry['Item'] : entry['Item Code'],
              description: entry['Description'] ? entry['Description'] : entry['Name'],
              qty: parseInt(quantity),
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
              let price = currency(
                sale.qty * inventoryCost[index].cost, {
                  formatWithSymbol: true,
                  separator: ',',
                })
                .format()
              return {
                item: `"${sale.itemCode}"`,
                description: `"${sale.description}"`,
                profit: `"${price}"`,
              }
            }
          }
          return {}
        }).filter(entry => Object.keys(entry).length > 0)
      },
    },
  }
</script>

<style scoped>

</style>
