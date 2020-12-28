import { forbidden, ok } from '../helpers/http/http-helper'
import { Middleware, HttpRequest, HttpResponse } from '../protocols'
import { AccessDeniedError } from '../errors'
import { LoadAccountByToken } from '../../domain/usecases/load-account-by-token'
export class AuthMiddleware implements Middleware {
    private readonly loadAccountByToken
    constructor (loadAccountByToken: LoadAccountByToken) {
        this.loadAccountByToken = loadAccountByToken
    }

    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
        const accessToken = httpRequest.headers?.['x-access-token']
        if (accessToken) {
			const account = await this.loadAccountByToken.load(accessToken)
			if (account) {
				return ok({ accountId: account.id })
			}
        }
        return forbidden(new AccessDeniedError())
    }
}