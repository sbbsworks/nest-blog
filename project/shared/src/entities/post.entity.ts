import { TPostId, PostDTO } from "../dtos/post.dto";
import { DbEntity, EId } from "./db.entity";

export class PostEntity extends PostDTO implements DbEntity<TPostId>{
    [EId.id]: TPostId;
}
