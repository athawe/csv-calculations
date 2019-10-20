<template>
  <v-container
    id="landing-page"
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        sm="8"
        offset-sm="2"
      >
        <div
          class="body-2 text-center"
        >
          <v-chip
            v-if="$vuetify.breakpoint.smAndUp"
            color="blue lighten-1 white--text"
            label
          >
            <span class="yellow--text subtitle-1 mr-1">Profitz</span>
            makes generating your company data from CSV records a quick and easy process.
          </v-chip>
          <v-card
            v-else
            color="blue lighten-1"
          >
            <v-card-text class="white--text">
              <span class="yellow--text subtitle-1 mr-1">Profitz</span>
              makes generating your company data from CSV records a quick and easy process.
            </v-card-text>
          </v-card>
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
              <li>Profit margin per product with 'Cost Value'</li>
              <li>Sale price per product with 'Value'</li>
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
      <v-dialog
        v-model="errorDialog"
        width="50vw"
        max-width="500px"
        :fullscreen="$vuetify.breakpoint.xsOnly"
      >
        <v-card>
          <v-card-title class="headline">
            Errors
          </v-card-title>
          <v-card-text>
            The following items couldn't be found in the provided inventory file:
            <ul>
              <li
                v-for="(value, index) in errors"
                :key="index"
              >
                {{ value }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="green darken-1"
              text
              @click="errorDialog = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row v-if="output !== null">
      <v-col
        cols="12"
        sm="10"
        offset-sm="1"
      >
        <v-card>
          <v-card-title>Key Details</v-card-title>
          <v-card-text>
            After removing product costs, your total profit is ${{ salesTotal }}.
            <v-data-table
              :headers="headers"
              :items="top10Items"
              class="elevation-2"
            />
          </v-card-text>
        </v-card>
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
        'profit': 'Profit',
      },
      errorDialog: false,
      errors: [],
      salesTotal: 0,
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'name',
        },
        {
          text: 'Profit',
          align: 'left',
          value: 'formattedProfit',
        },
      ],
      top10Items: [],
    }),
    methods: {
      async runConversion () {
        const inventory = await csv().fromString(this.inventoryCSV)
        const sales = await csv().fromString(this.salesCSV)
        this.output = sales.slice(0, (sales.length - 2)).map(entry => {
          const itemName = entry['Description'] ? entry['Description'] : entry['Name']
          const saleItemCode = entry['Item Code'] ? entry['Item Code'] : entry['Item']
          const quantitySold = parseInt(entry['Qty'] ? entry['Qty'] : entry['Quantity'], 10)
          const revenue = currency(entry['Value']).value
          let index = inventory.findIndex(inventoryEntry => {
            const inventoryItemCode = inventoryEntry['Item Code'] ? inventoryEntry['Item Code'] : inventoryEntry['Item']
            return saleItemCode === inventoryItemCode
          })
          if (index !== -1) {
            const costPerUnit = currency(inventory[index]['Cost Value']).value
            const profit = revenue - (quantitySold * costPerUnit)
            this.salesTotal += profit
            const price = currency(
              profit, {
                formatWithSymbol: true,
                separator: ',',
              }
            ).format()
            const simpleItem = {
              name: itemName,
              profit: profit,
              formattedProfit: currency(
                profit, {
                  formatWithSymbol: true,
                  separator: ',',
                }).format(),
            }
            if (this.top10Items.length === 0) {
              this.top10Items.push(simpleItem)
            } else {
              let addedFlag = this.top10Items.some((bigItem, index) => {
                if (profit > bigItem.profit) {
                  this.top10Items.splice(index, 0, simpleItem)
                  return true
                }
                return false
              })
              if (this.top10Items.length < 10 && addedFlag === false) {
                this.top10Items.push(simpleItem)
              } else if (this.top10Items.length > 10) {
                this.top10Items.pop()
              }
            }
            return {
              item: `"${saleItemCode}"`,
              description: `"${itemName}"`,
              profit: `"${price}"`,
            }
          } else {
            this.errors.push(`"${itemName}"`)
            return {}
          }
        }).filter(entry => Object.keys(entry).length > 0)
          .push({
            item: ``,
            description: `Total Profit`,
            profit: `"${this.salesTotal}"`,
          })
        if (this.errors.length > 0) {
          this.errorDialog = true
        }
      },
    },
  }
</script>

<style scoped>
  #landing-page {
    background-image: linear-gradient( to bottom right, rgba(245, 246, 252, 0.52), rgba(29, 19, 117, 0.76)),
    url('../assets/stock-image.jpeg');
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    position: relative;
  }
</style>
