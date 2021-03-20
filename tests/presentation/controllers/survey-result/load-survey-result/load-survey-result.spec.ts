import { LoadSurveyById } from '@/domain/usecases/survey/load-survey-by-id'
import { LoadSurveyResultController } from '@/presentation/controllers/survey-result/load-survey-result/load-survey-result-controller'
import { HttpRequest } from '@/presentation/protocols'
import { mockLoadSurveyById } from '@/tests/presentation/mocks'

type SutTypes = {
	sut: LoadSurveyResultController
	loadSurveyByIdStub: LoadSurveyById
}

const mockRequest = (): HttpRequest => ({
	params: {
		surveyId: 'any-id'
	}
})

const makeSut = (): SutTypes => {
	const loadSurveyByIdStub = mockLoadSurveyById()
	const sut = new LoadSurveyResultController(loadSurveyByIdStub)
	return {
		sut,
		loadSurveyByIdStub
	}
}

describe('Controller - LoadSurveyResult', () => {
	test('Should call LoadSurveyById with correct values', async () => {
		const { sut, loadSurveyByIdStub } = makeSut()
		const loadSurveyByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
		await sut.handle(mockRequest())
		expect(loadSurveyByIdSpy).toHaveBeenCalledWith('any-id')
	})
})
