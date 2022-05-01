import { Controller, HttpRequest, HttpResponse, EmailValidator, AddAccount } from './signup-protocols'
import { badRequest, serverError } from '../../helpers/http-helper'
import { InvalidParamError, MissingParamError } from '../../errors'

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export class SignUpController implements Controller {
  constructor (
    private readonly emailValidator: EmailValidator,
    private readonly addAccount: AddAccount
  ) {}

  public handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = [
        'name',
        'email',
        'password',
        'confirmPassword'
      ]
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const { name, email, password, confirmPassword } = httpRequest.body
      if (password !== confirmPassword) {
        return badRequest(new InvalidParamError('confirmPassword'))
      }
      if (!this.emailValidator.isValid(email)) {
        return badRequest(new InvalidParamError('email'))
      }
      this.addAccount.add({
        name,
        email,
        password
      })
    } catch (error) {
      return serverError()
    }
  }
}
