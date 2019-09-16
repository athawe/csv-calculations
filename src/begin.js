// Node.js script I used as a rough draft.
let csvToJson = require('convert-csv-to-json')

let inventory = csvToJson.fieldDelimiter(',').getJsonFromCsv('Inventory-Report.csv')
let sales = csvToJson.fieldDelimiter(',').getJsonFromCsv('Sales-Report.csv')

const result = sales.map((entry) => {
  if (entry['"Qty"'] !== '""') {
    const itemCode = entry['"ItemCode"']
    return {
      itemCode: itemCode.substring(1, itemCode.length - 1),
      qty: parseInt(entry['"Qty"'].substring(1, 2)),
    }
  }
  return {}
})
// console.log(result[0]);

const inventoryCost = inventory.map((entry) => {
  const itemC = entry['"Item"']
  const costVal = entry['"CostValue"']
  return {
    itemC: itemC.substring(1, itemC.length - 1),
    cost: parseInt(costVal.substring(2, costVal.length - 1)),
  }
})
// console.log(inventoryCost[0]);

let output = result.map(sale => {
  if (sale.itemCode) {
    var sale2 = sale
    let index = inventoryCost.findIndex(cost => {
      return cost.itemC === sale2.itemCode
    })
    if (index !== -1) {
      return {
        item: sale.itemCode,
        revenue: sale.qty * inventoryCost[index].cost,
      }
    }
  }
  return 0
}).filter(entry => entry !== 0 && entry.revenue !== 0)

console.log(output)
