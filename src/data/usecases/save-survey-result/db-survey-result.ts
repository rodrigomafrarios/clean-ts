import { SaveSurveyResultRepository, SurveyResultModel, SaveSurveyResultModel, SaveSurveyResult } from './db-survey-result-protocols'

export class DbSaveSurveyResult implements SaveSurveyResult {
	constructor (private readonly saveSurveyResultRepository: SaveSurveyResultRepository) {}

	async save (data: SaveSurveyResultModel): Promise<SurveyResultModel> {
		const result = await this.saveSurveyResultRepository.save(data)
		return result
	}
}
