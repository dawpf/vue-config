import $HTTP from "@/utils/HTTP.js"
import Service from "@/utils/service.js"

export function getMockData_home() {
  return $HTTP.get(Service.mock)
}

export function getProxtData() {
  return $HTTP.get('/api/v2/movie/in_theaters')
}
