import { INestApplication } from "@nestjs/common/interfaces";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
type TMakeSwaggerOptions = {path:string, title:string, description:string, version:string, tag?:string}
export function makeSwagger(app:INestApplication, {path, title, description, version, tag = ''}:TMakeSwaggerOptions) {
  SwaggerModule
    .setup(path, app,
        SwaggerModule.createDocument(
            app,
            new DocumentBuilder()
                .setTitle(title)
                .setDescription(description)
                .setVersion(version)
                .build()
        )
    )
}
