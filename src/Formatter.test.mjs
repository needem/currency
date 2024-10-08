import { describe } from 'node:test'
import { it } from 'node:test'
import { before } from 'node:test'
import assert from 'node:assert/strict'
import { Formatter } from './Formatter.mjs'

describe('Formatter', () => {
    
    let f

    before(async () => {
        f = Formatter.create({
        	locale: 'en',
        	currency: 'usd'
        })
    })

    it('should create default formatter', () => {
        assert.deepEqual(f.config, { 
        	locale: 'en', 
        	currency: 'usd', 
        	display: 'narrow' ,
        	fromCents: false
        })
    })

    it('should format value', () => {
    	assert.equal(f.format(1500), '$1,500.00')
    })

    it('should format decimal values', () => {
        const f = Formatter.create({ 
            locale: 'en',
            currency: 'usd',
            fromCents: false
        })

        assert.equal(f.format(100.99), '$100.99')
    })

    it('should format value from cents', () => {
    	const f = Formatter.create({ 
    		locale: 'en',
    		currency: 'usd',
    		fromCents: true 
    	})
    	assert.equal(f.format(1599), '$15.99')
    })

    it('should format zero', () => {
    	assert.equal(f.format(0), '$0.00')
    })

    it('should throw when not integer', () => {
        const f = Formatter.create({ 
            locale: 'en',
            currency: 'usd',
            fromCents: true 
        })

    	assert.throws(() => { f.format(0.1000) }, { message: 'must be multiple of 1' })
    })

    it('should override locale', () => {
    	assert.equal(f.format(1500, { locale: 'fr' }), '1 500,00 $')
    })

    it('should display decimal with comma', () => {
    	const fr = Formatter.create({
    		locale: 'fr',
    		currency: 'eur'
    	})

    	assert.equal(fr.format(1500), '1 500,00 €')
    })

    it('should display decimal with dot', () => {
    	const fr = Formatter.create({
    		locale: 'en',
    		currency: 'eur'
    	})

    	assert.equal(fr.format(1500), '€1,500.00')
    })

    it('culturally diverse', () => {
    	const fa = Formatter.create({
    		locale: 'fa',
    		currency: 'irr'
    	})

    	assert.equal(fa.format(10022), '‎ریال ۱۰٬۰۲۲')
    })

    it('should format to parts', () => {
        const fr = Formatter.create({
            locale: 'fr',
            currency: 'eur',
            fromCents: true
        })

        assert.deepEqual(fr.formatToParts(1004522), [{ 
            type: 'integer', value: '10' 
        }, { 
            type: 'group', value: ' ' 
        }, { 
            type: 'integer', value: '045' 
        }, { 
            type: 'decimal', value: ',' 
        }, { 
            type: 'fraction', value: '22' 
        }, { 
            type: 'literal', value: ' ' 
        }, { 
            type: 'currency', value: '€' 
        }])
    })
})