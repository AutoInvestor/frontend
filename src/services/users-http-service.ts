import {BaseHttpService} from "@/services/base-http-service.ts";
import {User} from "@/model/User.ts";

export class UsersHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getUser(): Promise<User> {
        //return this.get<User>(`/user`);
        return Promise.resolve({ email: "johndoe@gmail.com", firstName: "John", lastName: "Doe", riskLevel: 2 });
    }
}