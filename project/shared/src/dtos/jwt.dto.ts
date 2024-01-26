import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class JWTDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly token: string;
}

export class JWTRDO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly token: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly refreshToken: string;
}
