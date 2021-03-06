import {
    ConflictException,
    Inject,
    Injectable,
    HttpException,
    NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { GroupRepositoryToken } from '../constant';
import { Group } from '../entities/group.entity';

@Injectable()
export class GroupService {
    constructor(
        @Inject(GroupRepositoryToken)
        private readonly groupRepository: Repository<Group>,
        private readonly userService: UserService,
    ) { }

    async list(): Promise<Group[]> {
        return await this.groupRepository.find();
    }

    async create(name: string): Promise<Group> {
        try {
            const group = new Group(name);
            await this.groupRepository.save(group);
            return group;
        } catch (error) {
            throw new ConflictException(error);
        }
    }

    public async edit(id: number, name: string) {
        await this.groupRepository.update(id, { name });
    }

    public async delete(id: number) {
        try {
            await this.groupRepository.delete(id);
        } catch (error) {
            throw new ConflictException(error);
        }
    }

    public async addUserGroup(nationalID: string, groupID: number) {
        try {
            const user = await this.userService.findUserWithNationalIDOrFail(nationalID);
            const group = await this.groupRepository.findOneOrFail({
                where: {
                    id: groupID
                }
            });
            group.users = [user];
            await this.groupRepository.save(group);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new NotFoundException(error.message);
            }
        }
    }
}
