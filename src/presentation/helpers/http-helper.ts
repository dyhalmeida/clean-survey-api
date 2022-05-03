import { HttpResponse } from '../protocols/http'
import { ServerError } from '../errors'

export function badRequest (error: Error): HttpResponse {
  return {
    statusCode: 400,
    body: error
  }
}

export function serverError (): HttpResponse {
  return {
    statusCode: 500,
    body: new ServerError()
  }
}

export function ok (data: any): HttpResponse {
  return {
    statusCode: 200,
    body: data
  }
}
