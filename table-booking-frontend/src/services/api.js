import axios from 'axios'

const api = axios.create({
	baseURL: 'http://localhost:8080/api',
	headers: {
		'Content-Type': 'application/json',
	},
})

export function getApiErrorMessage(error, fallbackMessage) {
	const message = error?.response?.data?.message
	return typeof message === 'string' && message.trim() ? message : fallbackMessage
}

export default api
