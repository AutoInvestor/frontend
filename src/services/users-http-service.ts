import {BaseHttpService} from "@/services/base-http-service.ts";
import {User} from "@/model/User.ts";
import z, {ZodType} from "zod/v4";

export class UsersHttpService extends BaseHttpService {
    private static Schema: ZodType<User> = z.object({
        userId: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        riskLevel: z.number(),
    })

    public constructor() {
        super();
    }

    public getUser(): Promise<User> {
        return this.get<User>(`/user`, UsersHttpService.Schema);
    }

    public updateUser(user: User): Promise<void> {
        return this.put<void>(`/user`, user, z.void());
    }
}