import Ajv from 'ajv'

export class Formatter {

	#ajv

	#locale

	#iso

	#display

	#fromCents

	#actual

	constructor(config = {}) {
		this.#ajv = new Ajv()

		this.#validate(config)

		this.#locale = config.locale
		this.#iso = config.iso
		this.#display = config.display || 'narrow'
		this.#fromCents = config.fromCents || false

		this.#actual = this.#createActual({
			locale: this.#locale,
			iso: this.#iso,
			display: this.#display
		})
	}

	static create(config) {
		return new Formatter(config)
	}

	format(value, config) {
		this.#validate(value, { 
			type: 'number',
			multipleOf : this.#fromCents ? 1 : 0.01
		})

		let actual = this.#actual
		if(config) {
			const newConfig = Object.assign({}, this.config, config)
			
			let v = newConfig.fromCents ? value / 100 : value
			
			return this.#createActual(newConfig).format(v)
		} else {
			let v = this.#fromCents ? value / 100 : value

			return this.#actual.format(v)
		}
	}

	formatToParts(value, config) {
		const valid = this.#validate(value, { 
			type: 'number',
			multipleOf : 1
		})

		let actual = this.#actual
		if(config) {
			const newConfig = Object.assign({}, this.config, config)
			
			let v = newConfig.fromCents ? value / 100 : value
			
			return this.#createActual(newConfig).formatToParts(v)
		} else {
			let v = this.#fromCents ? value / 100 : value

			return this.#actual.formatToParts(v)
		}
	}

	#createActual(config) {
		this.#validate(config)

		let currencyDisplay
		switch(config.display) {
		case 'narrow':
			currencyDisplay = 'narrowSymbol'
			break
		default:
			currencyDisplay = 'symbol'
		}

		return new Intl.NumberFormat(config.locale, {
			style: 'currency',
			currency: config.iso,
			currencyDisplay
		})
	}

	#validate(v, schema = CONFIG) {
		let valid = this.#ajv.validate(schema, v)
		if(!valid) {
			throw this.#ajv.errors[0]
		}
	}

	get config() {
		return {
			locale: this.#locale,
			iso: this.#iso,
			display: this.#display,
			fromCents: this.#fromCents
		}
	}

}

const CONFIG = {
	type: 'object',
	properties: {
		locale: {
			type: 'string'
		},
		iso: {
			type: 'string'
		},
		display: {
			type: 'string'
		},
		fromCents: {
			type: 'boolean'
		}
	},
	required: ['locale', 'iso'],
	additionalProperties: false
}
