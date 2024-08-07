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
        	iso: 'usd'
        })
    })

    it('should create default formatter', () => {
        assert.deepEqual(f.config, { 
        	locale: 'en', 
        	iso: 'usd', 
        	display: 'narrow' ,
        	fromCents: false
        })
    })

    it('should format value', () => {
    	assert.equal(f.format(1500), '$1,500.00')
    })

    it('should format value from cents', () => {
    	const f = Formatter.create({ 
    		locale: 'en',
    		iso: 'usd',
    		fromCents: true 
    	})
    	assert.equal(f.format(1599), '$15.99')
    })

    it('should format zero', () => {
    	assert.equal(f.format(0), '$0.00')
    })

    it('should throw when not integer', () => {
    	assert.throws(() => { f.format(0.1000) }, { message: 'must be multiple of 1' })
    })

    it('should override locale', () => {
    	assert.equal(f.format(1500, { locale: 'fr' }), '1 500,00 $')
    })

    it('should display decimal with comma', () => {
    	const fr = Formatter.create({
    		locale: 'fr',
    		iso: 'eur'
    	})

    	assert.equal(fr.format(1500), '1 500,00 €')
    })

    it('should display decimal with dot', () => {
    	const fr = Formatter.create({
    		locale: 'en',
    		iso: 'eur'
    	})

    	assert.equal(fr.format(1500), '€1,500.00')
    })

    it('culturally diverse', () => {
    	const fa = Formatter.create({
    		locale: 'fa',
    		iso: 'irr'
    	})

    	assert.equal(fa.format(10022), '‎ریال ۱۰٬۰۲۲')
    })
})