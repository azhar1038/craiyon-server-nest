import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum GeneratorModel {
  DALLE = 'DALLE',
}

export enum ImageResolution {
  RES_256X256 = '256x256',
  RES_512X512 = '512x512',
  RES_1024X1024 = '1024x1024',
}

@Entity()
export class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  prompt: string;

  @Column()
  url: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: 0 })
  likes: number;

  @Column({
    type: 'enum',
    enum: GeneratorModel,
    default: GeneratorModel.DALLE,
  })
  model: GeneratorModel;

  @Column({
    type: 'enum',
    enum: ImageResolution,
    default: ImageResolution.RES_256X256,
  })
  resolution: ImageResolution;

  @CreateDateColumn({ type: 'timestamp' })
  generatedAt: Date;

  @ManyToOne(() => User, (user) => user.images, { nullable: false })
  generatedBy: User;

  @JoinTable()
  @ManyToMany(() => User, (user) => user.favorites)
  favoritedBy: User[];
}
