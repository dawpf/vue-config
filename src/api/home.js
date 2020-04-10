import $HTTP from "@/utils/HTTP.js"
import Service from "@/utils/service.js"

export function getMockData_home() {
  return $HTTP.get(Service.mock)
}
