import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'COMPLETED';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'LOW' })
  priority: TaskPriority;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: TaskStatus;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  attachmentPath: string;

  @Column({ default: false })
  reminderSent: boolean;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
