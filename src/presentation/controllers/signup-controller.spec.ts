import { SignUpController } from './signup-controller'

describe('SignUpController', () => {
  test('Should return code status 400, when the name is not provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      name: '',
      email: 'any_email@mail.com',
      password: 'any_password',
      confirm_password: 'any_password'
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Missing param: name'))
  })
})
