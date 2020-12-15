import { AccountMongoRepository } from '../account-repository/account'
import { MongoHelper } from '../helpers/mongo-helper'
import Collection from 'mongodb'

let collection: Collection

describe('Account Mongo Repository', () => {
	beforeAll(async () => {
		await MongoHelper.connect('mongodb://0.0.0.0:27017/jest')
	})
	afterAll(async () => {
		await MongoHelper.disconnect()
	})
	beforeEach(async () => {
		collection = await MongoHelper.getCollection('accounts')
		await collection.deleteMany({})
	})
	const makeSut = (): AccountMongoRepository => {
		return new AccountMongoRepository()
	}

	test('Should return an account on loadByEmail success', async () => {
		const sut = makeSut()
		await collection.insertOne({
			name: 'any_name',
			email: 'any_mail@mail.com',
			password: 'any_password'
		})
		const account = await sut.loadByEmail('any_mail@mail.com')
		expect(account).toBeTruthy()
		expect(account.id).toBeTruthy()
		expect(account.name).toBe('any_name')
		expect(account.email).toBe('any_mail@mail.com')
		expect(account.password).toBe('any_password')
	})
})
