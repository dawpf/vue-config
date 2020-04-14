import $HTTP from "@u/HTTP.js"
import Service from "@u/service.js"

export function getMockData() {
  return $HTTP.get(Service.mock)
}

export function getProxtData(params) {
  return $HTTP.get(Service.proxy, { params })
}
