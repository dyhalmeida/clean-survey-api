import { SignUpController } from './signup-controller'
import { EmailValidator } from '../protocols'
import { InvalidParamError, MissingParamError, ServerError } from '../errors'

class EmailValidatorStub implements EmailValidator {
  isValid (email: string): boolean {
    return true
  }
}

const makeEmailValidatorStubWithError = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      throw Error()
    }
  }
  return new EmailValidatorStub()
}

const makeSignUpController = (): { sut: SignUpController, emailValidatorStub: EmailValidator} => {
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)
  return {
    sut,
    emailValidatorStub
  }
}

describe('SignUpController', () => {
  test('Should return code status 400, when the name is not provided', () => {
    const { sut } = makeSignUpController()
    const httpRequest = {
      body: {
        name: '',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirm_password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('Should return code status 400, when the e-mail is not provided', () => {
    const { sut } = makeSignUpController()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: '',
        password: 'any_password',
        confirm_password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return code status 400, when the password is not provided', () => {
    const { sut } = makeSignUpController()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: '',
        confirm_password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return code status 400, when the confirm password is not provided', () => {
    const { sut } = makeSignUpController()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirm_password: ''
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('confirm_password'))
  })

  test('Should return code status 400, when the invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSignUpController()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        confirm_password: 'any_confirm_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should successfully call the Validator with a valid email', () => {
    const { sut, emailValidatorStub } = makeSignUpController()
    const spyOnIsValid = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirm_password: 'any_confirm_password'
      }
    }
    sut.handle(httpRequest)
    expect(spyOnIsValid).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should return code status 500 when EmailValidator throws', () => {
    const emailValidatorStub = makeEmailValidatorStubWithError()
    const sut = new SignUpController(emailValidatorStub)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirm_password: 'any_confirm_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
