import {expand} from 'dotenv-expand'
const path = process.env.NODE_ENV === 'production' ? '.env.production' : null
path && expand(require('dotenv').config({ path: `./${path}` }))

export function validateConfig(_config: {[k:string]: any}, customEnvPath: string = ''): void {
    const _errorsEnv:string[] = []
    const _errorsType:string[] = []
    for(const key of Object.keys(_config)) {
        if(!process.env[key]) {
            _errorsEnv.push(key)
        }
        if(typeof _config[key] !== 'string' && typeof _config[key] !== 'number' || typeof _config[key] === 'number' && isNaN(_config[key])) {
            _errorsType.push(key)
        }
    }
    if(_errorsEnv.length) {
        _errorsEnv.map((error) => {
            console.error(`${error}\n`)
        })
        try {
            throw new Error(`The variables listed above are missing in ${customEnvPath ? customEnvPath : process.env.NODE_ENV}.env\n\n`)
        } catch (error) {
            console.error((error as Error).message)
            process.exit(0)
        }
    }
    if(_errorsType.length) {
        _errorsType.map((error) => {
            console.error(`${error}\n`)
        })
        try {
            throw new Error(`The variables listed above have a wrong data type\n\n`)
        } catch (error) {
            console.error((error as Error).message)
            process.exit(0)
        }
    }
}
