import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator'
import {MemoryStoredFile} from 'nestjs-form-data'

export enum EAllowedUploadedAvatarMimeTypes {
    jpg = 'image/jpg',
    jpeg = 'image/jpeg',
    png = 'image/png',
}
export enum EAllowedUploadedPostPhotoMimeTypes {
    jpg = 'image/jpg',
    jpeg = 'image/jpeg',
    png = 'image/png',
}

export function convertToBytes(fileLengthInMegabytes:number) {
    return fileLengthInMegabytes * 10**6
}

@ValidatorConstraint({ name: 'file-validator', async: false })
export class FileValidator implements ValidatorConstraintInterface {
    errors: string[] = []
    validate(file: MemoryStoredFile, options:any) {
        const maxFileSize = +options.constraints[0]
        while(this.errors.length) {
            this.errors.pop()
        }
        if(!file) {
            return true
        }
        const errors = []
        if(!(file as any).busBoyMimeType) {
            errors.push(`Allowed file mime-types: ${Object.values(EAllowedUploadedAvatarMimeTypes).join(' | ')}`)
        }
        if(!Object.values(EAllowedUploadedAvatarMimeTypes).includes((file as any).busBoyMimeType as EAllowedUploadedAvatarMimeTypes)) {
            errors.push(`Allowed file mime-types: ${Object.values(EAllowedUploadedAvatarMimeTypes).join(' | ')}`)
        }
        if(!(+file.size > 0 && +file.size <= maxFileSize)) {
            errors.push(`File size must be > 0 && <= ${maxFileSize}`)
        }
        this.errors.push(...[...new Set(errors)])
        return !(this.errors.length)
    }
    defaultMessage() {
        return this.errors.join('; ')
    }
}
