import { describe } from 'node:test'
import { it } from 'node:test'
import { before } from 'node:test'
import assert from 'node:assert/strict'
import { Currency } from './Currency.mjs'
import { Formatter } from './Formatter.mjs'

const now = new Date('2024-05-21T20:49:14.423Z')

describe('Currency', () => {
    
    let c

    before(async () => {
        c = new Currency()
    })

    it('should add default', () => {
        c.add()
        assert.equal(c.format(1000), '$1,000.00')
    })

    it('should add currency', () => {
        c.add({
            locale: 'es-MX',
            currency: 'mxv'
        })

        assert.equal(c.format(12345), 'MXV 12,345.00')
    })

    it('should use custom alias', () => {
        c.add({
            name: 'mx',
            locale: 'es-MX',
            currency: 'mxv'
        })

        c.add({
            name: 'no',
            locale: 'no-NO',
            currency: 'nok'
        })

        assert.equal(c.format(111000, { name: 'mx' }), 'MXV 111,000.00')
    })

    it('should format with cents', () => {
        c.add({
            locale: 'el',
            currency: 'eur',
            fromCents: true
        })

        assert.equal(c.format(15989), '159,89 €')
    })

    it('should format object values', () => {
        c.add({
            locale: 'el',
            currency: 'eur',
            fromCents: true
        })

        assert.equal(c.format({
            value: 15989,
            currency: 'usd'
        }), '159,89 $')
    })

    it('should format object values (force currency override)', () => {
        c.add({
            locale: 'el',
            currency: 'eur',
            fromCents: true
        })

        assert.equal(c.format({
            value: 15989,
            currency: 'usd'
        }, { currency: 'mxd' }), '159,89 MXD')
    })

    it('should override with cents', () => {
        c.add({
            locale: 'el',
            currency: 'eur',
            fromCents: true
        })

        assert.equal(c.format(15989, { fromCents: false }), '15.989,00 €')
    })

    it('should clear instance', () => {
        c.add({
            locale: 'el',
            currency: 'eur',
            fromCents: true
        })

        c.clear()

        assert.throws(() => c.format(15989), {
            message: 'no formatters found'
        })
    })

    it('should throw on unknown formatter on format', () => {
        c.add({
            locale: 'el',
            currency: 'eur',
            fromCents: true
        })

        assert.throws(() => c.format(15989, { name: 'bla' }), {
            message: 'invalid formatter'
        })
    })

    it('should throw when switching to an unknown formatter', () => {
        assert.throws(() => c.use('bla'), {
            message: 'invalid formatter'
        })
    })

    it('should flash', () => {
        c.init({
            configs: [{
                name: 'mx',
                locale: 'es-MX',
                currency: 'mxv'
            }, {
                locale: 'el',
                currency: 'eur',
                fromCents: true
            }, {
                locale: 'fr',
                currency: 'eur',
                fromCents: true
            }]
        })

        assert.equal(c.flash('mx').format(1599.00), 'MXV 1,599.00')
        assert.equal(c.format(159900), '1 599,00 €')
    })

    it('should switch to a different formatter', () => {
        c.init({ configs: SAMPLE_INIT })
        
        assert.equal(c.format(1000), '10,00 €')
        
        c.use('mx')
        assert.equal(c.format(3000.66), 'MXV 3,000.66')
        assert.equal(c.format(3020.66), 'MXV 3,020.66')
    })

    it('should init', () => {
        c.init({ 
            default: 'fr',
            configs: SAMPLE_INIT 
        })

        assert.equal(c.format(1599), '15,99 €')
    })

    it('should switch formatter on the fly', () => {
        c.init({ configs: SAMPLE_INIT })

        assert.equal(c.format(1599, { name: 'mx' }), 'MXV 1,599.00')
        assert.equal(c.format(1599), '15,99 €')
    })

    it('should format to parts', () => {
        c.init({
            configs: [{
                locale: 'fr',
                currency: 'eur',
                fromCents: true
            }]
        })

        assert.deepEqual(c.formatToParts(1004522), [{ 
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

    it('should get current', () => {
        c.init({
            configs: [{
                name: 'mx',
                locale: 'es-MX',
                currency: 'mxv'
            }, {
                locale: 'el',
                currency: 'eur',
                fromCents: true
            }, {
                locale: 'fr',
                currency: 'eur',
                fromCents: true
            }]
        })

        assert.ok(c.current() instanceof Formatter)
        assert.equal(''+c.current(), 'fr')
    })

})

const SAMPLE_INIT = [{
    name: 'mx',
    locale: 'es-MX',
    currency: 'mxv'
}, {
    locale: 'el',
    currency: 'eur',
    fromCents: true
}, {
    locale: 'fr',
    currency: 'eur',
    fromCents: true
}]