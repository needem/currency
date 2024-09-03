import Ajv from 'ajv'
import { Formatter } from './Formatter.mjs'

export class Currency {

	#formatters = {}

	#activeFormatter

	#flash

	#ajv

	constructor() {
		this.#ajv = new Ajv()

		this.init = this.init.bind(this)
		this.use = this.use.bind(this)
	}

	format(value, config) {
		const finalConfig = Object.assign({}, config || {})

		let finalValue
		if(typeof value === 'number') {
			finalValue = value
		} else if(typeof value === 'object' && value.value && value.currency) {
			finalValue = value.value
			finalConfig.currency = config?.currency || value.currency
		} else if(!Number.isFinite(value)) {
			return undefined
		} else {
			throw new Error('invalid value')
		}

		if(Object.keys(this.#formatters).length === 0) {
			throw new Error('no formatters found')
		}

		let name = this.#activeFormatter

		if(this.#flash) {
			name = this.#flash

			this.#flash = undefined
		}

		if(finalConfig.name) {
			name = finalConfig.name
			delete finalConfig.name
		}

		const formatter = this.#formatters[name]

		if(!formatter) {
			throw new Error('invalid formatter')
		}
		
		return formatter.format(finalValue, finalConfig)
	}

	formatToParts(value, config) {
		const finalConfig = Object.assign({}, config || {})

		let finalValue
		if(typeof value === 'number') {
			finalValue = value
		} else if(typeof value === 'object' && value.value && value.currency) {
			finalValue = value.value
			finalConfig.currency = value.currency
		} else if(!Number.isFinite(value)) {
			return undefined
		} else {
			throw new Error('invalid value')
		}

		if(Object.keys(this.#formatters).length === 0) {
			throw new Error('no formatters found')
		}

		let name = this.#activeFormatter
		
		if(this.#flash) {
			name = this.#flash

			this.#flash = undefined
		}

		if(finalConfig.name) {
			name = finalConfig.name
			delete finalConfig.name
		}

		const formatter = this.#formatters[name]

		if(!formatter) {
			throw new Error('invalid formatter')
		}

		return formatter.formatToParts(finalValue, finalConfig)
	}

	/**
	 * Add a new currency.
	 * 
	 * @param {object}  config
	 * @param [string]  config.name 	 A name to use as an alias for currency. 
	 *	  							     If not defined locale will be used.
	 * @param [string]  config.locale    Locale to use (default: en)
	 * @param [string]  config.currency       Currency currency to use (default: usd)
	 * @param [string]  config.display   Display style to use (default: narrow)
	 * @param [boolean] config.fromCents Does value has cents included (default: false)
	 */
 	add(config = { 
		locale: 'en',
		currency: 'usd' 
	}) {
		const name = config.name || config.locale

		if(this.#formatters[name]) {
			return this.#formatters[name]
		}

		delete config.name

		const formatter = Formatter.create(config)

		this.#formatters[name] = formatter

		this.#activeFormatter = name

		return this
	}

	use(name) {
		if(!this.#formatters[name]) {
			throw new Error('invalid formatter')
		}

		this.#activeFormatter = name

		return this
	}

	current() {
		if(Object.keys(this.#formatters).length === 0) {
			throw new Error('no formatters found')
		}

		const formatter = this.#formatters[this.#activeFormatter]

		if(!formatter) {
			throw new Error('invalid formatter')
		}

		return formatter
	}

	flash(name) {
		if(!this.#formatters[name]) {
			throw new Error('invalid formatter')
		}

		this.#flash = name

		return this
	}

	/**
	 * Initialize currency instance
	 * 
	 * @param {object}   config
	 * @param [string]   config.default (default: last language in the list)
	 * @param {object[]} config.configs
	 * @param [string]   config.configs[].name
	 * @param {string}   config.configs[].locale
	 * @param {string}   config.configs[].currency
	 * @param [boolean]  config.configs[].fromCents (default: false)
	 */
	init(config) {
		const valid = this.#ajv.validate(INIT_CONFIG, config)
		if(!valid) {
			throw this.#ajv.errors[0]
		}

		for(const conf of config.configs) {
			this.add(conf)
		}

		if(config.default) {
			this.use(config.default)
		} else {
			const lastConfig = config.configs[config.configs.length - 1]
			this.use(lastConfig.name || lastConfig.locale)
		}
	}

	clear() {
		this.#formatters = {}
		this.#activeFormatter = undefined
	}
}


const INIT_CONFIG = {
	type: 'object',
	properties: {
		default: {
			type: 'string'
		},
		configs: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string'
					},
					locale: {
						type: 'string'
					},
					currency: {
						type: 'string'
					},
					display: {
						type: 'string'
					},
					fromCents: {
						type: 'boolean'
					}
				},
				required: ['locale', 'currency'],
				additionalProperties: false
			},
			minItems: 1
		}
	},
	additionalProperties: false
}
