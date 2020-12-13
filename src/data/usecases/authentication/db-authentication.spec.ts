import { AccountModel } from '../../../domain/models/account'
import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { LoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository'
import { DbAuthentication } from './db-authentication'
import { HashComparer } from '../../protocols/criptography/hash-comparer'

interface SutTypes {
	sut: DbAuthentication
	loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
	hashComparerStub: HashComparer
}

const makeFakeAccount = (): AccountModel => ({
	id: 'any_id',
	name: 'any_name',
	email: 'any_mail@mail.com',
	password: 'hashed_passowrd'
})

const makeHashComparer = (): HashComparer => {
	class HashComparerStub implements HashComparer {
		async compare (value: string, hash: string): Promise<boolean> {
			return new Promise(resolve => resolve(true))
		}
	}
	return new HashComparerStub()
}
const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
	class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
		async load (email: string): Promise<AccountModel> {
			return new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new LoadAccountByEmailRepositoryStub()
}
const makeFakeAuthentication = (): AuthenticationModel => ({
	email: 'any_mail@mail.com',
	password: 'any_password'
})
const makeSut = (): SutTypes => {
	const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
	const hashComparerStub = makeHashComparer()
	const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashComparerStub)
	return {
		sut,
		loadAccountByEmailRepositoryStub,
		hashComparerStub
	}
}
describe('DbAuthentication UseCase', () => {
	test('Should call LoadAccountByEmailRepository with correct email', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut()
		const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')
		await sut.auth(makeFakeAuthentication())
		expect(loadSpy).toHaveBeenCalledWith('any_mail@mail.com')
	})
	test('Should throw if LoadAccountByEmailRepository throws', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut()
		jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.auth(makeFakeAuthentication())
		await expect(promise).rejects.toThrow()
	})
	test('Should return null if LoadAccountByEmailRepository returns null', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut()
		jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null)
		const accessToken = await sut.auth(makeFakeAuthentication())
		expect(accessToken).toBeNull()
	})
	test('Should call HashComparer with correct password', async () => {
		const { sut, hashComparerStub } = makeSut()
		const compareSpy = jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(null)
		await sut.auth(makeFakeAuthentication())
		expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_passowrd')
	})
})