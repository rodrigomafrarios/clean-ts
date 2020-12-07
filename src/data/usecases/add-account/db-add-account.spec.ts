import { Encrypter } from '../../protocols/encrypter'
import { DbAddAccount } from './db-add-account'

interface SutTypes {
	sut: DbAddAccount
	encrypterStub: Encrypter
}

const factoryEncrypter = (): Encrypter => {
	class EncrypterStub {
		async encrypt (value: string): Promise<string> {
			return new Promise(resolve => resolve('hashed_password'))
		}
	}
	return new EncrypterStub()
}

const factory = (): SutTypes => {
	const encrypterStub = factoryEncrypter()
	const sut = new DbAddAccount(encrypterStub)
	return {
		sut,
		encrypterStub
	}
}
describe('DbAddAccount Usecase', () => {
	test('Should call Encrypter with correct password', async () => {
		const { sut, encrypterStub } = factory()
		const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'valid_password'
		}
		await sut.add(accountData)
		expect(encryptSpy).toHaveBeenCalledWith('valid_password')
	})
})