import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { GeneratedImage } from 'src/image/entities/generated-image.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MENBER',
  USER = 'USER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  token: string;

  @Column('timestamp', { nullable: true })
  tokenGeneratedAt: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => GeneratedImage, (image) => image.generatedBy)
  images: GeneratedImage[];

  @ManyToMany(() => GeneratedImage, (image) => image.favoritedBy)
  favorites: GeneratedImage[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
