import { User } from 'src/user/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryColumn()
  tokenId: string;

  @PrimaryColumn()
  familyId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.token, { nullable: false })
  user: User;
}
