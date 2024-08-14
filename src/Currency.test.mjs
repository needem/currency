import { describe } from 'node:test'
import { it } from 'node:test'
import { before } from 'node:test'
import assert from 'node:assert/strict'
import { Currency } from './Currency.mjs'
import { Formatter } from './Formatter.mjs'

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
            iso: 'mxv'
        })

        assert.equal(c.format(12345), 'MXV 12,345.00')
    })

    it('should use custom alias', () => {
        c.add({
            name: 'mx',
            locale: 'es-MX',
            iso: 'mxv'
        })

        c.add({
            name: 'no',
            locale: 'no-NO',
            iso: 'nok'
        })

        assert.equal(c.format(111000, { name: 'mx' }), 'MXV 111,000.00')
    })

    it('should format with cents', () => {
        c.add({
            locale: 'el',
            iso: 'eur',
            fromCents: true
        })

        assert.equal(c.format(15989), '159,89 €')
    })

    it('should override with cents', () => {
        c.add({
            locale: 'el',
            iso: 'eur',
            fromCents: true
        })

        assert.equal(c.format(15989, { fromCents: false }), '15.989,00 €')
    })

    it('should clear instance', () => {
        c.add({
            locale: 'el',
            iso: 'eur',
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
            iso: 'eur',
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

    it('should init', () => {
        c.init({
            configs: [{
                name: 'mx',
                locale: 'es-MX',
                iso: 'mxv'
            }, {
                locale: 'el',
                iso: 'eur',
                fromCents: true
            }, {
                locale: 'fr',
                iso: 'eur',
                fromCents: true
            }]
        })

        assert.equal(c.format(1599), '15,99 €')
        assert.equal(c.format(1599, { name: 'mx' }), 'MXV 1,599.00')
        c.use('el')
        assert.equal(c.format(1599), '15,99 €')
    })

    it('should format to parts', () => {
        c.init({
            configs: [{
                locale: 'fr',
                iso: 'eur',
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
                iso: 'mxv'
            }, {
                locale: 'el',
                iso: 'eur',
                fromCents: true
            }, {
                locale: 'fr',
                iso: 'eur',
                fromCents: true
            }]
        })

        assert.ok(c.current() instanceof Formatter)
        assert.equal(''+c.current(), 'fr')
    })

})