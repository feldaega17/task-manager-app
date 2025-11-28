import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // pemilik kategori
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Task, (task) => task.category)
  tasks: Task[];
}
