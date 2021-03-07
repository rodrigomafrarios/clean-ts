import { Hasher, AddAccountModel, AccountModel, AddAccountRepository, LoadAccountByEmailRepository } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'

interface SutTypes {
	sut: DbAddAccount
	hasherStub: Hasher
	addAccountRepositoryStub: AddAccountRepository
	loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const factoryHasher = (): Hasher => {
	class HasherStub {
		async hash (value: string): Promise<string> {
			return new Promise(resolve => resolve('hashed_password'))
		}
	}
	return new HasherStub()
}
const factoryAddAccountRepository = (): AddAccountRepository => {
	class AddAccountRepositoryStub implements AddAccountRepository {
		async add (accountData: AddAccountModel): Promise<AccountModel> {
			const fakeAccount = {
				id: 'valid_id',
				name: 'valid_name',
				email: 'valid_email@mail.com',
				password: 'hashed_password'
			}
			return new Promise(resolve => resolve(fakeAccount))
		}
	}
	return new AddAccountRepositoryStub()
}

const makeFakeAccount = (): AccountModel => ({
	id: 'valid_id',
	name: 'valid_name',
	email: 'valid_email@mail.com',
	password: 'hashed_password'
})

const factoryLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
	class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
		async loadByEmail (email: string): Promise<AccountModel> {
			return new Promise(resolve => resolve(null))
		}
	}
	return new LoadAccountByEmailRepositoryStub()
}

const factory = (): SutTypes => {
	const addAccountRepositoryStub = factoryAddAccountRepository()
	const loadAccountByEmailRepositoryStub = factoryLoadAccountByEmailRepositoryStub()
	const hasherStub = factoryHasher()
	const sut = new DbAddAccount(hasherStub,addAccountRepositoryStub, loadAccountByEmailRepositoryStub)
	return {
		sut,
		hasherStub,
		addAccountRepositoryStub,
		loadAccountByEmailRepositoryStub
	}
}
describe('DbAddAccount Usecase', () => {
	test('Should call Hasher with correct password', async () => {
		const { sut, hasherStub } = factory()
		const hashSpy = jest.spyOn(hasherStub, 'hash')
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'valid_password'
		}
		await sut.add(accountData)
		expect(hashSpy).toHaveBeenCalledWith('valid_password')
	})
	test('Should throw if Hasher throws', async () => {
		const { sut, hasherStub } = factory()
		jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => {
			reject(new Error())
		}))
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'valid_password'
		}
		const promise = sut.add(accountData)
		await expect(promise).rejects.toThrow()
	})
	test('Should call AddAccountRepository with correct values', async () => {
		const { sut, addAccountRepositoryStub } = factory()
		const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'valid_password'
		}
		await sut.add(accountData)
		expect(addSpy).toHaveBeenCalledWith({
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'hashed_password'
		})
	})
	test('Should throw if AddAccountRepository throws', async () => {
		const { sut, addAccountRepositoryStub } = factory()
		jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => {
			reject(new Error())
		}))
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'valid_password'
		}
		const promise = sut.add(accountData)
		await expect(promise).rejects.toThrow()
	})
	test('Should return an account on success', async () => {
		const { sut } = factory()
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@mail.com',
			password: 'valid_password'
		}
		const account = await sut.add(accountData)
		expect(account).toEqual(makeFakeAccount())
	})
	test('Should call LoadAccountByEmailRepository with correct email', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = factory()
		const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
		await sut.add(makeFakeAccount())
		expect(loadSpy).toHaveBeenCalledWith('valid_email@mail.com')
	})
	test('Should return null if LoadAccountByEmailRepository not return null', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = factory()
		jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeAccount())))
		const account = await sut.add(makeFakeAccount())
		expect(account).toBeNull()
	})
})