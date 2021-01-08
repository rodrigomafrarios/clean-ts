import { LoadSurveysController } from './load-surveys-controller'
import { SurveyModel, LoadSurveys } from './load-surveys-controller-protocols'
import { ok, serverError } from '../../../../presentation/helpers/http/http-helper'
import MockDate from 'mockdate'

interface SutTypes {
	sut: LoadSurveysController
	loadSurveysStub: LoadSurveys
}
const makeLoadSurveysStub = (): LoadSurveys => {
	class LoadSurveysStub implements LoadSurveys {
		async load (): Promise<SurveyModel[]> {
			return new Promise(resolve => resolve(makeFakeSurveys()))
		}
	}
	return new LoadSurveysStub()
}
const makeFakeSurveys = (): SurveyModel[] => {
	return [{
		id: 'any_id',
		question: 'any_question',
		answers: [{
			image: 'any_image',
			answer: ''
		}],
		date: new Date()
	}]
}
const makeSut = (): SutTypes => {
	const loadSurveysStub = makeLoadSurveysStub()
	const sut = new LoadSurveysController(loadSurveysStub)
	return {
		sut,
		loadSurveysStub
	}
}

describe('LoadSurveys Controller' ,() => {
	beforeAll(() => {
		MockDate.set(new Date())
	})
	afterAll(() => {
		MockDate.reset()
	})
	test('Should call LoadSurveys', async () => {
		const { sut, loadSurveysStub } = makeSut()
		const loadSpy = jest.spyOn(loadSurveysStub, 'load')
		await sut.handle({})
		expect(loadSpy).toHaveBeenCalled()
	})
	test('Should return 200 on success', async () => {
		const { sut } = makeSut()
		const httpResponse = await sut.handle({})
		expect(httpResponse).toEqual(ok(makeFakeSurveys()))
	})
	test('Should return 500 if LoadSurveys throws', async () => {
		const { sut, loadSurveysStub } = makeSut()
		jest.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const httpResponse = await sut.handle({})
		expect(httpResponse).toEqual(serverError(new Error()))
	})
})
