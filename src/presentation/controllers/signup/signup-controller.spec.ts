import { SignUpController } from './signup-controller'
import { AccountModel, AddAccount, AddAccountModel, EmailValidator } from './signup-protocols'
import { InvalidParamError, MissingParamError, ServerError } from '../../errors'

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    add (account: AddAccountModel): AccountModel {
      return {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }
  }

  return new AddAccountStub()
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeSignUpController = (): {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
} => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  return {
    sut,
    emailValidatorStub,
    addAccountStub
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
        confirmPassword: 'any_password'
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
        confirmPassword: 'any_password'
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
        confirmPassword: 'any_password'
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
        confirmPassword: ''
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('confirmPassword'))
  })

  test('Shoud return status code 400 when confirmPassword is different from password', () => {
    const { sut } = makeSignUpController()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'invalid_confirm_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('confirmPassword'))
  })

  test('Should return code status 400, when the invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSignUpController()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
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
        confirmPassword: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(spyOnIsValid).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should return code status 500 when EmailValidator throws', () => {
    const { sut, emailValidatorStub } = makeSignUpController()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AddAccount with the correct values', () => {
    const { sut, addAccountStub } = makeSignUpController()
    const addAccountSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(addAccountSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return code status 500 when AddAccount throws', () => {
    const { sut, addAccountStub } = makeSignUpController()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return code status 200, when the valid data is provided', () => {
    const { sut } = makeSignUpController()
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        confirmPassword: 'valid_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    })
  })
})
