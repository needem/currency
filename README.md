## Currency formatter based on Intl.NumberFormat

```@needme/currency``` offers a convenient way to format currencies using multiple configuration.

*Install*
```bash
npm i --save @needem/currency
```

*Basic use*
```js
import { currency } from '@needme/currency'

currency.add({ 
	locale: 'en-US',
	iso: 'usd' 
})

console.log(currency.format(100.99))
// should display $100.00
```

You can configure multiple formatter in one go by using the ```init``` function.

Choose which one should be used with the ```use``` function.


*Initialize with multiple locales*
```js
import { currency } from '@needme/currency'

currency.init({
	default: 'fr',
	configs: [{
		locale: 'en-US',
		iso: 'usd', 
	}, {
        name: 'mx',
        locale: 'es-MX',
        iso: 'mxv'
    }, {
        locale: 'fr',
        iso: 'eur',
        fromCents: true
    }]	
})

currency.use('mx')
currency.format(120.56)
// should display MXV 120.56
```