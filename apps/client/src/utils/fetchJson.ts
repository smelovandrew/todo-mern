type SuccessResponse<T extends {}> = {
	status: number
	data: T & { status: 'success' }
}

export type FetchResponse<T extends {}> = SuccessResponse<T> | FailureResponse;

export interface FailureResponse {
	status: number;
	data: {
		status: 'error';
		message: string;
		errors?: Array<Omit<FailureResponse, "errors">>;
	}
}

export const getResponseJson = async <T extends {}>(
	response: Response,
): Promise<SuccessResponse<T>['data'] | FailureResponse['data']> => {
	try {
		return await response.json();
	} catch (e) {
		const error = e as Error;

		return { status: 'error', message: response.statusText ?? error.message };
	}
};

export const fetchJson = async <T extends {}>(
	input: RequestInfo,
	init?: RequestInit): Promise<FetchResponse<T>> => {
	try {
		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				"Content-Type": "application/json",
			}
		});
		const data = await getResponseJson<T>(response);
		if (data.status === 'error') {
			return { status: 400, data }
		}

		return { status: response.status, data: { ...data, status: 'success'} };
	} catch (e) {
		const error = e as Error;

		return {
			status: 400,
			data: {
				status: 'error',
				message: error.message,
			}
		};
	}
}